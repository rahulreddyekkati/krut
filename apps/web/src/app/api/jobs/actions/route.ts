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

        // ── ACCEPT: Request an available shift ───────────────────────────────────
        if (action === "ACCEPT") {
            // New flow: worker requests an AVAILABLE assignment by assignmentId
            if (assignmentId) {
                const assignment = await prisma.jobAssignment.findUnique({
                    where: { id: assignmentId },
                    include: { job: { include: { store: true } } }
                });

                if (!assignment || assignment.status !== "AVAILABLE") {
                    throw new AppError("This shift is no longer available", 400);
                }
                if (assignment.releasedByWorkerId === user.id) {
                    throw new AppError("You cannot request your own released shift", 400);
                }

                const existing = await prisma.shiftRequest.findFirst({
                    where: { assignmentId, workerId: user.id, status: "PENDING" }
                });
                if (existing) {
                    throw new AppError("You already have a pending request for this shift", 400);
                }

                const shiftRequest = await prisma.shiftRequest.create({
                    data: {
                        jobId: assignment.jobId,
                        workerId: user.id,
                        assignmentId,
                        status: "PENDING",
                        date: assignment.date
                    }
                });
                return NextResponse.json(shiftRequest);
            }

            // Legacy flow: request an OPEN job by jobId
            if (!jobId) return NextResponse.json({ error: "Missing jobId or assignmentId" }, { status: 400 });

            const job = await prisma.job.findUnique({ where: { id: jobId } });
            if (!job || job.status !== "OPEN") {
                return NextResponse.json({ error: "Job is no longer available" }, { status: 400 });
            }

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
                    date: job.date ? new Date(job.date) : null
                }
            });
            return NextResponse.json(shiftRequest);
        }

        // ── RELEASE: Request to release an assigned shift ────────────────────────
        if (action === "RELEASE") {
            console.log("[RELEASE] user:", user.id, "assignmentId:", assignmentId, "jobId:", jobId);
            // New flow: release by assignmentId
            let targetAssignment = assignmentId
                ? await prisma.jobAssignment.findUnique({
                    where: { id: assignmentId },
                    include: { job: true }
                })
                : null;

            // Legacy fallback: find by jobId + date
            if (!targetAssignment && jobId) {
                const where: any = { jobId, workerId: user.id, status: "ASSIGNED" };
                if (date) {
                    const d = new Date(date);
                    const s = new Date(d); s.setUTCHours(0, 0, 0, 0);
                    const e = new Date(d); e.setUTCHours(23, 59, 59, 999);
                    where.date = { gte: s, lte: e };
                }
                targetAssignment = await prisma.jobAssignment.findFirst({
                    where,
                    include: { job: true }
                });
            }

            console.log("[RELEASE] targetAssignment:", targetAssignment?.id, "status:", targetAssignment?.status, "workerId:", targetAssignment?.workerId);
            if (!targetAssignment) {
                throw new AppError("Assignment not found", 404);
            }
            if (targetAssignment.workerId !== user.id) {
                throw new AppError("This is not your assignment", 403);
            }
            if (targetAssignment.status === "IN_PROGRESS") {
                throw new AppError("Cannot release a shift you are currently clocked into", 400);
            }

            // 2-hour minimum window check
            if (targetAssignment.date && targetAssignment.job.startTimeStr) {
                const tz = resolveTimezone(request);
                const dateStr = toLocalDateStr(new Date(targetAssignment.date), tz);
                const shiftStart = localTimeToUTC(dateStr, targetAssignment.job.startTimeStr, tz);
                const diffMs = shiftStart.getTime() - Date.now();
                if (diffMs < 2 * 60 * 60 * 1000) {
                    throw new AppError("Cannot release a shift less than 2 hours before it starts", 400);
                }
            }

            // Prevent duplicate pending request for same assignment
            const existingRelease = await prisma.releaseRequest.findFirst({
                where: { assignmentId: targetAssignment.id, workerId: user.id, status: "PENDING" }
            });
            if (existingRelease) {
                throw new AppError("A release request for this shift is already pending", 400);
            }

            const releaseRequest = await prisma.releaseRequest.create({
                data: {
                    jobId: targetAssignment.jobId,
                    workerId: user.id,
                    assignmentId: targetAssignment.id,
                    date: targetAssignment.date,
                    reason: reason || "No reason provided",
                    status: "PENDING"
                }
            });

            return NextResponse.json(releaseRequest);
        }

        throw new AppError("Invalid action", 400);
    } catch (error) {
        return handleApiError(error);
    }
}
