import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { sendPushToUser } from "@/lib/notifications";
import { sendShiftAssignedEmail, sendShiftTimeChangedEmail } from "@/lib/mailer";

// PATCH /api/admin/assignments/[id]
// Full shift reassignment: change worker, store, and/or times in one call.
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);
        const { id: assignmentId } = await context.params;
        const { newWorkerId, storeId, startTimeStr, endTimeStr } = await request.json();

        const assignment = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            include: {
                worker: { select: { id: true, name: true, email: true } },
                job: {
                    include: { store: { select: { id: true, name: true, marketId: true } } }
                }
            }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
        }

        // Market Manager scope check
        if (user.role === "MARKET_MANAGER" && assignment.job.store.marketId !== user.managedMarketId) {
            return NextResponse.json({ error: "Unauthorized: Assignment outside your market" }, { status: 403 });
        }

        const dateLabel = assignment.date
            ? new Date(assignment.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
            : "Recurring";

        let updatedJobId = assignment.jobId;
        let effectiveStoreName = assignment.job.store.name;
        let effectiveStartStr = startTimeStr || assignment.job.startTimeStr;
        let effectiveEndStr   = endTimeStr   || assignment.job.endTimeStr;

        // ── Store change: find or create a specific-date job at the new store ──
        const storeChanged = storeId && storeId !== assignment.job.store.id;
        if (storeChanged) {
            const newStore = await prisma.store.findUnique({
                where: { id: storeId },
                select: { id: true, name: true, marketId: true }
            });
            if (!newStore) return NextResponse.json({ error: "Store not found" }, { status: 404 });

            effectiveStoreName = newStore.name;

            // Look for an existing specific-date job at that store on the same date
            let targetJob = assignment.date
                ? await prisma.job.findFirst({
                    where: {
                        storeId,
                        date: { gte: new Date(assignment.date.toISOString().split('T')[0] + "T00:00:00Z"),
                                lte: new Date(assignment.date.toISOString().split('T')[0] + "T23:59:59Z") }
                    }
                })
                : null;

            if (!targetJob) {
                // Auto-create a specific-date job for this store
                targetJob = await prisma.job.create({
                    data: {
                        title: `Shift - ${newStore.name}`,
                        storeId: newStore.id,
                        marketId: newStore.marketId,
                        startTimeStr: effectiveStartStr,
                        endTimeStr: effectiveEndStr,
                        date: assignment.date,
                        status: "ASSIGNED",
                        creatorId: user.id,
                    }
                });
            }

            updatedJobId = targetJob.id;
        }

        // ── Build the assignment update payload ──
        const updateData: any = {};

        if (updatedJobId !== assignment.jobId) {
            updateData.jobId = updatedJobId;
            updateData.customStartTimeStr = null; // new job has native times
            updateData.customEndTimeStr   = null;
        } else if (startTimeStr || endTimeStr) {
            // Only time changed, no store change — use custom time overrides
            updateData.customStartTimeStr = startTimeStr || assignment.customStartTimeStr;
            updateData.customEndTimeStr   = endTimeStr   || assignment.customEndTimeStr;
        }

        const workerChanged = newWorkerId && newWorkerId !== assignment.workerId;
        if (workerChanged) {
            updateData.workerId = newWorkerId;
            updateData.status = "ASSIGNED";
            updateData.releasedByWorkerId = null;
        }

        await prisma.jobAssignment.update({ where: { id: assignmentId }, data: updateData });

        // ── Notifications ──
        const oldWorker = assignment.worker;

        if (workerChanged) {
            const newWorkerUser = await prisma.user.findUnique({
                where: { id: newWorkerId },
                select: { email: true }
            });

            // Notify old worker: shift removed
            const removedMsg = `Your shift at ${effectiveStoreName} on ${dateLabel} has been reassigned.`;
            await prisma.notification.create({ data: { userId: oldWorker.id, title: "Shift Removed", message: removedMsg } });
            sendPushToUser(oldWorker.id, "Shift Removed", removedMsg).catch(() => {});

            // Notify new worker: shift assigned
            const assignedMsg = `You have been assigned a shift at ${effectiveStoreName} on ${dateLabel}.`;
            await prisma.notification.create({ data: { userId: newWorkerId, title: "New Shift Assigned", message: assignedMsg } });
            sendPushToUser(newWorkerId, "New Shift Assigned", assignedMsg).catch(() => {});
            if (newWorkerUser?.email) {
                sendShiftAssignedEmail(newWorkerUser.email, effectiveStoreName, dateLabel, effectiveStartStr, effectiveEndStr).catch(() => {});
            }
        } else if (storeChanged || startTimeStr || endTimeStr) {
            // Notify existing worker about the update
            const updatedMsg = `Your shift on ${dateLabel} has been updated.`;
            await prisma.notification.create({ data: { userId: oldWorker.id, title: "Shift Updated", message: updatedMsg } });
            sendPushToUser(oldWorker.id, "Shift Updated", updatedMsg).catch(() => {});
            if (oldWorker.email && (startTimeStr || endTimeStr)) {
                sendShiftTimeChangedEmail(oldWorker.email, effectiveStoreName, dateLabel, effectiveStartStr, effectiveEndStr).catch(() => {});
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
