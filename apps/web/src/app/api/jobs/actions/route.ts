import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { resolveTimezone, localTimeToUTC, toLocalDateStr, toUTCLocalDateStr } from "@/lib/timezone";
import { getAdminAndMarketManagerEmails } from "@/lib/notifications";
import { sendShiftReleaseRequestedEmail, sendShiftRequestedEmail } from "@/lib/mailer";

function buildAppBaseUrl(request: NextRequest): string {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
}

function formatDateLabel(date: Date | string | null | undefined): string {
    if (!date) return "Unknown date";
    return new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
}

async function notifyAdminsOfShiftRequest(params: {
    baseUrl: string;
    requestId: string;
    workerName: string;
    storeName: string;
    dateLabel: string;
    startTime: string | null;
    endTime: string | null;
    marketId: string | null;
}) {
    const { baseUrl, requestId, workerName, storeName, dateLabel, startTime, endTime, marketId } = params;
    const reviewUrl = `${baseUrl}/admin/shift-release-approvals?tab=assign-requests&highlight=${requestId}`;
    const recipients = await getAdminAndMarketManagerEmails(marketId);
    for (const email of recipients) {
        sendShiftRequestedEmail(email, workerName, storeName, dateLabel, startTime || "", endTime || "", reviewUrl).catch(() => {});
    }
}

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

                notifyAdminsOfShiftRequest({
                    baseUrl: buildAppBaseUrl(request),
                    requestId: shiftRequest.id,
                    workerName: user.name,
                    storeName: assignment.job.store.name,
                    dateLabel: formatDateLabel(assignment.date),
                    startTime: assignment.job.startTimeStr,
                    endTime: assignment.job.endTimeStr,
                    marketId: assignment.job.marketId
                }).catch(() => {});

                return NextResponse.json(shiftRequest);
            }

            // Legacy flow: request an OPEN job by jobId
            if (!jobId) return NextResponse.json({ error: "Missing jobId or assignmentId" }, { status: 400 });

            const job = await prisma.job.findUnique({ where: { id: jobId }, include: { store: true } });
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

            notifyAdminsOfShiftRequest({
                baseUrl: buildAppBaseUrl(request),
                requestId: shiftRequest.id,
                workerName: user.name,
                storeName: job.store.name,
                dateLabel: formatDateLabel(job.date),
                startTime: job.startTimeStr,
                endTime: job.endTimeStr,
                marketId: job.marketId
            }).catch(() => {});

            return NextResponse.json(shiftRequest);
        }

        // ── RELEASE: Request to release an assigned shift ────────────────────────
        if (action === "RELEASE") {
            console.log("[RELEASE] user:", user.id, "assignmentId:", assignmentId, "jobId:", jobId);
            // New flow: release by assignmentId
            let targetAssignment = assignmentId
                ? await prisma.jobAssignment.findUnique({
                    where: { id: assignmentId },
                    include: { job: { include: { store: true } } }
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
                    include: { job: { include: { store: true } } }
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

            // Captured as a const so the type stays narrowed (non-null) inside the
            // fire-and-forget closure below — `targetAssignment` is a reassignable
            // `let` and TS won't retain narrowing for it across a nested closure.
            const assignment = targetAssignment;

            // 2-hour minimum window check
            if (assignment.date && assignment.job.startTimeStr) {
                const tz = resolveTimezone(request);
                const dateStr = toUTCLocalDateStr(new Date(assignment.date));
                const shiftStart = localTimeToUTC(dateStr, assignment.job.startTimeStr, tz);
                const diffMs = shiftStart.getTime() - Date.now();
                if (diffMs < 2 * 60 * 60 * 1000) {
                    throw new AppError("Cannot release a shift less than 2 hours before it starts", 400);
                }
            }

            // Prevent duplicate pending request for same assignment
            const existingRelease = await prisma.releaseRequest.findFirst({
                where: { assignmentId: assignment.id, workerId: user.id, status: "PENDING" }
            });
            if (existingRelease) {
                throw new AppError("A release request for this shift is already pending", 400);
            }

            const releaseRequest = await prisma.releaseRequest.create({
                data: {
                    jobId: assignment.jobId,
                    workerId: user.id,
                    assignmentId: assignment.id,
                    date: assignment.date,
                    reason: reason || "No reason provided",
                    status: "PENDING"
                }
            });

            (async () => {
                const baseUrl = buildAppBaseUrl(request);
                const reviewUrl = `${baseUrl}/admin/shift-release-approvals?tab=release-requests&highlight=${releaseRequest.id}`;
                const recipients = await getAdminAndMarketManagerEmails(assignment.job.marketId);
                for (const email of recipients) {
                    sendShiftReleaseRequestedEmail(
                        email,
                        user.name,
                        assignment.job.store.name,
                        formatDateLabel(assignment.date),
                        assignment.job.startTimeStr || "",
                        assignment.job.endTimeStr || "",
                        releaseRequest.reason || "No reason provided",
                        reviewUrl
                    ).catch(() => {});
                }
            })().catch(() => {});

            return NextResponse.json(releaseRequest);
        }

        throw new AppError("Invalid action", 400);
    } catch (error) {
        return handleApiError(error);
    }
}
