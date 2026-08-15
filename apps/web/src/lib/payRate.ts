import prisma from "@/lib/prisma";

// Effective-dated pay rate resolution, used by every surface that turns worked hours
// into money:
//   - apps/web/src/app/api/admin/reports/payroll/route.ts              (summary table)
//   - apps/web/src/app/admin/reports/payroll/print/page.tsx            (print-all view)
//   - apps/web/src/app/api/admin/reports/payroll/user/[id]/csv/route.ts (per-worker CSV)
//   - apps/web/src/app/admin/reports/payroll/user/[id]/page.tsx        (per-worker drill-down)
//   - apps/web/src/app/api/admin/reports/brand-spend/route.ts          (brand cost report)
//   - apps/web/src/app/api/users/route.ts                              (admin-users pay column,
//     which also feeds the PDF export and the mobile admin pay estimate)
//   - apps/web/src/app/api/users/[id]/route.ts (PATCH)                 (recomputes the live
//     "rate as of today" scalar on every wage edit)
//
// Before a shift is priced, every one of the surfaces above must resolve "what rate was in
// effect on this shift's date" through getWorkerRate/resolveRateForDate below — never by
// multiplying hours against a user's raw, current hourlyWage. Routing everything through this
// one module is what keeps a future 8th report surface from silently reintroducing the "always
// uses today's rate" bug this file exists to fix. See PayRateHistory in prisma/schema.prisma.

export type RateHistoryRow = { hourlyWage: number; effectiveFrom: Date };

/**
 * Batch-fetch pay rate history for a set of workers — call ONCE per report generation
 * (never per-shift or per-assignment), then look up each worker's rows from the returned
 * Map via getWorkerRate. Rows come back ascending by effectiveFrom per worker.
 */
export async function buildRateResolver(workerIds: string[]): Promise<Map<string, RateHistoryRow[]>> {
    const map = new Map<string, RateHistoryRow[]>();
    const uniqueIds = [...new Set(workerIds)];
    if (uniqueIds.length === 0) return map;

    const rows = await prisma.payRateHistory.findMany({
        where: { workerId: { in: uniqueIds } },
        orderBy: { effectiveFrom: "asc" },
        select: { workerId: true, hourlyWage: true, effectiveFrom: true },
    });

    for (const r of rows) {
        if (!map.has(r.workerId)) map.set(r.workerId, []);
        map.get(r.workerId)!.push({ hourlyWage: r.hourlyWage, effectiveFrom: r.effectiveFrom });
    }
    return map;
}

/**
 * Resolve the rate in effect for a given date, given one worker's (ascending) history rows.
 *
 * Rule: the latest row with effectiveFrom <= date. If date predates every row, fall back to
 * the earliest row (see below for why that's safe). If there's no history at all, fall back
 * to currentHourlyWage — identical to pre-feature behavior for a worker who's never had a
 * rate change tracked through this flow.
 *
 * Why the earliest-row fallback is safe: "date predates every row" can only happen when
 * pricing a shift dated before the worker's account even existed (e.g. imported data) —
 * never when resolving "today's" live rate for a worker whose only history row is a
 * future-dated raise. That's because PATCH /api/users/[id] always lazily backfills a
 * createdAt-anchored base row before writing any admin-submitted row, and rejects any
 * submitted effectiveFrom earlier than createdAt — so the earliest row for any touched
 * worker is always anchored at-or-before "today," never in the future.
 */
export function resolveRateForDate(
    history: RateHistoryRow[] | undefined,
    date: Date | string | null,
    currentHourlyWage: number | null
): number {
    const fallback = currentHourlyWage || 0;
    if (!history || history.length === 0 || !date) return fallback;

    const target = new Date(date).getTime();
    let resolved: number | null = null;
    for (const row of history) { // ascending order
        if (row.effectiveFrom.getTime() <= target) resolved = row.hourlyWage;
        else break;
    }
    return resolved ?? history[0].hourlyWage; // predates earliest row → earliest known rate
}

/**
 * Thin convenience wrapper combining a Map lookup + resolveRateForDate — the one-liner every
 * call site should use (`getWorkerRate(rates, worker.id, a.date, worker.hourlyWage)`) instead
 * of re-deriving the "look up this worker's rows, then resolve" pattern by hand.
 */
export function getWorkerRate(
    resolverMap: Map<string, RateHistoryRow[]>,
    workerId: string,
    date: Date | string | null,
    currentHourlyWage: number | null
): number {
    return resolveRateForDate(resolverMap.get(workerId), date, currentHourlyWage);
}
