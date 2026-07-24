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
    const currentCycle = getCurrentCycleDates();
    const prevCycle = getPreviousCycleDates();

    // Fast path: current cycle already has recurring assignments — nothing to do
    const currentCount = await prisma.jobAssignment.count({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: currentCycle.start, lte: currentCycle.end }
        }
    });
    if (currentCount > 0) return;

    // Look at previous cycle's recurring assignments as the template
    const prevAssignments = await prisma.jobAssignment.findMany({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: prevCycle.start, lte: prevCycle.end }
        },
        select: { jobId: true, date: true }
    });
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

    // Create current cycle assignments for each pattern, skipping dates that already exist.
    // Never generate a date before today — a late-running rollover shouldn't backfill
    // already-past days as bogus unclocked "Missed" shifts.
    const chicagoNow = new Date(Date.now() - 6 * 60 * 60 * 1000);
    const dateStr = chicagoNow.toISOString().split("T")[0];
    const todayUTCMidnight = new Date(dateStr + "T00:00:00.000Z");
    const rangeStart = todayUTCMidnight > currentCycle.start ? todayUTCMidnight : currentCycle.start;
    for (const { jobId, weekday } of patterns.values()) {
        const dates = getDatesForWeekdays([weekday], rangeStart, currentCycle.end);
        for (const d of dates) {
            const dayStart = new Date(d); dayStart.setUTCHours(0, 0, 0, 0);
            const dayEnd = new Date(d); dayEnd.setUTCHours(23, 59, 59, 999);
            const existing = await prisma.jobAssignment.findFirst({
                where: { workerId, jobId, date: { gte: dayStart, lte: dayEnd } }
            });
            if (!existing) {
                await prisma.jobAssignment.create({
                    data: { workerId, jobId, date: d, isRecurring: true }
                });
            }
        }
    }
}

/**
 * Called at the start of each GET request for a worker's assignments.
 * Once we're within NEXT_CYCLE_PREVIEW_DAYS of the next cycle's start, materialize
 * that cycle's recurring shifts early (using the current cycle's patterns as the
 * template) so workers can see/plan them ahead of the cycle actually rolling over.
 */
export async function ensureNextCyclePreview(workerId: string): Promise<void> {
    const currentCycle = getCurrentCycleDates();
    const nextCycle = getNextCycleDates();

    const previewStart = new Date(nextCycle.start);
    previewStart.setDate(previewStart.getDate() - NEXT_CYCLE_PREVIEW_DAYS);
    if (new Date() < previewStart) return;

    // Fast path: next cycle already has recurring assignments — nothing to do
    const nextCount = await prisma.jobAssignment.count({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: nextCycle.start, lte: nextCycle.end }
        }
    });
    if (nextCount > 0) return;

    // Use the CURRENT cycle's recurring assignments as the template for next cycle
    const currentAssignments = await prisma.jobAssignment.findMany({
        where: {
            workerId,
            isRecurring: true,
            date: { gte: currentCycle.start, lte: currentCycle.end }
        },
        select: { jobId: true, date: true }
    });
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

    for (const { jobId, weekday } of patterns.values()) {
        const dates = getDatesForWeekdays([weekday], nextCycle.start, nextCycle.end);
        for (const d of dates) {
            const dayStart = new Date(d); dayStart.setUTCHours(0, 0, 0, 0);
            const dayEnd = new Date(d); dayEnd.setUTCHours(23, 59, 59, 999);
            const existing = await prisma.jobAssignment.findFirst({
                where: { workerId, jobId, date: { gte: dayStart, lte: dayEnd } }
            });
            if (!existing) {
                await prisma.jobAssignment.create({
                    data: { workerId, jobId, date: d, isRecurring: true }
                });
            }
        }
    }
}
