import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";

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
            reimbursement
        } = await request.json();

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
            ? new Date(recap.job.date).toLocaleDateString() 
            : "your recent shift";

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

            // 2. Update THIS assignment to COMPLETED
            await tx.jobAssignment.update({
                where: { id: assignment.id },
                data: { status: "COMPLETED" }
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
        });

        return NextResponse.json({ success: true, message: "Recap approved" });
    } catch (error) {
        return handleApiError(error);
    }
}
