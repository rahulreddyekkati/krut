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
        const { id: requestId } = await context.params;

        const shiftRequest = await prisma.shiftRequest.findUnique({
            where: { id: requestId },
            include: { job: { include: { store: true } } }
        });

        if (!shiftRequest || shiftRequest.status !== "PENDING") {
            return NextResponse.json({ error: "Request not found or no longer pending" }, { status: 404 });
        }

        const dateLabel = shiftRequest.date
            ? new Date(shiftRequest.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
            : "Unknown date";

        await prisma.$transaction(async (tx) => {
            if (shiftRequest.assignmentId) {
                // New flow: transfer the AVAILABLE assignment to the requesting worker
                const assignment = await tx.jobAssignment.findUnique({
                    where: { id: shiftRequest.assignmentId }
                });

                if (!assignment || assignment.status !== "AVAILABLE") {
                    throw new Error("Assignment is no longer available");
                }

                // Transfer ownership
                await tx.jobAssignment.update({
                    where: { id: shiftRequest.assignmentId },
                    data: {
                        workerId: shiftRequest.workerId,
                        status: "ASSIGNED",
                        releasedByWorkerId: null
                    }
                });

                // Deny all other pending requests for this assignment
                const otherRequests = await tx.shiftRequest.findMany({
                    where: {
                        assignmentId: shiftRequest.assignmentId,
                        id: { not: requestId },
                        status: "PENDING"
                    }
                });

                for (const other of otherRequests) {
                    await tx.shiftRequest.update({ where: { id: other.id }, data: { status: "DENIED" } });
                    await tx.notification.create({
                        data: {
                            userId: other.workerId,
                            title: "Shift No Longer Available",
                            message: `The shift at ${shiftRequest.job.store.name} on ${dateLabel} has been assigned to another worker.`
                        }
                    });
                }
            } else {
                // Legacy flow: create a new assignment for an OPEN job
                if (shiftRequest.job.status !== "OPEN") {
                    await tx.shiftRequest.update({ where: { id: requestId }, data: { status: "DENIED" } });
                    throw new Error("Job is already assigned to someone else");
                }

                await tx.jobAssignment.create({
                    data: {
                        jobId: shiftRequest.jobId,
                        workerId: shiftRequest.workerId,
                        date: shiftRequest.date
                    }
                });
                await tx.job.update({ where: { id: shiftRequest.jobId }, data: { status: "ASSIGNED" } });

                // Deny other pending requests for this job
                const otherRequests = await tx.shiftRequest.findMany({
                    where: { jobId: shiftRequest.jobId, id: { not: requestId }, status: "PENDING" }
                });
                for (const other of otherRequests) {
                    await tx.shiftRequest.update({ where: { id: other.id }, data: { status: "DENIED" } });
                    await tx.notification.create({
                        data: {
                            userId: other.workerId,
                            title: "Shift No Longer Available",
                            message: `The shift at ${shiftRequest.job.store.name} on ${dateLabel} has been assigned to another worker.`
                        }
                    });
                }
            }

            // Approve this request and notify the worker
            await tx.shiftRequest.update({ where: { id: requestId }, data: { status: "APPROVED" } });
            await tx.notification.create({
                data: {
                    userId: shiftRequest.workerId,
                    title: "Shift Assigned",
                    message: `Your request for the shift at ${shiftRequest.job.store.name} on ${dateLabel} has been approved.`
                }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
