import prisma from "@/lib/prisma";
import { getCurrentCycleDates, getPreviousCycleDates, getNextCycleDates, getDatesForWeekdays } from "@/lib/cycles";
import { toLocalDateStr } from "@/lib/timezone";

const NEXT_CYCLE_PREVIEW_DAYS = 4;
const TZ = "America/Chicago";

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

    // Look at previous cycle's recurring assignments as the template
    console.log("[ROLLOVER] querying prevAssignments...");
    const prevAssignments = await prisma.jobAssignment.findMany({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: prevCycle.start, lte: prevCycle.end }
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
    const chicagoNow = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const dateStr = chicagoNow.toISOString().split("T")[0];
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
                await prisma.jobAssignment.create({
                    data: { workerId, jobId, date: d, isRecurring: true }
                });
                console.log(`[ROLLOVER] created assignment for date ${d.toISOString()}`);
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

    // Use the CURRENT cycle's recurring assignments as the template for next cycle
    console.log("[ROLLOVER] querying currentAssignments...");
    const currentAssignments = await prisma.jobAssignment.findMany({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: currentCycle.start, lte: currentCycle.end }
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
                await prisma.jobAssignment.create({
                    data: { workerId, jobId, date: d, isRecurring: true }
                });
                console.log(`[ROLLOVER] created next-cycle preview assignment for date ${d.toISOString()}`);
            }
        }
    }
    console.log("[ROLLOVER] ensureNextCyclePreview completed.");
}
