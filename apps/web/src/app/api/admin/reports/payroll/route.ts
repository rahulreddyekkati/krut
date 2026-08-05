import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { resolveTimezone, localTimeToUTC } from "@/lib/timezone";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const { searchParams } = new URL(request.url);
        const startDateStr = searchParams.get("startDate");
        const endDateStr = searchParams.get("endDate");

        if (!startDateStr || !endDateStr) {
            throw new AppError("Missing date range", 400);
        }

        const tz = resolveTimezone(request);
        const startDate = localTimeToUTC(startDateStr, "00:00", tz);
        const endDate = localTimeToUTC(endDateStr, "23:59", tz);

        if (endDate <= startDate) {
            throw new AppError("endDate must be after startDate", 400);
        }

        // JobAssignment.date is stored as a pure calendar marker -- UTC midnight of the
        // LOCAL date, not a real clock time (e.g. Aug 1 is exactly 2026-08-01T00:00:00.000Z,
        // always, regardless of timezone). Comparing that against `endDate` above (a real
        // end-of-day boundary correctly resolved into the store's timezone, which lands
        // several hours INTO the next UTC calendar day) systematically leaks the next day's
        // assignments into every cycle: e.g. an Aug 1 assignment's midnight marker sits
        // before "Jul 31 23:59 America/Chicago" once that's converted to UTC (~Aug 1 04:59Z),
        // even though it's conceptually a different day entirely. Confirmed in production:
        // this caused a "Jul 16 - Jul 31" cycle to silently include an Aug 1 shift.
        // The `date` marker must be compared against another marker, not a real-time boundary.
        const dateMarkerStart = new Date(startDateStr + "T00:00:00.000Z");
        const dateMarkerEnd = new Date(endDateStr + "T00:00:00.000Z");

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
                    where: {
                        OR: [
                            { date: { gte: dateMarkerStart, lte: dateMarkerEnd } },
                            { clockIn: { gte: startDate, lte: endDate } }
                        ]
                    },
                    include: {
                        job: true,
                        recap: { include: { skus: true } }
                    } as any
                }
            }
        });

        // 1. Fetch approved releases in this range
        const approvedReleases = await prisma.releaseRequest.findMany({
            where: {
                status: "APPROVED",
                date: { gte: dateMarkerStart, lte: dateMarkerEnd }
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

        const payrollData = users.map((user: any) => {
            let totalWorkedHours = 0;
            let totalAssignedHours = 0;
            let totalReimbursements = 0;
            let totalBonus = 0;
            let totalBottlesSold = 0;

            user.jobs.forEach((assignment: any) => {
                const job = assignment.job;
                
                // --- Assigned Hours Calculation ---
                if (job.startTimeStr && job.endTimeStr) {
                    const [sh, sm] = job.startTimeStr.split(":").map(Number);
                    const [eh, em] = job.endTimeStr.split(":").map(Number);
                    let durationMins = (eh * 60 + em) - (sh * 60 + sm);
                    if (durationMins < 0) durationMins += 24 * 60;
                    totalAssignedHours += (durationMins / 60);
                }

                // --- Worked Hours Calculation ---
                if (typeof (assignment as any).workedHours === 'number') {
                    totalWorkedHours += (assignment as any).workedHours;
                } else if (assignment.clockIn && assignment.clockOut) {
                    const diffMins = (new Date(assignment.clockOut).getTime() - new Date(assignment.clockIn).getTime()) / 60000;
                    const breakMins = (assignment as any).breakTimeMinutes || 0;
                    totalWorkedHours += Math.max(0, (diffMins - breakMins) / 60);
                }

                // --- Reimbursement & Bottles Sold (approved recaps only) ---
                if (assignment.recap?.status === "APPROVED") {
                    totalReimbursements += (assignment.recap.reimbursement || 0);
                    (assignment.recap.skus || []).forEach((sku: any) => {
                        totalBottlesSold += sku.bottlesSold || 0;
                    });
                }

                // --- Bonus (per-shift override, plus legacy job-level bonus) ---
                // Kept separate from totalReimbursements — bonus is taxable wages,
                // reimbursement isn't, and "Taxable Pay" below depends on that distinction.
                if (assignment.clockIn) {
                    if (assignment.bonus) totalBonus += assignment.bonus;
                    if (job.bonus) totalBonus += job.bonus;
                }
            });

            // Subtract releases
            const userReleases = releasesByWorker[user.id] || [];
            userReleases.forEach(rel => {
                const [sh, sm] = rel.job.startTimeStr.split(":").map(Number);
                const [eh, em] = rel.job.endTimeStr.split(":").map(Number);
                let durationMins = (eh * 60 + em) - (sh * 60 + sm);
                if (durationMins < 0) durationMins += 24 * 60;
                totalAssignedHours -= (durationMins / 60);
            });

            const hourlyWage = user.hourlyWage || 0;
            const payForCycle = (totalWorkedHours * hourlyWage) + totalReimbursements + totalBonus;
            // Everything except reimbursement — wages and bonus are both taxable income,
            // reimbursement (expense repayment) isn't.
            const taxablePay = payForCycle - totalReimbursements;

            return {
                id: user.id,
                name: user.name || user.email,
                role: user.role,
                location: user.market?.name || "N/A",
                payHr: hourlyWage,
                worked: parseFloat(totalWorkedHours.toFixed(2)),
                assigned: parseFloat(Math.max(0, totalAssignedHours).toFixed(2)),
                reimb: parseFloat(totalReimbursements.toFixed(2)),
                bottlesSold: totalBottlesSold,
                payForCycle: parseFloat(payForCycle.toFixed(2)),
                taxablePay: parseFloat(taxablePay.toFixed(2))
            } as any;
        });

        return NextResponse.json(payrollData);
    } catch (error) {
        return handleApiError(error);
    }
}
