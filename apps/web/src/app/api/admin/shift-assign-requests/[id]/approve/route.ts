import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const resolvedParams = await context.params;
        const requestId = resolvedParams.id;

        // 1. Find the request
        const shiftRequest = await prisma.shiftRequest.findUnique({
            where: { id: requestId },
            include: { job: { include: { store: true } } }
        });

        if (!shiftRequest || shiftRequest.status !== "PENDING") {
            return NextResponse.json({ error: "Request not found or no longer pending" }, { status: 404 });
        }

        // 2. Check if job is still open
        if (shiftRequest.job.status !== "OPEN") {
            // Deny this group of requests for this job if it's already assigned
            await prisma.shiftRequest.update({
                where: { id: requestId },
                data: { status: "DENIED" }
            });
            return NextResponse.json({ error: "Job is already assigned to someone else" }, { status: 400 });
        }

        // 3. Complete the assignment in a transaction
        await prisma.$transaction(async (tx) => {
            // Create assignment
            await tx.jobAssignment.create({
                data: {
                    jobId: shiftRequest.jobId,
                    workerId: shiftRequest.workerId,
                    date: shiftRequest.date
                }
            });
            // Update job status
            await tx.job.update({
                where: { id: shiftRequest.jobId },
                data: { status: "ASSIGNED" }
            });
            // Mark this request as approved
            await tx.shiftRequest.update({
                where: { id: requestId },
                data: { status: "APPROVED" }
            });
            
            // Create success notification
            await tx.notification.create({
                data: {
                    userId: shiftRequest.workerId,
                    title: "Shift Assign Approved",
                    message: `Your request for the shift at ${shiftRequest.job.store.name} on ${shiftRequest.date ? new Date(shiftRequest.date).toLocaleDateString() : "Recurring"} has been approved.`
                }
            });

            // Find other pending requests for the SAME JOB
            const otherRequests = await tx.shiftRequest.findMany({
                where: {
                    jobId: shiftRequest.jobId,
                    id: { not: requestId },
                    status: "PENDING"
                }
            });

            // Deny other pending requests and notify them
            for (const other of otherRequests) {
                await tx.shiftRequest.update({
                    where: { id: other.id },
                    data: { status: "DENIED" }
                });
                await tx.notification.create({
                    data: {
                        userId: other.workerId,
                        title: "Shift No Longer Available",
                        message: `The shift at ${shiftRequest.job.store.name} on ${shiftRequest.date ? new Date(shiftRequest.date).toLocaleDateString() : "Recurring"} has been assigned to another worker.`
                    }
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
