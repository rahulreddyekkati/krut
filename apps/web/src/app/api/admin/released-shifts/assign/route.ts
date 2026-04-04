import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { openJobId, workerId, date } = body;

        if (!openJobId || !workerId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const job = await prisma.job.findUnique({
            where: { id: openJobId },
            include: { store: true }
        });

        if (!job || job.status !== "OPEN") {
            return NextResponse.json({ error: "Job is no longer available to assign" }, { status: 400 });
        }

        const worker = await prisma.user.findUnique({
            where: { id: workerId }
        });

        if (!worker || worker.role !== "WORKER") {
            return NextResponse.json({ error: "Invalid worker selected" }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Create assignment
            await tx.jobAssignment.create({
                data: {
                    jobId: openJobId,
                    workerId,
                    date: date ? new Date(date) : null
                }
            });
            // Update job status
            await tx.job.update({
                where: { id: openJobId },
                data: { status: "ASSIGNED" }
            });

            // If there's any PENDING shift request for this exact job, deny them.
            const pendingRequests = await tx.shiftRequest.findMany({
                where: { jobId: openJobId, status: "PENDING" }
            });

            for (const pr of pendingRequests) {
                await tx.shiftRequest.update({
                    where: { id: pr.id },
                    data: { status: "DENIED" }
                });
                await tx.notification.create({
                    data: {
                        userId: pr.workerId,
                        title: "Shift Assigned",
                        message: `The shift at ${job.store.name} was assigned to another worker.`
                    }
                });
            }

            // Create success notification for the newly assigned worker
            await tx.notification.create({
                data: {
                    userId: workerId,
                    title: "Shift Manually Assigned",
                    message: `You have been manually assigned a shift at ${job.store.name} on ${date ? new Date(date).toLocaleDateString() : "Recurring"}.`
                }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Direct assignment error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
