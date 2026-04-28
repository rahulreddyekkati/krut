import prisma from "@/lib/prisma";
import { getCurrentCycleDates, getPreviousCycleDates, getDatesForWeekdays } from "@/lib/cycles";

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

    // Create current cycle assignments for each pattern, skipping dates that already exist
    for (const { jobId, weekday } of patterns.values()) {
        const dates = getDatesForWeekdays([weekday], currentCycle.start, currentCycle.end);
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
