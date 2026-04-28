import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates, getCycleDisplayName } from "@/lib/cycles";
import { resolveTimezone, getLocalDayBoundsUTC } from "@/lib/timezone";
import { ensureCurrentCycleAssignments } from "@/lib/recurringShifts";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Auto-rollover: non-blocking — don't let rollover errors break the shifts response
        try { await ensureCurrentCycleAssignments(session.user.id); } catch (e) {
            console.error("ensureCurrentCycleAssignments error:", e);
        }

        const tz = resolveTimezone(request);
        const { start: dbTodayStart } = getLocalDayBoundsUTC(tz);
        const cycle = getCurrentCycleDates();

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
                        store: { select: { name: true, address: true } },
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
                        store: { select: { name: true, address: true } },
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

        return NextResponse.json({
            currentCycle,
            upcoming,
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
