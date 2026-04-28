import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates, getPreviousCycleDates, getDatesForWeekdays } from "@/lib/cycles";
import { ensureCurrentCycleAssignments } from "@/lib/recurringShifts";

// GET /api/users/[id]/assignments - Fetch shifts for a worker
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await context.params;

        if (
            session.user.role !== "ADMIN" &&
            session.user.role !== "MARKET_MANAGER" &&
            session.user.id !== id
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Auto-rollover: create current cycle assignments from previous cycle patterns if needed
        await ensureCurrentCycleAssignments(id);

        const assignments = await prisma.jobAssignment.findMany({
            where: { workerId: id },
            include: {
                job: {
                    include: { store: { select: { name: true } } }
                }
            }
        });

        return NextResponse.json(assignments);
    } catch (error: any) {
        console.error("Fetch assignments error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/users/[id]/assignments - Assign a job to a worker
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();
        // weekdays: array of day numbers (0=Sun…6=Sat) for cycle-based assignment
        // date: single date string for one-off assignment
        const { jobId, weekdays, date } = body;

        if (!jobId) {
            return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
        }

        const created: any[] = [];
        const skipped: { date: string; reason: string }[] = [];

        if (weekdays && Array.isArray(weekdays) && weekdays.length > 0) {
            // Cycle-based: create one dated assignment per matching weekday in current cycle
            const cycle = getCurrentCycleDates();
            const dates = getDatesForWeekdays(weekdays, cycle.start, cycle.end);

            for (const d of dates) {
                const dayStart = new Date(d); dayStart.setUTCHours(0, 0, 0, 0);
                const dayEnd = new Date(d); dayEnd.setUTCHours(23, 59, 59, 999);
                const existing = await prisma.jobAssignment.findFirst({
                    where: { workerId: id, jobId, date: { gte: dayStart, lte: dayEnd } }
                });
                if (existing) {
                    skipped.push({ date: d.toISOString().split('T')[0], reason: "Already assigned" });
                    continue;
                }
                const assignment = await prisma.jobAssignment.create({
                    data: { workerId: id, jobId, date: d, isRecurring: true }
                });
                created.push(assignment);
            }

            return NextResponse.json({
                success: true,
                created,
                skipped,
                cycle: { start: cycle.start.toISOString(), end: cycle.end.toISOString() }
            });
        }

        if (date) {
            // Single date one-off
            const dateObj = new Date(date);
            const dayStart = new Date(dateObj); dayStart.setUTCHours(0, 0, 0, 0);
            const dayEnd = new Date(dateObj); dayEnd.setUTCHours(23, 59, 59, 999);
            const existing = await prisma.jobAssignment.findFirst({
                where: { workerId: id, jobId, date: { gte: dayStart, lte: dayEnd } }
            });
            if (existing) {
                return NextResponse.json({ error: "Worker is already assigned to this job on that date" }, { status: 409 });
            }
            const assignment = await prisma.jobAssignment.create({
                data: { workerId: id, jobId, date: dateObj, isRecurring: false }
            });
            return NextResponse.json({ success: true, count: 1, created: [assignment], skipped: [] });
        }

        return NextResponse.json({ error: "Provide weekdays (array) for cycle assignment or a specific date" }, { status: 400 });
    } catch (error: any) {
        console.error("Create assignment error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/users/[id]/assignments - Override start/end time for a specific assignment (N4)
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: targetWorkerId } = await context.params;
        const body = await request.json();
        const { assignmentId, customStartTimeStr, customEndTimeStr, directAssign, newWorkerId } = body;

        if (!assignmentId) {
            return NextResponse.json({ error: "Missing assignmentId" }, { status: 400 });
        }

        // Admin direct-assign: transfer AVAILABLE assignment to a different worker
        if (directAssign && newWorkerId) {
            const assignment = await prisma.jobAssignment.findUnique({ where: { id: assignmentId } });
            if (!assignment || assignment.status !== "AVAILABLE") {
                return NextResponse.json({ error: "Assignment not available for direct assignment" }, { status: 400 });
            }
            const updated = await prisma.jobAssignment.update({
                where: { id: assignmentId },
                data: { workerId: newWorkerId, status: "ASSIGNED", releasedByWorkerId: null }
            });
            // Deny any pending ShiftRequests for this assignment
            await prisma.shiftRequest.updateMany({
                where: { assignmentId, status: "PENDING" },
                data: { status: "DENIED" }
            });
            return NextResponse.json({ success: true, assignment: updated });
        }

        const old = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            select: { customStartTimeStr: true, customEndTimeStr: true }
        });

        const [updated] = await prisma.$transaction([
            prisma.jobAssignment.update({
                where: { id: assignmentId },
                data: { customStartTimeStr: customStartTimeStr ?? null, customEndTimeStr: customEndTimeStr ?? null }
            }),
            prisma.auditLog.create({
                data: {
                    actorId: session.user.id,
                    action: "SHIFT_TIME_EDIT",
                    entityType: "JobAssignment",
                    entityId: assignmentId,
                    oldValue: JSON.stringify({ customStartTimeStr: old?.customStartTimeStr, customEndTimeStr: old?.customEndTimeStr }),
                    newValue: JSON.stringify({ customStartTimeStr, customEndTimeStr }),
                }
            })
        ]);

        return NextResponse.json({ success: true, assignment: updated });
    } catch (error: any) {
        console.error("Patch assignment error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/users/[id]/assignments - Remove an assignment or recurring pattern
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const assignmentId = searchParams.get("id");
        const jobId = searchParams.get("jobId");
        const weekdayParam = searchParams.get("weekday");

        // ── Pattern bulk-delete: remove all future ASSIGNED recurring shifts ──────
        if (jobId && weekdayParam !== null) {
            const weekday = parseInt(weekdayParam, 10);
            const today = new Date(); today.setUTCHours(0, 0, 0, 0);

            // Only delete future ASSIGNED shifts — never touch completed history
            const candidates = await prisma.jobAssignment.findMany({
                where: {
                    workerId: id,
                    jobId,
                    date: { gte: today },
                    status: "ASSIGNED"
                },
                select: { id: true, date: true }
            });
            const toDeleteIds = candidates
                .filter(a => a.date && new Date(a.date).getUTCDay() === weekday)
                .map(a => a.id);

            // Mark previous cycle's matching records as non-recurring so auto-rollover
            // does not recreate this pattern next cycle
            const prevCycle = getPreviousCycleDates();
            const prevCandidates = await prisma.jobAssignment.findMany({
                where: {
                    workerId: id,
                    jobId,
                    isRecurring: true,
                    date: { gte: prevCycle.start, lte: prevCycle.end }
                },
                select: { id: true, date: true }
            });
            const prevMatchIds = prevCandidates
                .filter(a => a.date && new Date(a.date).getUTCDay() === weekday)
                .map(a => a.id);

            await prisma.jobAssignment.deleteMany({ where: { id: { in: toDeleteIds } } });
            if (prevMatchIds.length > 0) {
                await prisma.jobAssignment.updateMany({
                    where: { id: { in: prevMatchIds } },
                    data: { isRecurring: false }
                });
            }

            return NextResponse.json({ success: true, deleted: toDeleteIds.length });
        }

        // ── Single delete (one-off / special shifts) ──────────────────────────────
        if (!assignmentId) {
            return NextResponse.json({ error: "Missing assignment id or jobId+weekday" }, { status: 400 });
        }

        await prisma.jobAssignment.delete({
            where: { id: assignmentId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete assignment error:", error);
        return NextResponse.json({
            error: error.message || "Internal server error",
            stack: error.stack
        }, { status: 500 });
    }
}
