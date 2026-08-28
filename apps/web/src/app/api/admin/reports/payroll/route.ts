import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { resolveTimezone, localTimeToUTC, getMarketTimezone } from "@/lib/timezone";
import {
    buildDateMarkerRange,
    buildCycleAssignmentWhere,
    assignmentBelongsToCyclePreciseCheck,
    accumulatePayrollTotals,
    computePayFiguresFromWage,
    resolveReleasesStillOwned,
    sumReleaseHoursToSubtract,
} from "@/lib/payroll";
import { buildRateResolver, getWorkerRate } from "@/lib/payRate";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const { searchParams } = new URL(request.url);
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");

        if (!startDateStr || !endDateStr) {
            throw new AppError("Missing date range", 400);
        }

        // Admin's own browser timezone (sent by admin/reports/page.tsx) — used as the
        // fallback/default market timezone below when a user has no market on file.
        const tz = resolveTimezone(request);
        const startDate = localTimeToUTC(startDateStr, "00:00", tz);
        const endDate = localTimeToUTC(endDateStr, "23:59", tz);

        if (endDate <= startDate) {
            throw new AppError("endDate must be after startDate", 400);
        }

        // JobAssignment.date is stored as a pure calendar marker -- UTC midnight of the
        // LOCAL date, not a real clock time. See apps/web/src/lib/payroll.ts for the full
        // explanation; comparisons against it must use another marker, never a real-time
        // boundary.
        const dateMarkerRange = buildDateMarkerRange(startDateStr, endDateStr);

        // A single query can't apply a different exact timezone boundary per market, so this
        // uses a generously padded window here (safe over-fetch) and does the precise
        // per-market re-check in the per-user loop below via assignmentBelongsToCyclePreciseCheck.
        const PAD_MS = 3 * 60 * 60 * 1000; // 3h covers the Pacific-to-Central spread this app supports
        const paddedRealStart = new Date(startDate.getTime() - PAD_MS);
        const paddedRealEnd = new Date(endDate.getTime() + PAD_MS);

        // MAJ-15: Market Managers can only see their own market — override any query param
        const where: any = {};
        if (user.role === "MARKET_MANAGER") {
            where.marketId = user.managedMarketId || user.marketId;
            where.role = { not: "ADMIN" };
        }

        const users = await prisma.user.findMany({
            where,
            include: {
                market: { select: { name: true } },
                jobs: {
                    where: buildCycleAssignmentWhere(dateMarkerRange, paddedRealStart, paddedRealEnd),
                    include: {
                        job: true,
                        recap: { include: { skus: true } }
                    } as any
                }
            }
        });

        // 1. Fetch approved releases in this range. ReleaseRequest.date is the same kind of
        // UTC-midnight marker as JobAssignment.date -- marker-vs-marker only.
        const approvedReleases = await prisma.releaseRequest.findMany({
            where: {
                status: "APPROVED",
                date: { gte: dateMarkerRange.dateMarkerStart, lte: dateMarkerRange.dateMarkerEnd }
            },
            include: {
                job: { select: { startTimeStr: true, endTimeStr: true } }
            }
        });

        const releasesByWorker: Record<string, any[]> = {};
        approvedReleases.forEach(rel => {
            if (!releasesByWorker[rel.workerId]) releasesByWorker[rel.workerId] = [];
            releasesByWorker[rel.workerId].push(rel);
        });

        // Batched once for the whole report — see payroll.ts for why a release's hours must
        // only be subtracted when its assignment is still actually owned by the releaser.
        const releaseStillOwned = await resolveReleasesStillOwned(approvedReleases);

        // Batched once for the whole report, not per-user/per-shift — see payRate.ts.
        const rateHistoryMap = await buildRateResolver(users.map((u: any) => u.id));

        const payrollData = users.map((user: any) => {
            // Precise per-market real-time boundary for this user's own market, used only to
            // re-check the rare date-less assignment that matched via the padded window above.
            const marketTz = user.market?.name ? getMarketTimezone(user.market.name) : tz;
            const preciseStart = localTimeToUTC(startDateStr, "00:00", marketTz);
            const preciseEnd = localTimeToUTC(endDateStr, "23:59", marketTz);

            const relevantAssignments = (user.jobs as any[]).filter((a) =>
                assignmentBelongsToCyclePreciseCheck(a, preciseStart, preciseEnd)
            );

            const hourlyWage = user.hourlyWage || 0;
            const totals = accumulatePayrollTotals(
                relevantAssignments,
                (a) => getWorkerRate(rateHistoryMap, user.id, a.date, hourlyWage)
            );

            // Subtract releases — only those still owned by this worker (see payroll.ts).
            let totalAssignedHours = totals.totalAssignedHours;
            const userReleases = releasesByWorker[user.id] || [];
            totalAssignedHours -= sumReleaseHoursToSubtract(userReleases, releaseStillOwned);

            const { payForCycle, taxablePay } = computePayFiguresFromWage(totals);

            return {
                id: user.id,
                name: user.name || user.email,
                role: user.role,
                location: user.market?.name || "N/A",
                payHr: hourlyWage,
                worked: parseFloat(totals.totalWorkedHours.toFixed(2)),
                assigned: parseFloat(Math.max(0, totalAssignedHours).toFixed(2)),
                reimb: parseFloat(totals.totalReimbursements.toFixed(2)),
                bottlesSold: totals.totalBottlesSold,
                payForCycle: parseFloat(payForCycle.toFixed(2)),
                taxablePay: parseFloat(taxablePay.toFixed(2))
            } as any;
        });

        return NextResponse.json(payrollData);
    } catch (error) {
        return handleApiError(error);
    }
}
