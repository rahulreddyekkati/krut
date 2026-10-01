import prisma from "@/lib/prisma";
import { getCurrentCycleDates, getPreviousCycleDates, getNextCycleDates, getDatesForWeekdays } from "@/lib/cycles";

const TZ = "America/Chicago";

// Native (no date-fns-tz) local-date computation — this file's rollover functions run on
// every GET request for a worker's assignments, and calling date-fns-tz's fromZonedTime/
// toZonedTime here previously caused Vercel 504 timeouts (see commit 1030c02). That fix
// replaced it with a hardcoded `Date.now() - 6h` offset, which assumes Chicago is always
// UTC-6 (CST) — wrong for roughly 8 months of the year when it's actually UTC-5 (CDT),
// silently misdating rollover-generated shifts near local midnight during DST. This uses
// Intl.DateTimeFormat instead (built into V8, no external library, so it doesn't carry
// whatever overhead caused the original timeout) and stays DST-correct year-round.
export function getLocalDateStrNative(date: Date, timeZone: string): string {
    // en-CA formats as YYYY-MM-DD directly.
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

type RecurringPattern = { jobId: string; weekday: number };

/**
 * Creates every dated recurring assignment the given (jobId, weekday) patterns call for
 * in [start, end] that doesn't exist yet — all in one transaction, so a crash or timeout
 * partway through can't leave a half-generated cycle behind. That matters because both
 * callers below treat "this cycle has at least one recurring row" as "fully generated"
 * and never revisit it.
 */
async function createMissingRecurringAssignments(
    workerId: string,
    patterns: RecurringPattern[],
    start: Date,
    end: Date
): Promise<void> {
    if (patterns.length === 0) return;
    const rangeStart = new Date(start); rangeStart.setUTCHours(0, 0, 0, 0);
    const rangeEnd = new Date(end); rangeEnd.setUTCHours(23, 59, 59, 999);
    const dayKey = (jobId: string, d: Date) => `${jobId}|${d.toISOString().slice(0, 10)}`;

    // Two attempts: a concurrent call for the same worker can win the race between the
    // "what's missing" read and the insert. The @@unique constraint on (workerId, jobId,
    // date) turns that into a P2002 (rolling this whole batch back) instead of duplicate
    // shifts — so re-read what's missing now and try once more.
    for (let attempt = 0; attempt < 2; attempt++) {
        const existing = await prisma.jobAssignment.findMany({
            where: {
                workerId,
                jobId: { in: patterns.map(p => p.jobId) },
                date: { gte: rangeStart, lte: rangeEnd }
            },
            select: { jobId: true, date: true }
        });
        const existingKeys = new Set(existing.filter(a => a.date).map(a => dayKey(a.jobId, new Date(a.date!))));

        const missing: { jobId: string; date: Date }[] = [];
        for (const { jobId, weekday } of patterns) {
            for (const d of getDatesForWeekdays([weekday], rangeStart, rangeEnd)) {
                if (!existingKeys.has(dayKey(jobId, d))) missing.push({ jobId, date: d });
            }
        }
        console.log(`[ROLLOVER] ${missing.length} assignment(s) to create for workerId: ${workerId}`);
        if (missing.length === 0) return;

        try {
            await prisma.$transaction(async (tx) => {
                for (const m of missing) {
                    await tx.jobAssignment.create({
                        data: { workerId, jobId: m.jobId, date: m.date, isRecurring: true }
                    });
                }
            });
            return;
        } catch (e) {
            if ((e as any).code !== "P2002") throw e;
            console.log("[ROLLOVER] lost a race with a concurrent call — re-checking what's still missing");
        }
    }
}

/**
 * Called at the start of each GET request for a worker's assignments.
 * If the current cycle has no recurring assignments yet, it looks at the
 * previous cycle's recurring assignments and recreates the same patterns.
 * This is the auto-rollover mechanism — no external cron needed.
 */
export async function ensureCurrentCycleAssignments(workerId: string): Promise<void> {
    console.log(`[ROLLOVER] ensureCurrentCycleAssignments started for workerId: ${workerId}`);
    const currentCycle = getCurrentCycleDates();
    const prevCycle = getPreviousCycleDates();
    console.log(`[ROLLOVER] Current cycle: ${currentCycle.start.toISOString()} - ${currentCycle.end.toISOString()}`);
    console.log(`[ROLLOVER] Prev cycle: ${prevCycle.start.toISOString()} - ${prevCycle.end.toISOString()}`);

    // Fast path: current cycle already has recurring assignments — nothing to do
    console.log("[ROLLOVER] querying currentCount...");
    const currentCount = await prisma.jobAssignment.count({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: currentCycle.start, lte: currentCycle.end }
        }
    });
    console.log(`[ROLLOVER] currentCount: ${currentCount}`);
    if (currentCount > 0) return;

    // Look at previous cycle's recurring assignments as the template.
    // Exclude jobs that have their own fixed `date` set — those are genuinely one-off
    // shifts (e.g. a single bonus assignment). Their assignment happening to be flagged
    // isRecurring:true doesn't mean the job itself should keep spawning weekly copies
    // forever; only jobs with no fixed date are true ongoing recurring commitments.
    console.log("[ROLLOVER] querying prevAssignments...");
    const prevAssignments = await prisma.jobAssignment.findMany({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: prevCycle.start, lte: prevCycle.end },
            job: { date: null }
        },
        select: { jobId: true, date: true }
    });
    console.log(`[ROLLOVER] prevAssignments count: ${prevAssignments.length}`);
    if (prevAssignments.length === 0) return;

    // Extract unique (jobId, weekday) patterns
    const patterns = new Map<string, { jobId: string; weekday: number }>();
    for (const a of prevAssignments) {
        if (!a.date) continue;
        const weekday = new Date(a.date).getUTCDay();
        const key = `${a.jobId}-${weekday}`;
        if (!patterns.has(key)) {
            patterns.set(key, { jobId: a.jobId, weekday });
        }
    }
    console.log(`[ROLLOVER] unique patterns to roll over: ${patterns.size}`);

    // Create current cycle assignments for each pattern, skipping dates that already exist.
    // Never generate a date before today — a late-running rollover shouldn't backfill
    // already-past days as bogus unclocked "Missed" shifts.
    const dateStr = getLocalDateStrNative(new Date(), TZ);
    const todayUTCMidnight = new Date(dateStr + "T00:00:00.000Z");
    const rangeStart = todayUTCMidnight > currentCycle.start ? todayUTCMidnight : currentCycle.start;
    console.log(`[ROLLOVER] rangeStart resolved to: ${rangeStart.toISOString()}`);

    await createMissingRecurringAssignments(workerId, Array.from(patterns.values()), rangeStart, currentCycle.end);
    console.log("[ROLLOVER] ensureCurrentCycleAssignments completed.");
}

/**
 * Called at the start of each GET request for a worker's assignments.
 * Materializes the next cycle's recurring shifts ahead of time (using the current
 * cycle's patterns as the template) so workers always see two pay cycles of shifts
 * and can plan ahead of the cycle actually rolling over.
 */
export async function ensureNextCyclePreview(workerId: string): Promise<void> {
    console.log(`[ROLLOVER] ensureNextCyclePreview started for workerId: ${workerId}`);
    const currentCycle = getCurrentCycleDates();
    const nextCycle = getNextCycleDates();

    // Fast path: next cycle already has recurring assignments — nothing to do.
    // Deliberately not reconciled per-date after that: doing so would bring back a
    // next-cycle shift an admin deleted on every single load.
    console.log("[ROLLOVER] querying nextCount...");
    const nextCount = await prisma.jobAssignment.count({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: nextCycle.start, lte: nextCycle.end }
        }
    });
    console.log(`[ROLLOVER] nextCount: ${nextCount}`);
    if (nextCount > 0) return;

    // Use the CURRENT cycle's recurring assignments as the template for next cycle.
    // Same exclusion as ensureCurrentCycleAssignments — a job with its own fixed date
    // is a one-off, not an ongoing recurring commitment.
    console.log("[ROLLOVER] querying currentAssignments...");
    const currentAssignments = await prisma.jobAssignment.findMany({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: currentCycle.start, lte: currentCycle.end },
            job: { date: null }
        },
        select: { jobId: true, date: true }
    });
    console.log(`[ROLLOVER] currentAssignments count: ${currentAssignments.length}`);
    if (currentAssignments.length === 0) return;

    const patterns = new Map<string, { jobId: string; weekday: number }>();
    for (const a of currentAssignments) {
        if (!a.date) continue;
        const weekday = new Date(a.date).getUTCDay();
        const key = `${a.jobId}-${weekday}`;
        if (!patterns.has(key)) {
            patterns.set(key, { jobId: a.jobId, weekday });
        }
    }
    console.log(`[ROLLOVER] unique patterns for next cycle preview: ${patterns.size}`);

    await createMissingRecurringAssignments(workerId, Array.from(patterns.values()), nextCycle.start, nextCycle.end);
    console.log("[ROLLOVER] ensureNextCyclePreview completed.");
}
