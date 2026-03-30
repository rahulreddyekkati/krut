import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> } // In Next.js App Router, params is often a promise
) {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await context.params;
        const requestId = resolvedParams.id;

        const releaseRequest = await prisma.releaseRequest.findUnique({
            where: { id: requestId },
            include: { job: { include: { store: true } } }
        });

        if (!releaseRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        if (releaseRequest.status !== "PENDING") {
            return NextResponse.json({ error: "Request already processed" }, { status: 400 });
        }

        // 1. Approve the request
        await prisma.releaseRequest.update({
            where: { id: requestId },
            data: { status: "APPROVED" }
        });

        // 2. Create an "Open Shift" for that specific date
        // Create a duplicated Job entry indicating it's an OPEN shift on that specific Date
        if (releaseRequest.date) {
            await prisma.job.create({
                data: {
                    title: `${releaseRequest.job.title} - Open (${new Date(releaseRequest.date).toLocaleDateString()}) - ${releaseRequest.id.slice(-4)}`,
                    startTimeStr: releaseRequest.job.startTimeStr,
                    endTimeStr: releaseRequest.job.endTimeStr,
                    date: releaseRequest.date,
                    bonus: releaseRequest.job.bonus,
                    status: "OPEN",
                    storeId: releaseRequest.job.storeId,
                    marketId: releaseRequest.job.marketId,
                    creatorId: session.user.id
                }
            });
        }

        // 3. Remove actual assignments on that specific date (if any were specifically generated)
        if (releaseRequest.date) {
            // Find specific date assignment
            const assignments = await prisma.jobAssignment.findMany({
                where: {
                    jobId: releaseRequest.jobId,
                    workerId: releaseRequest.workerId,
                }
            });
            
            const specificAssignment = assignments.find(a => 
                a.date && new Date(a.date).toISOString().split('T')[0] === releaseRequest.date!.toISOString().split('T')[0]
            );

            if (specificAssignment) {
                await prisma.jobAssignment.delete({
                    where: { id: specificAssignment.id }
                });
            }
        }

        // 4. Notify the worker
        await prisma.notification.create({
            data: {
                userId: releaseRequest.workerId,
                title: "Shift Release Approved",
                message: `Your request to release the shift at ${releaseRequest.job.store.name} on ${releaseRequest.date ? new Date(releaseRequest.date).toLocaleDateString() : "Recurring"} has been approved.`
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Approve release request error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
