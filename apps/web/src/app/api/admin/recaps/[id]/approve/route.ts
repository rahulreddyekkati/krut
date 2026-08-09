import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { sendPushToUser } from "@/lib/notifications";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);
        const { id: recapId } = await context.params;
        const {
            managerNotes,
            consumersSampled,
            rushLevel,
            receiptTotal,
            reimbursement,
            clockIn: clockInRaw,
            clockOut: clockOutRaw,
        } = await request.json();

        const newClockIn = clockInRaw ? new Date(clockInRaw) : null;
        const newClockOut = clockOutRaw ? new Date(clockOutRaw) : null;

        const recap = await (prisma.recap as any).findUnique({
            where: { id: recapId },
            include: {
                job: {
                    include: {
                        store: true
                    }
                }
            }
        });

        if (!recap) {
            throw new AppError("Recap not found", 404);
        }

        const assignment = await prisma.jobAssignment.findUnique({
            where: { id: recap.assignmentId },
            include: { worker: true }
        });

        if (!assignment) {
            throw new AppError("Assignment not found", 404);
        }

        const storeName = recap.job.store?.name || "the store";
        const shiftDate = recap.job?.date 
            ? new Date(recap.job.date).toLocaleDateString(undefined, { timeZone: "UTC" })
            : "your recent shift";

        const workerPush = { userId: assignment.worker.id, title: "Recap Approved", message: `Your recap for ${storeName} on ${shiftDate} has been approved.` };

        await prisma.$transaction(async (tx: any) => {
            // 1. Update and Approve recap
            await tx.recap.update({
                where: { id: recapId },
                data: { 
                    status: "APPROVED", 
                    managerReview: managerNotes || null,
                    // Apply manager edits if provided
                    consumersSampled: consumersSampled !== undefined ? Number(consumersSampled) : undefined,
                    rushLevel: rushLevel || undefined,
                    receiptTotal: receiptTotal !== undefined ? Number(receiptTotal) : undefined,
                    reimbursement: reimbursement !== undefined ? Number(reimbursement) : undefined
                }
            });

            // 2. Update THIS assignment to COMPLETED (+ adjust clock times if admin edited them)
            const clockUpdate: any = { status: "COMPLETED" };
            if (newClockIn) clockUpdate.clockIn = newClockIn;
            if (newClockOut) clockUpdate.clockOut = newClockOut;
            // Recompute workedHours whenever EITHER clock time changes, not only when both do
            // — using the effective (newly-edited, or existing-if-untouched) value for
            // whichever one wasn't edited. Previously this only recomputed `if (newClockIn &&
            // newClockOut)`, so correcting just one timestamp left workedHours silently
            // pointing at the pre-edit pair (confirmed in production: one real assignment was
            // under-reported by 30 minutes from exactly this).
            if (newClockIn || newClockOut) {
                const effectiveClockIn = newClockIn ?? assignment.clockIn;
                const effectiveClockOut = newClockOut ?? assignment.clockOut;
                if (effectiveClockIn && effectiveClockOut) {
                    const breakMins = assignment.breakTimeMinutes ?? 0;
                    const grossMins = (new Date(effectiveClockOut).getTime() - new Date(effectiveClockIn).getTime()) / 60000;
                    clockUpdate.workedHours = parseFloat(Math.max(0, (grossMins - breakMins) / 60).toFixed(2));
                }
            }
            await tx.jobAssignment.update({
                where: { id: assignment.id },
                data: clockUpdate,
            });

            // 3. Check if ALL assignments for this job are COMPLETED
            const allAssignments = await tx.jobAssignment.findMany({
                where: { jobId: assignment.jobId }
            });

            const allCompleted = allAssignments.every((a: any) =>
                a.id === assignment.id ? true : a.status === 'COMPLETED'
            );

            // 4. Only mark job COMPLETED if every worker is done
            if (allCompleted) {
                await tx.job.update({
                    where: { id: assignment.jobId },
                    data: { status: "COMPLETED" }
                });
            }

            // 5. Worker notification
            await tx.notification.create({
                data: {
                    userId: assignment.worker.id,
                    title: "Recap Approved",
                    message: `Your recap for ${storeName} on ${shiftDate} has been approved.`,
                    read: false
                }
            });

            // N5: Audit log — record every recap approval with actor and any edits made
            await tx.auditLog.create({
                data: {
                    actorId: user.id,
                    action: "RECAP_APPROVED",
                    entityType: "Recap",
                    entityId: recapId,
                    newValue: JSON.stringify({ managerNotes, consumersSampled, rushLevel, receiptTotal, reimbursement, clockIn: newClockIn, clockOut: newClockOut }),
                }
            });
        });

        sendPushToUser(workerPush.userId, workerPush.title, workerPush.message).catch(() => {});

        return NextResponse.json({ success: true, message: "Recap approved" });
    } catch (error) {
        return handleApiError(error);
    }
}
