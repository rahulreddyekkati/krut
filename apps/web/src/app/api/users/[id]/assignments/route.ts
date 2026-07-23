import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getCurrentCycleDates, getPreviousCycleDates, getDatesForWeekdays } from "@/lib/cycles";
import { ensureCurrentCycleAssignments } from "@/lib/recurringShifts";
import { sendPushToUser } from "@/lib/notifications";
import { sendShiftAssignedEmail, sendShiftTimeChangedEmail } from "@/lib/mailer";
import { resolveTimezone, toLocalDateStr } from "@/lib/timezone";

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
        // bonus: optional one-time bonus applied to each shift created by this request
        // brandAllocation: optional "KRUTO" | "MULUK" | "BOTH" tag applied to each shift created
        const { jobId, weekdays, date, bonus, brandAllocation } = body;
        const bonusValue = bonus !== undefined && bonus !== null && bonus !== "" ? parseFloat(bonus) : undefined;

        const ALLOWED_BRAND_ALLOCATIONS = ["KRUTO", "MULUK", "BOTH"];
        if (brandAllocation !== undefined && brandAllocation !== null && brandAllocation !== "" && !ALLOWED_BRAND_ALLOCATIONS.includes(brandAllocation)) {
            return NextResponse.json({ error: "Invalid brandAllocation" }, { status: 400 });
        }
        const brandAllocationValue = brandAllocation || undefined;

        if (!jobId) {
            return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
        }

        const created: any[] = [];
        const skipped: { date: string; reason: string }[] = [];

        if (weekdays && Array.isArray(weekdays) && weekdays.length > 0) {
            // Cycle-based: create one dated assignment per matching weekday in current cycle,
            // but never for a date that's already passed — otherwise assigning a recurring
            // pattern mid-cycle backfills already-past days as bogus unclocked "Missed" shifts.
            const cycle = getCurrentCycleDates();
            const tz = resolveTimezone(request);
            const todayStr = toLocalDateStr(new Date(), tz);
            const todayUTCMidnight = new Date(todayStr + "T00:00:00.000Z");
            const rangeStart = todayUTCMidnight > cycle.start ? todayUTCMidnight : cycle.start;
            const dates = getDatesForWeekdays(weekdays, rangeStart, cycle.end);

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
                    data: { workerId: id, jobId, date: d, isRecurring: true, dayOfWeek: d.getUTCDay(), bonus: bonusValue, brandAllocation: brandAllocationValue }
                });
                created.push(assignment);
            }

            if (created.length > 0) {
                const [worker, job] = await Promise.all([
                    prisma.user.findUnique({ where: { id }, select: { email: true } }),
                    prisma.job.findUnique({ where: { id: jobId }, include: { store: { select: { name: true } } } })
                ]);
                if (job) {
                    const dateLabel = created[0].date
                        ? new Date(created[0].date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
                        : "Recurring";
                    const pushMsg = `You have been assigned a shift at ${job.store.name} on ${dateLabel}.`;
                    sendPushToUser(id, "New Shift Assigned", pushMsg).catch(() => {});
                    if (worker?.email) {
                        sendShiftAssignedEmail(worker.email, job.store.name, dateLabel, job.startTimeStr, job.endTimeStr).catch(() => {});
                    }
                }
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
                data: { workerId: id, jobId, date: dateObj, isRecurring: false, bonus: bonusValue, brandAllocation: brandAllocationValue }
            });
            const [worker, job] = await Promise.all([
                prisma.user.findUnique({ where: { id }, select: { email: true } }),
                prisma.job.findUnique({ where: { id: jobId }, include: { store: { select: { name: true } } } })
            ]);
            if (job) {
                const dateLabel = dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
                const pushMsg = `You have been assigned a shift at ${job.store.name} on ${dateLabel}.`;
                sendPushToUser(id, "New Shift Assigned", pushMsg).catch(() => {});
                if (worker?.email) {
                    sendShiftAssignedEmail(worker.email, job.store.name, dateLabel, job.startTimeStr, job.endTimeStr).catch(() => {});
                }
            }
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

        const assignmentWithDetails = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                worker: { select: { email: true } },
                job: { include: { store: { select: { name: true } } } }
            }
        });
        if (assignmentWithDetails?.worker?.email && customStartTimeStr && customEndTimeStr) {
            const dateLabel = assignmentWithDetails.date
                ? new Date(assignmentWithDetails.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
                : "Recurring";
            sendShiftTimeChangedEmail(
                assignmentWithDetails.worker.email,
                assignmentWithDetails.job.store.name,
                dateLabel,
                customStartTimeStr,
                customEndTimeStr
            ).catch(() => {});
        }

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

        // ── Pattern bulk-delete: remove all future / unworked recurring shifts ──────
        if (jobId && weekdayParam !== null) {
            const weekday = parseInt(weekdayParam, 10);

            // Find all matching assignments that are still in ASSIGNED status (meaning they are either
            // in the future or are past unworked shifts). Deleting these is safe and removes the pattern.
            const candidates = await prisma.jobAssignment.findMany({
                where: {
                    workerId: id,
                    jobId,
                    status: "ASSIGNED"
                },
                select: { id: true, date: true }
            });
            const toDeleteIds = candidates
                .filter(a => a.date && new Date(a.date).getUTCDay() === weekday)
                .map(a => a.id);

            // Find any other matching recurring assignments (e.g. past worked shifts) in any cycle,
            // and mark them as non-recurring (isRecurring: false) so the pattern does not roll over.
            const recurringCandidates = await prisma.jobAssignment.findMany({
                where: {
                    workerId: id,
                    jobId,
                    isRecurring: true
                },
                select: { id: true, date: true }
            });
            const toUpdateIds = recurringCandidates
                .filter(a => a.date && new Date(a.date).getUTCDay() === weekday)
                .map(a => a.id)
                .filter(id => !toDeleteIds.includes(id));

            await prisma.jobAssignment.deleteMany({ where: { id: { in: toDeleteIds } } });
            if (toUpdateIds.length > 0) {
                await prisma.jobAssignment.updateMany({
                    where: { id: { in: toUpdateIds } },
                    data: { isRecurring: false }
                });
            }

            return NextResponse.json({ success: true, deleted: toDeleteIds.length, updated: toUpdateIds.length });
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
