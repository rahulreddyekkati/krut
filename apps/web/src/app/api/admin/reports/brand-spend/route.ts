import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { getMarketTimezone, localTimeToUTC } from "@/lib/timezone";
import {
    buildDateMarkerRange,
    buildCycleAssignmentWhere,
    assignmentBelongsToCyclePreciseCheck,
    computeWorkedHours,
    computeBonus,
} from "@/lib/payroll";
import { buildRateResolver, getWorkerRate } from "@/lib/payRate";

/**
 * GET /api/admin/reports/brand-spend
 *
 * Returns total payroll cost (worked hours * pay rate + bonus + approved-recap
 * reimbursement) for shifts in the requested date range, broken down by the
 * per-shift brandAllocation tag ("KRUTO" | "MULUK" | "BOTH" | unallocated), AND by the
 * shift's own market + store chain ("byMarket": wine=Total Wine, wb=WB Liquors, other).
 * Same per-shift cost formula as /api/admin/reports/payroll, via the shared
 * apps/web/src/lib/payroll.ts helper.
 *
 * Query params: startDate, endDate (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
    try {
        await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        if (!startDate || !endDate) {
            return NextResponse.json({ error: "startDate and endDate required" }, { status: 400 });
        }

        // See apps/web/src/lib/payroll.ts for the full explanation: `date` is a UTC-midnight
        // calendar marker, not a real clock time, and must be compared against another
        // marker rather than a local-time end-of-day boundary (this route previously used
        // `end.setHours(23,59,59,999)`, the same bug class fixed elsewhere in the payroll
        // routes, just never applied here).
        const dateMarkerRange = buildDateMarkerRange(startDate, endDate);
        const DEFAULT_TZ = "America/Chicago";
        const PAD_MS = 3 * 60 * 60 * 1000;
        const paddedRealStart = new Date(localTimeToUTC(startDate, "00:00", DEFAULT_TZ).getTime() - PAD_MS);
        const paddedRealEnd = new Date(localTimeToUTC(endDate, "23:59", DEFAULT_TZ).getTime() + PAD_MS);

        const assignments = await prisma.jobAssignment.findMany({
            where: buildCycleAssignmentWhere(dateMarkerRange, paddedRealStart, paddedRealEnd),
            include: {
                // market/store here are the shift's OWN location (where the work actually
                // happened) — deliberately not the same source as `worker.market` below, which
                // is only used for the pre-existing timezone-boundary check and is left as-is
                // to avoid changing already-verified totals.
                job: { select: { bonus: true, market: { select: { name: true } }, store: { select: { chain: true } } } },
                worker: { select: { hourlyWage: true, market: { select: { name: true } } } },
                recap: { select: { status: true, reimbursement: true } }
            } as any
        });

        // Batched once for this report, not per-shift — see payRate.ts.
        const rateHistoryMap = await buildRateResolver((assignments as any[]).map((a) => a.workerId));

        let total = 0;
        let kruto = 0;
        let muluk = 0;
        let both = 0;
        let unallocated = 0;

        // Per-market breakdown, further split by store chain (wine/WB/other). Keyed by market
        // name; a shift whose job has no market/store on file (should not happen in practice,
        // but nothing in the schema guarantees it) lands in "Unknown Market" rather than being
        // silently dropped — this is what keeps Σ row.total === total a real invariant instead
        // of one that can quietly break on a stray row.
        const byMarketMap = new Map<string, { total: number; wine: number; wb: number; other: number }>();
        const bucketFor = (marketName: string) => {
            if (!byMarketMap.has(marketName)) byMarketMap.set(marketName, { total: 0, wine: 0, wb: 0, other: 0 });
            return byMarketMap.get(marketName)!;
        };

        for (const assignment of assignments as any[]) {
            const marketTz = assignment.worker?.market?.name ? getMarketTimezone(assignment.worker.market.name) : DEFAULT_TZ;
            const preciseStart = localTimeToUTC(startDate, "00:00", marketTz);
            const preciseEnd = localTimeToUTC(endDate, "23:59", marketTz);
            if (!assignmentBelongsToCyclePreciseCheck(assignment, preciseStart, preciseEnd)) continue;

            const hourlyWage = assignment.worker?.hourlyWage || 0;
            const workedHours = computeWorkedHours(assignment);
            // Price this shift at the rate in effect on its own date, not always today's
            // current rate — see apps/web/src/lib/payRate.ts.
            const rate = getWorkerRate(rateHistoryMap, assignment.workerId, assignment.date, hourlyWage);
            let cost = workedHours * rate;
            cost += computeBonus(assignment);
            if (assignment.recap?.status === "APPROVED") {
                cost += assignment.recap.reimbursement || 0;
            }

            total += cost;
            if (assignment.brandAllocation === "KRUTO") kruto += cost;
            else if (assignment.brandAllocation === "MULUK") muluk += cost;
            else if (assignment.brandAllocation === "BOTH") both += cost;
            // Unallocated shifts (brandAllocation null, or any unrecognized value) still cost
            // money and are counted in `total` above — track them in their own bucket too, so
            // kruto+muluk+both+unallocated always equals total instead of silently summing to
            // less than it whenever unallocated shifts exist (most historical data predates
            // the brandAllocation field, per its own schema comment).
            else unallocated += cost;

            const marketName = assignment.job?.market?.name || "Unknown Market";
            const chain = assignment.job?.store?.chain || "OTHER";
            const bucket = bucketFor(marketName);
            bucket.total += cost;
            if (chain === "TOTAL_WINE") bucket.wine += cost;
            else if (chain === "WB_LIQUORS") bucket.wb += cost;
            else bucket.other += cost;
        }

        const byMarket = [...byMarketMap.entries()]
            .map(([market, v]) => ({
                market,
                total: parseFloat(v.total.toFixed(2)),
                wine: parseFloat(v.wine.toFixed(2)),
                wb: parseFloat(v.wb.toFixed(2)),
                other: parseFloat(v.other.toFixed(2)),
            }))
            .sort((a, b) => b.total - a.total);

        return NextResponse.json({
            total: parseFloat(total.toFixed(2)),
            kruto: parseFloat(kruto.toFixed(2)),
            muluk: parseFloat(muluk.toFixed(2)),
            both: parseFloat(both.toFixed(2)),
            unallocated: parseFloat(unallocated.toFixed(2)),
            byMarket
        });
    } catch (error) {
        return handleApiError(error);
    }
}
