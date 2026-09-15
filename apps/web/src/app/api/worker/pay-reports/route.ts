import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates, getClosedCycles, getCycleDisplayName, type CycleDates } from "@/lib/cycles";
import { getMarketTimezone, localTimeToUTC, toUTCLocalDateStr } from "@/lib/timezone";
import {
    buildDateMarkerRange,
    buildCycleAssignmentWhere,
    assignmentBelongsToCyclePreciseCheck,
    computeAssignedHours,
    computeWorkedHours,
    computeBonus,
    hasWithheldHours,
    accumulatePayrollTotals,
    computePayFiguresFromWage,
    type PayrollAssignmentLike,
} from "@/lib/payroll";
import { buildRateResolver, getWorkerRate } from "@/lib/payRate";

// Worker-facing "my last 3 pay reports" endpoint — self-scoped to the authenticated user via
// getSession(), same pattern as apps/web/src/app/api/jobs/my-shifts/route.ts and
// apps/web/src/app/api/worker/pending-recaps/route.ts. Deliberately NOT gated by
// requireAuth(request, ["ADMIN", ...]) — every authenticated user can see their own pay,
// there is no id route param to authorize against another user's data at all.
//
// Reuses the exact same shared payroll/pay-rate/cycle helpers as every admin payroll
// surface (see apps/web/src/lib/payroll.ts and payRate.ts) rather than re-deriving any pay
// math — this is the 5th (worker-facing) consumer of those modules, adapted from the
// per-worker admin drill-down (apps/web/src/app/admin/reports/payroll/user/[id]/page.tsx)
// and CSV export (apps/web/src/app/api/admin/reports/payroll/user/[id]/csv/route.ts), but
// looped over 3 cycles (current in-progress + 2 most recently closed) instead of one
// admin-chosen date range, and returning JSON for the mobile client to render natively
// instead of HTML/CSV.
//
// Note on failure behavior: all 3 cycles are computed in this one request/response. If any
// one cycle's query or rate resolution throws, the whole request fails (500) rather than
// silently returning fewer than 3 cycles — for payroll data, a partial response with no
// visible indication a cycle is missing is worse than a clear, retryable error.

const DEFAULT_TZ = "America/Chicago";
const PAD_MS = 3 * 60 * 60 * 1000;

interface ShiftRow {
    id: string;
    date: string | null;
    store: string;
    market: string | null;
    storeTimezone: string;
    clockIn: string | null;
    clockOut: string | null;
    breakTimeMinutes: number;
    assignedHours: number;
    workedHours: number;
    rate: number;
    reimbursement: number;
    reimbursementPending: boolean;
    hoursPending: boolean;
    bonus: number;
    shiftPay: number;
    totalPay: number;
    taxablePay: number;
}

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const userId = session.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { market: true },
        });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const hourlyWage = user.hourlyWage || 0;
        const isWorker = user.role === "WORKER";

        // Last 3 cycles = the current in-progress one + the 2 most recently closed —
        // guarantees identical boundaries to every other payroll surface in the app.
        const cycleDefs: (CycleDates & { isCurrent: boolean })[] = [
            { ...getCurrentCycleDates(), isCurrent: true },
            ...getClosedCycles(2).map((c) => ({ start: c.start, end: c.end, isCurrent: false })),
        ];

        const marketTz = user.market?.name ? getMarketTimezone(user.market.name) : DEFAULT_TZ;

        // Batched once for this report, not per-shift/per-cycle — see payRate.ts.
        const rateHistoryMap = await buildRateResolver([userId]);

        const cycles = await Promise.all(
            cycleDefs.map(async (cycle) => {
                const startStr = toUTCLocalDateStr(cycle.start);
                const endStr = toUTCLocalDateStr(cycle.end);

                // See apps/web/src/lib/payroll.ts for the full explanation of the date-marker
                // vs real-time boundary distinction, and why a fixed `date` marker must be
                // the single source of truth for cycle membership.
                const dateMarkerRange = buildDateMarkerRange(startStr, endStr);
                const paddedRealStart = new Date(localTimeToUTC(startStr, "00:00", DEFAULT_TZ).getTime() - PAD_MS);
                const paddedRealEnd = new Date(localTimeToUTC(endStr, "23:59", DEFAULT_TZ).getTime() + PAD_MS);
                const preciseStart = localTimeToUTC(startStr, "00:00", marketTz);
                const preciseEnd = localTimeToUTC(endStr, "23:59", marketTz);

                const assignments = await prisma.jobAssignment.findMany({
                    where: {
                        workerId: userId,
                        ...buildCycleAssignmentWhere(dateMarkerRange, paddedRealStart, paddedRealEnd),
                    },
                    include: {
                        job: { include: { store: { include: { market: true } } } },
                        recap: true,
                    },
                    orderBy: { date: "asc" },
                });

                const relevantAssignments = assignments.filter((a) =>
                    assignmentBelongsToCyclePreciseCheck(a, preciseStart, preciseEnd)
                );

                const rateForAssignment = (a: PayrollAssignmentLike) =>
                    getWorkerRate(rateHistoryMap, userId, a.date, hourlyWage);

                const shifts: ShiftRow[] = relevantAssignments.map((a) => {
                    const assignedHours = computeAssignedHours(a);
                    const workedHours = computeWorkedHours(a);
                    const bonus = computeBonus(a);
                    const recapStatus = a.recap?.status ?? null;
                    const rawReimb = a.recap?.reimbursement || 0;
                    const reimbursement = recapStatus === "APPROVED" ? rawReimb : 0;
                    const reimbursementPending = !!recapStatus && recapStatus !== "APPROVED" && rawReimb > 0;
                    const hoursPending = hasWithheldHours(a);
                    const rate = rateForAssignment(a);
                    const shiftPay = workedHours * rate;
                    const totalPay = shiftPay + reimbursement + bonus;
                    const taxablePay = shiftPay + bonus;

                    return {
                        id: a.id,
                        date: a.date ? a.date.toISOString() : null,
                        store: a.job.store.name,
                        market: a.job.store.market?.name ?? null,
                        storeTimezone: a.job.store.timezone,
                        clockIn: a.clockIn ? a.clockIn.toISOString() : null,
                        clockOut: a.clockOut ? a.clockOut.toISOString() : null,
                        breakTimeMinutes: a.breakTimeMinutes || 0,
                        assignedHours,
                        workedHours,
                        rate,
                        reimbursement,
                        reimbursementPending,
                        hoursPending,
                        bonus,
                        shiftPay,
                        totalPay,
                        taxablePay,
                    };
                });

                // Cycle totals go through the same shared accumulator/figures helpers every
                // other payroll surface uses, rather than hand-summing the shift rows above —
                // keeps this endpoint from silently drifting from the shared totals math.
                const totals = accumulatePayrollTotals(relevantAssignments, rateForAssignment);
                const { payForCycle, taxablePay } = computePayFiguresFromWage(totals);

                const cycleLabel = getCycleDisplayName(cycle) + (cycle.isCurrent ? " (Current)" : "");

                return {
                    cycleId: `${startStr}_${endStr}`,
                    cycleLabel,
                    startDate: startStr,
                    endDate: endStr,
                    isCurrent: cycle.isCurrent,
                    summary: {
                        assignedHours: totals.totalAssignedHours,
                        workedHours: totals.totalWorkedHours,
                        currentHourlyWage: hourlyWage,
                        reimbursement: totals.totalReimbursements,
                        bonus: totals.totalBonus,
                        totalWage: totals.totalWage || 0,
                        // Matches the admin per-user report's existing role gate — a
                        // non-WORKER account (e.g. a manager testing the mobile app) doesn't
                        // have a meaningful hourly pay-for-cycle figure.
                        totalPayForCycle: isWorker ? payForCycle : null,
                        taxablePay: isWorker ? taxablePay : null,
                    },
                    shifts,
                };
            })
        );

        return NextResponse.json({
            employee: { name: user.name, email: user.email, role: user.role },
            generatedAt: new Date().toISOString(),
            cycles,
        });
    } catch (error) {
        console.error("Worker pay-reports error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
