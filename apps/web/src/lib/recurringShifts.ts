import prisma from "@/lib/prisma";
import { getCurrentCycleDates, getPreviousCycleDates, getNextCycleDates, getDatesForWeekdays } from "@/lib/cycles";

const NEXT_CYCLE_PREVIEW_DAYS = 4;
const TZ = "America/Chicago";

// Native (no date-fns-tz) local-date computation — this file's rollover functions run on
// every GET request for a worker's assignments, and calling date-fns-tz's fromZonedTime/
// toZonedTime here previously caused Vercel 504 timeouts (see commit 1030c02). That fix
// replaced it with a hardcoded `Date.now() - 6h` offset, which assumes Chicago is always
// UTC-6 (CST) — wrong for roughly 8 months of the year when it's actually UTC-5 (CDT),
// silently misdating rollover-generated shifts near local midnight during DST. This uses
// Intl.DateTimeFormat instead (built into V8, no external library, so it doesn't carry
// whatever overhead caused the original timeout) and stays DST-correct year-round.
function getLocalDateStrNative(date: Date, timeZone: string): string {
    // en-CA formats as YYYY-MM-DD directly.
    return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
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
    
    for (const { jobId, weekday } of patterns.values()) {
        const dates = getDatesForWeekdays([weekday], rangeStart, currentCycle.end);
        console.log(`[ROLLOVER] weekday ${weekday} has dates:`, dates.map(d => d.toISOString()));
        for (const d of dates) {
            const dayStart = new Date(d); dayStart.setUTCHours(0, 0, 0, 0);
            const dayEnd = new Date(d); dayEnd.setUTCHours(23, 59, 59, 999);
            console.log(`[ROLLOVER] checking existing for date ${d.toISOString()} (job: ${jobId})...`);
            const existing = await prisma.jobAssignment.findFirst({
                where: { workerId, jobId, date: { gte: dayStart, lte: dayEnd } }
            });
            console.log(`[ROLLOVER] existing date ${d.toISOString()}: ${existing ? "FOUND" : "NOT FOUND"}`);
            if (!existing) {
                console.log(`[ROLLOVER] creating assignment for date ${d.toISOString()}...`);
                try {
                    await prisma.jobAssignment.create({
                        data: { workerId, jobId, date: d, isRecurring: true }
                    });
                    console.log(`[ROLLOVER] created assignment for date ${d.toISOString()}`);
                } catch (e) {
                    // A concurrent rollover call for the same worker can win the race between
                    // this "not found" check and the create — the @@unique constraint on
                    // (workerId, jobId, date) turns what would silently become a duplicate
                    // shift into a P2002 here instead, which just means the other call already
                    // created it. Nothing more to do.
                    if ((e as any).code !== "P2002") throw e;
                    console.log(`[ROLLOVER] assignment for date ${d.toISOString()} already created by a concurrent call — skipping`);
                }
            }
        }
    }
    console.log("[ROLLOVER] ensureCurrentCycleAssignments completed.");
}

/**
 * Called at the start of each GET request for a worker's assignments.
 * Once we're within NEXT_CYCLE_PREVIEW_DAYS of the next cycle's start, materialize
 * that cycle's recurring shifts early (using the current cycle's patterns as the
 * template) so workers can see/plan them ahead of the cycle actually rolling over.
 */
export async function ensureNextCyclePreview(workerId: string): Promise<void> {
    console.log(`[ROLLOVER] ensureNextCyclePreview started for workerId: ${workerId}`);
    const currentCycle = getCurrentCycleDates();
    const nextCycle = getNextCycleDates();

    const previewStart = new Date(nextCycle.start);
    previewStart.setDate(previewStart.getDate() - NEXT_CYCLE_PREVIEW_DAYS);
    console.log(`[ROLLOVER] previewStart: ${previewStart.toISOString()}`);
    if (new Date() < previewStart) {
        console.log("[ROLLOVER] Not within preview range. Skipping next cycle preview.");
        return;
    }

    // Fast path: next cycle already has recurring assignments — nothing to do
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

    for (const { jobId, weekday } of patterns.values()) {
        const dates = getDatesForWeekdays([weekday], nextCycle.start, nextCycle.end);
        for (const d of dates) {
            const dayStart = new Date(d); dayStart.setUTCHours(0, 0, 0, 0);
            const dayEnd = new Date(d); dayEnd.setUTCHours(23, 59, 59, 999);
            console.log(`[ROLLOVER] checking existing next-cycle for date ${d.toISOString()} (job: ${jobId})...`);
            const existing = await prisma.jobAssignment.findFirst({
                where: { workerId, jobId, date: { gte: dayStart, lte: dayEnd } }
            });
            console.log(`[ROLLOVER] existing next-cycle date ${d.toISOString()}: ${existing ? "FOUND" : "NOT FOUND"}`);
            if (!existing) {
                console.log(`[ROLLOVER] creating next-cycle preview assignment for date ${d.toISOString()}...`);
                try {
                    await prisma.jobAssignment.create({
                        data: { workerId, jobId, date: d, isRecurring: true }
                    });
                    console.log(`[ROLLOVER] created next-cycle preview assignment for date ${d.toISOString()}`);
                } catch (e) {
                    // See matching comment in ensureCurrentCycleAssignments — a concurrent call
                    // for the same worker can win this exact race; the unique constraint just
                    // turns it into a no-op here instead of a duplicate shift.
                    if ((e as any).code !== "P2002") throw e;
                    console.log(`[ROLLOVER] next-cycle assignment for date ${d.toISOString()} already created by a concurrent call — skipping`);
                }
            }
        }
    }
    console.log("[ROLLOVER] ensureNextCyclePreview completed.");
}
