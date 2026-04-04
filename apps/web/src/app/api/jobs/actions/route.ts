import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { action, jobId, assignmentId, reason, date } = body;

        if (action === "ACCEPT") {
            if (!jobId) return NextResponse.json({ error: "Missing Job ID" }, { status: 400 });

            // Check if job is still open
            const job = await prisma.job.findUnique({
                where: { id: jobId }
            });

            let isValid = job?.status === "OPEN";

            // If job is not natively OPEN, check if there's a pending ReleaseRequest for it
            if (!isValid && job && date) {
                const pendingRelease = await prisma.releaseRequest.findFirst({
                    where: { 
                        jobId, 
                        status: "PENDING",
                        // Compare the dates (assuming the client sent the date correctly)
                    }
                });
                
                // If there's a pending release on this job, we allow the request
                if (pendingRelease && pendingRelease.date?.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]) {
                    isValid = true;
                }
            }

            if (!isValid) {
                return NextResponse.json({ error: "Job is no longer available or not open for requests" }, { status: 400 });
            }

            // Check if there's already a pending request for this user and job
            const existingRequest = await prisma.shiftRequest.findFirst({
                where: {
                    jobId,
                    workerId: session.user.id,
                    status: "PENDING"
                }
            });

            if (existingRequest) {
                return NextResponse.json({ error: "You already have a pending request for this shift" }, { status: 400 });
            }

            // Create shift request
            const shiftRequest = await prisma.shiftRequest.create({
                data: {
                    jobId,
                    workerId: session.user.id,
                    status: "PENDING",
                    date: job?.date ? new Date(job.date) : null
                }
            });

            return NextResponse.json(shiftRequest);
        }

        if (action === "RELEASE") {
            if (!jobId) return NextResponse.json({ error: "Missing Job ID" }, { status: 400 });

            // Enforce 2-hour minimum window before shift starts
            if (date) {
                const job = await prisma.job.findUnique({ where: { id: jobId } });
                if (job && job.startTimeStr) {
                    const [h, m] = job.startTimeStr.split(':').map(Number);
                    const shiftStart = new Date(date);
                    shiftStart.setHours(h, m, 0, 0);
                    const diffMs = shiftStart.getTime() - Date.now();
                    if (diffMs < 2 * 60 * 60 * 1000) {
                        return NextResponse.json(
                            { error: "Cannot release a shift less than 2 hours before it starts" },
                            { status: 400 }
                        );
                    }
                }
            }
            // Check for existing pending release request for same job+date
            if (date) {
                const existingRelease = await prisma.releaseRequest.findFirst({
                    where: {
                        jobId,
                        workerId: session.user.id,
                        status: "PENDING",
                        date: new Date(date)
                    }
                });
                if (existingRelease) {
                    return NextResponse.json(
                        { error: "A release request for this shift is already pending" },
                        { status: 400 }
                    );
                }
            }

            // Create a release request
            const releaseRequest = await prisma.releaseRequest.create({
                data: {
                    jobId,
                    workerId: session.user.id,
                    reason: reason || "No reason provided",
                    status: "PENDING",
                    ...(date && { date: new Date(date) })
                }
            });

            return NextResponse.json(releaseRequest);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error: any) {
        console.error("Job action POST error:", error);
        return NextResponse.json({ error: error.message || "Internal server error", details: error }, { status: 500 });
    }
}
