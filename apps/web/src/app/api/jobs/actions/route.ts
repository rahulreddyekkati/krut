import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { resolveTimezone, localTimeToUTC, toLocalDateStr } from "@/lib/timezone";

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);

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
                where: { jobId, workerId: user.id, status: "PENDING" }
            });

            if (existingRequest) {
                throw new AppError("You already have a pending request for this shift", 400);
            }

            const shiftRequest = await prisma.shiftRequest.create({
                data: {
                    jobId,
                    workerId: user.id,
                    status: "PENDING",
                    date: job?.date ? new Date(job.date) : null
                }
            });

            return NextResponse.json(shiftRequest);
        }

        if (action === "RELEASE") {
            if (!jobId) return NextResponse.json({ error: "Missing Job ID" }, { status: 400 });

            // MAJ-09: Cannot release a shift that is currently IN_PROGRESS (worker is clocked in)
            const activeAssignment = await prisma.jobAssignment.findFirst({
                where: { jobId, workerId: user.id, clockIn: { not: null }, clockOut: null }
            });
            if (activeAssignment) {
                throw new AppError("Cannot release a shift you are currently clocked into", 400);
            }

            // Enforce 2-hour minimum window before shift starts
            if (date) {
                const tz = resolveTimezone(request);
                const job = await prisma.job.findUnique({ where: { id: jobId } });
                if (job && job.startTimeStr) {
                    const dateStr = toLocalDateStr(new Date(date), tz);
                    const shiftStart = localTimeToUTC(dateStr, job.startTimeStr, tz);
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
                    workerId: user.id,
                    status: "PENDING",
                    date: new Date(date)
                }
            });
            if (existingRelease) {
                throw new AppError("A release request for this shift is already pending", 400);
            }
            }

            const releaseRequest = await prisma.releaseRequest.create({
                data: {
                    jobId,
                    workerId: user.id,
                    reason: reason || "No reason provided",
                    status: "PENDING",
                    ...(date && { date: new Date(date) })
                }
            });

            return NextResponse.json(releaseRequest);
        }

        throw new AppError("Invalid action", 400);
    } catch (error) {
        return handleApiError(error);
    }
}
