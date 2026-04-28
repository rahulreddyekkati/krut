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

        const releaseRequest = await prisma.releaseRequest.findUnique({
            where: { id: requestId },
            include: {
                job: { include: { store: true } }
            }
        });

        if (!releaseRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }
        if (releaseRequest.status !== "PENDING") {
            return NextResponse.json({ error: "Request already processed" }, { status: 400 });
        }

        // Find the specific assignment being released
        let assignment = releaseRequest.assignmentId
            ? await prisma.jobAssignment.findUnique({ where: { id: releaseRequest.assignmentId } })
            : null;

        if (!assignment && releaseRequest.date) {
            // Fallback: match by worker + job + date
            const dayStart = new Date(releaseRequest.date); dayStart.setUTCHours(0, 0, 0, 0);
            const dayEnd = new Date(releaseRequest.date); dayEnd.setUTCHours(23, 59, 59, 999);
            assignment = await prisma.jobAssignment.findFirst({
                where: {
                    jobId: releaseRequest.jobId,
                    workerId: releaseRequest.workerId,
                    date: { gte: dayStart, lte: dayEnd }
                }
            });
        }

        if (!assignment) {
            return NextResponse.json({ error: "Associated assignment not found" }, { status: 404 });
        }

        const dateLabel = releaseRequest.date
            ? new Date(releaseRequest.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
            : "Unknown date";

        await prisma.$transaction(async (tx) => {
            // 1. Approve the release request
            await tx.releaseRequest.update({
                where: { id: requestId },
                data: { status: "APPROVED" }
            });

            // 2. Flip assignment to AVAILABLE (no new Job created)
            await tx.jobAssignment.update({
                where: { id: assignment!.id },
                data: { status: "AVAILABLE", releasedByWorkerId: releaseRequest.workerId }
            });

            // 3. Notify the releasing worker
            await tx.notification.create({
                data: {
                    userId: releaseRequest.workerId,
                    title: "Shift Release Approved",
                    message: `Your shift at ${releaseRequest.job.store.name} on ${dateLabel} has been released and is now available for other workers.`
                }
            });

            // 4. Notify ALL other workers in the same market
            const marketWorkers = await tx.user.findMany({
                where: {
                    marketId: releaseRequest.job.marketId ?? undefined,
                    role: "WORKER",
                    status: "ACTIVE",
                    id: { not: releaseRequest.workerId }
                },
                select: { id: true }
            });

            await tx.notification.createMany({
                data: marketWorkers.map(w => ({
                    userId: w.id,
                    title: "Shift Available",
                    message: `A shift at ${releaseRequest.job.store.name} on ${dateLabel} (${releaseRequest.job.startTimeStr}–${releaseRequest.job.endTimeStr}) is now available. Open the app to request it.`
                }))
            });
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
