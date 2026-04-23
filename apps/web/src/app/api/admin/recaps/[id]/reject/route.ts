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
        const { managerNotes } = await request.json();

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
            // 1. Mark recap REJECTED — do NOT delete it
            await tx.recap.update({
                where: { id: recapId },
                data: { 
                    status: "REJECTED", 
                    managerReview: managerNotes || null 
                }
            });

            // 2. Reset THIS assignment back to RECAP_PENDING
            await tx.jobAssignment.update({
                where: { id: assignment.id },
                data: { status: "RECAP_PENDING" }
            });

            // 3. Reset job status back to RECAP_PENDING
            await tx.job.update({
                where: { id: assignment.jobId },
                data: { status: "RECAP_PENDING" }
            });

            // 4. Worker notification with manager notes
            await tx.notification.create({
                data: {
                    userId: assignment.worker.id,
                    title: "Recap Rejected",
                    message: `Your recap for ${storeName} on ${shiftDate} has been rejected. Please resubmit. Notes: ${managerNotes ?? 'No notes provided.'}`,
                    read: false
                }
            });
        });

        return NextResponse.json({ success: true, message: "Recap rejected" });
    } catch (error) {
        return handleApiError(error);
    }
}
