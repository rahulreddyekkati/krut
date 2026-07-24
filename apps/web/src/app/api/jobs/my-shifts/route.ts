import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates, getPreviousCycleDates, getCycleDisplayName } from "@/lib/cycles";
import { resolveTimezone, getLocalDayBoundsUTC } from "@/lib/timezone";
import { ensureCurrentCycleAssignments, ensureNextCyclePreview } from "@/lib/recurringShifts";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Auto-rollover: non-blocking — don't let rollover errors break the shifts response
        try { await ensureCurrentCycleAssignments(session.user.id); } catch (e) {
            console.error("ensureCurrentCycleAssignments error:", e);
        }
        try { await ensureNextCyclePreview(session.user.id); } catch (e) {
            console.error("ensureNextCyclePreview error:", e);
        }

        const tz = resolveTimezone(request);
        const { start: dbTodayStart } = getLocalDayBoundsUTC(tz);
        const cycle = getCurrentCycleDates();
        const prevCycle = getPreviousCycleDates();

        // Assignments in the current cycle (not AVAILABLE — those are released shifts)
        const currentCycle = await prisma.jobAssignment.findMany({
            where: {
                workerId: session.user.id,
                date: { gte: cycle.start, lte: cycle.end },
                status: { not: "AVAILABLE" }
            },
            include: {
                job: {
                    include: {
                        store: { select: { name: true, address: true, latitude: true, longitude: true, radius: true } },
                        market: { select: { name: true } }
                    }
                }
            },
            orderBy: { date: "asc" }
        });

        // All upcoming assignments (today onwards) — for broader view
        const upcoming = await prisma.jobAssignment.findMany({
            where: {
                workerId: session.user.id,
                date: { gte: dbTodayStart },
                status: { not: "AVAILABLE" }
            },
            include: {
                job: {
                    include: {
                        store: { select: { name: true, address: true, latitude: true, longitude: true, radius: true } },
                        market: { select: { name: true } }
                    }
                }
            },
            orderBy: { date: "asc" }
        });

        // Completed/recap-pending shifts from the previous cycle — kept visible for one extra cycle
        const previousCompleted = await prisma.jobAssignment.findMany({
            where: {
                workerId: session.user.id,
                date: { gte: prevCycle.start, lte: prevCycle.end },
                status: { in: ["COMPLETED", "RECAP_PENDING"] }
            },
            include: {
                job: {
                    include: {
                        store: { select: { name: true, address: true, latitude: true, longitude: true, radius: true } },
                        market: { select: { name: true } }
                    }
                }
            },
            orderBy: { date: "asc" }
        });

        // Pending release requests so UI can show "Requested" badge
        const pendingReleases = await prisma.releaseRequest.findMany({
            where: { workerId: session.user.id, status: "PENDING" },
            select: { assignmentId: true, jobId: true, date: true }
        });
        const pendingReleaseAssignmentIds = pendingReleases
            .map(r => r.assignmentId)
            .filter(Boolean) as string[];

        // Pre-resolve custom times into job.startTimeStr/endTimeStr so the mobile app
        // (which reads shift.job.startTimeStr) shows the correct per-worker time
        // without requiring a new mobile release.
        const resolveEffectiveTimes = (assignments: any[]) =>
            assignments.map(a => ({
                ...a,
                job: a.job ? {
                    ...a.job,
                    startTimeStr: a.customStartTimeStr ?? a.job.startTimeStr,
                    endTimeStr:   a.customEndTimeStr   ?? a.job.endTimeStr,
                } : a.job,
            }));

        return NextResponse.json({
            currentCycle:      resolveEffectiveTimes(currentCycle),
            upcoming:          resolveEffectiveTimes(upcoming),
            previousCompleted: resolveEffectiveTimes(previousCompleted),
            cycleStart: cycle.start.toISOString(),
            cycleEnd: cycle.end.toISOString(),
            cycleLabel: getCycleDisplayName(cycle),
            pendingReleaseAssignmentIds
        });
    } catch (error) {
        console.error("My shifts GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
