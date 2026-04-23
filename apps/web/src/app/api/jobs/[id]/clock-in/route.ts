import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { resolveTimezone, getLocalDayBoundsUTC, localTimeToUTC } from "@/lib/timezone";
import { isWithinRadius } from "@/lib/geo";

const CLOCK_IN_EARLY_WINDOW_MS = 15 * 60 * 1000; // 15 minutes before shift start

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request, ["WORKER"]);

        const { id: jobId } = await context.params;
        const body = await request.json();
        const { latitude, longitude } = body;

        // ── Fetch assignment + store GPS info ────────────────────────────────
        const assignment = await prisma.jobAssignment.findFirst({
            where: { jobId, workerId: user.id },
            include: { job: { include: { store: true } } }
        });

        if (!assignment) {
            throw new AppError("Not assigned to this job", 403);
        }

        const store = assignment.job.store;

        // ── CRIT-03: Geofence enforcement ────────────────────────────────────
        if (latitude == null || longitude == null) {
            throw new AppError("GPS coordinates are required to clock in", 400);
        }

        const workerLat = parseFloat(String(latitude));
        const workerLon = parseFloat(String(longitude));

        if (isNaN(workerLat) || isNaN(workerLon)) {
            throw new AppError("Invalid GPS coordinates", 400);
        }

        if (!isWithinRadius(workerLat, workerLon, store.latitude, store.longitude, store.radius)) {
            const distanceM = Math.round(
                require("@/lib/geo").haversineDistance(workerLat, workerLon, store.latitude, store.longitude)
            );
            throw new AppError(
                `You are ${distanceM}m away from ${store.name}. Must be within ${store.radius}m to clock in.`,
                403
            );
        }

        // ── CRIT-04: Early clock-in prevention ───────────────────────────────
        const tz = resolveTimezone(request);
        const { start: startOfToday } = getLocalDayBoundsUTC(tz);
        const now = new Date();

        if (assignment.job.startTimeStr) {
            const todayStr = startOfToday.toISOString().split("T")[0];
            const shiftStart = localTimeToUTC(todayStr, assignment.job.startTimeStr, tz);
            const msUntilStart = shiftStart.getTime() - now.getTime();

            if (msUntilStart > CLOCK_IN_EARLY_WINDOW_MS) {
                const minsUntil = Math.ceil(msUntilStart / 60000);
                throw new AppError(
                    `Shift starts in ${minsUntil} minutes. You can clock in up to 15 minutes early.`,
                    400
                );
            }
        }

        const { start: startOfTodayUTC, end: endOfTodayUTC } = getLocalDayBoundsUTC(tz);

        let targetAssignmentId = assignment.id;

        // ── Handle recurring shift materialization ───────────────────────────
        if (assignment.isRecurring) {
            const existingInstance = await prisma.jobAssignment.findFirst({
                where: {
                    workerId: user.id,
                    jobId: assignment.jobId,
                    date: { gte: startOfTodayUTC, lte: endOfTodayUTC },
                    isRecurring: false
                }
            });

            if (existingInstance) {
                targetAssignmentId = existingInstance.id;
                if (existingInstance.clockIn) {
                    throw new AppError("Already clocked in", 400);
                }
            } else {
                const newInstance = await prisma.jobAssignment.create({
                    data: {
                        workerId: user.id,
                        jobId: assignment.jobId,
                        date: startOfTodayUTC,
                        isRecurring: false,
                        breakTimeMinutes: assignment.breakTimeMinutes
                    }
                });
                targetAssignmentId = newInstance.id;
            }
        } else {
            if (assignment.clockIn) {
                throw new AppError("Already clocked in", 400);
            }
        }

        // ── MAJ-06: Atomic clock-in — only update if clockIn is still null ──
        const updated = await prisma.jobAssignment.updateMany({
            where: { id: targetAssignmentId, clockIn: null },
            data: { clockIn: now, status: "IN_PROGRESS" }
        });

        if (updated.count === 0) {
            throw new AppError("Already clocked in", 409);
        }

        // Update job status in a separate step (acceptable — job status is derived state)
        await prisma.job.update({
            where: { id: jobId },
            data: { status: "IN_PROGRESS" }
        });

        return NextResponse.json({ success: true, clockIn: now });
    } catch (error) {
        return handleApiError(error);
    }
}
