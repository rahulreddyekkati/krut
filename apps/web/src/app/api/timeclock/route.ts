import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { resolveTimezone, getLocalDayBoundsUTC, localShiftEndToUTC, toLocalDateStr } from "@/lib/timezone";
import { toZonedTime } from "date-fns-tz";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        // Resolve timezone ONCE per request
        const tz = resolveTimezone(request);
        const now = new Date();
        const { start: startOfTodayUTC, end: endOfTodayUTC } = getLocalDayBoundsUTC(tz);

        // Get "local now" for hour/minute comparisons
        const zonedNow = toZonedTime(now, tz);
        const nowTimeMins = zonedNow.getHours() * 60 + zonedNow.getMinutes();

        // 1. Find the currently active shift (Clocked In but not Out)
        // This takes priority over "today's template" because a worker might have a stale shift from yesterday.
        let activeAssignment = await prisma.jobAssignment.findFirst({
            where: {
                workerId: user.id,
                clockIn: { not: null },
                clockOut: null
            },
            include: {
                job: {
                    include: {
                        store: { select: { name: true, address: true } }
                    }
                }
            },
            orderBy: { clockIn: "desc" }
        }) as any;

        // 2. If no shift is currently "Clocked In", look for today's assignment (scheduled)
        if (!activeAssignment) {
            activeAssignment = await prisma.jobAssignment.findFirst({
                where: {
                    workerId: user.id,
                    OR: [
                        { date: { gte: startOfTodayUTC, lte: endOfTodayUTC } },
                        {
                            isRecurring: true,
                            dayOfWeek: zonedNow.getDay()
                        }
                    ]
                },
                include: {
                    job: {
                        include: {
                            store: { select: { name: true, address: true } }
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            }) as any;

            // 3. If it's a recurring template, check if a materialized instance for today already exists
            if (activeAssignment?.isRecurring) {
                const instance = await prisma.jobAssignment.findFirst({
                    where: {
                        workerId: user.id,
                        jobId: activeAssignment.jobId,
                        date: { gte: startOfTodayUTC, lte: endOfTodayUTC },
                        isRecurring: false
                    },
                    include: {
                        job: {
                            include: {
                                store: { select: { name: true, address: true } }
                            }
                        }
                    }
                });
                if (instance) {
                    activeAssignment = instance;
                }
            }
        }

        // Robustness: If this is a recurring shift, check if the timestamps are from today.
        if (activeAssignment) {
            const endTimeStr = activeAssignment.job.endTimeStr || "23:59";
            const startTimeStr = activeAssignment.job.startTimeStr || "00:00";
            const [endH, endM] = endTimeStr.split(':').map(Number);
            const endTimeMins = endH * 60 + endM;

            // 1. Reset stale timestamps for recurring shifts (TEMPLATE ONLY)
            if (activeAssignment.isRecurring) {
                const clockInDate = activeAssignment.clockIn ? new Date(activeAssignment.clockIn) : null;
                if (clockInDate && (clockInDate < startOfTodayUTC || clockInDate > endOfTodayUTC)) {
                    activeAssignment.clockIn = null;
                    activeAssignment.clockOut = null;
                }
            }

            const todayStr = toLocalDateStr(now, tz);
            const shiftDateStr = activeAssignment.date 
                ? new Date(activeAssignment.date).toISOString().split('T')[0]
                : toLocalDateStr(new Date(activeAssignment.clockIn), tz);
            const isPastDay = shiftDateStr < todayStr;

            // 2. Auto clock-out if past end time OR if it's a shift from a previous day
            // Use customEndTimeStr if admin set an override, else fall back to job's endTimeStr (N4)
            const effectiveEndTimeStr = (activeAssignment as any).customEndTimeStr ?? endTimeStr;
            const [effEndH, effEndM] = effectiveEndTimeStr.split(':').map(Number);
            const effEndTimeMins = effEndH * 60 + effEndM;

            if (activeAssignment.clockIn && !activeAssignment.clockOut && (isPastDay || nowTimeMins > effEndTimeMins)) {
                const autoClockOutDateStr = toLocalDateStr(
                    activeAssignment.date ? new Date(activeAssignment.date) : new Date(activeAssignment.clockIn),
                    tz
                );
                const autoClockOut = localShiftEndToUTC(autoClockOutDateStr, startTimeStr, effectiveEndTimeStr, tz);

                let finalClockOut = autoClockOut;
                if (autoClockOut.getTime() <= activeAssignment.clockIn.getTime()) {
                    const [sH, sM] = startTimeStr.split(':').map(Number);
                    const shiftDurationMins = ((effEndH * 60 + effEndM) - (sH * 60 + sM) + 1440) % 1440;
                    finalClockOut = new Date(activeAssignment.clockIn.getTime() + shiftDurationMins * 60 * 1000);
                }

                // Close any in-progress break before computing worked hours
                const activeBreak = await prisma.break.findFirst({
                    where: { assignmentId: activeAssignment.id, endTime: null }
                });
                let extraBreakMins = 0;
                if (activeBreak) {
                    extraBreakMins = (finalClockOut.getTime() - activeBreak.startTime.getTime()) / 60000;
                    await prisma.break.update({
                        where: { id: activeBreak.id },
                        data: { endTime: finalClockOut, durationMins: extraBreakMins }
                    });
                    await prisma.jobAssignment.update({
                        where: { id: activeAssignment.id },
                        data: { breakTimeMinutes: { increment: extraBreakMins } }
                    });
                }

                const diffMinutes = (finalClockOut.getTime() - activeAssignment.clockIn.getTime()) / (1000 * 60);
                const totalBreakMins = (activeAssignment.breakTimeMinutes || 0) + extraBreakMins;
                const workedHours = parseFloat(Math.max(0, (diffMinutes - totalBreakMins) / 60).toFixed(2));

                activeAssignment = await prisma.jobAssignment.update({
                    where: { id: activeAssignment.id },
                    data: { clockOut: finalClockOut, workedHours, status: "RECAP_PENDING" } as any,
                    include: {
                        job: { include: { store: { select: { name: true, address: true } } } }
                    }
                }) as any;

                await prisma.job.update({
                    where: { id: activeAssignment!.jobId },
                    data: { status: "RECAP_PENDING" }
                });
            }
        }

        return NextResponse.json({ activeAssignment });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        // Resolve timezone ONCE
        const tz = resolveTimezone(request);
        const body = await request.json();
        const { action, assignmentId } = body;

        if (!assignmentId || !action) {
            throw new AppError("Missing required fields", 400);
        }

        const assignment = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            include: { job: { include: { store: true } } }
        });

        if (!assignment || assignment.workerId !== user.id) {
            throw new AppError("Assignment not found or unauthorized", 404);
        }

        const now = new Date();

        if (action === "CLOCK_IN") {
            // N3: Clock-in is mobile-app only — web browser GPS is too inaccurate for geofencing
            const isMobileApp = request.headers.get("x-app-client") === "mobile-app";
            if (!isMobileApp) {
                throw new AppError("Clock-in is only available from the mobile app", 403);
            }

            let targetAssignmentId = assignmentId;

            // If it's a recurring template, materialize it into a specific date instance
            if (assignment.isRecurring) {
                const { start: dbTodayStart, end: dbTodayEnd } = getLocalDayBoundsUTC(tz);

                const existingInstance = await prisma.jobAssignment.findFirst({
                    where: {
                        workerId: user.id,
                        jobId: assignment.jobId,
                        date: { gte: dbTodayStart, lte: dbTodayEnd },
                        isRecurring: false
                    }
                });

                if (existingInstance) {
                    targetAssignmentId = existingInstance.id;
                    if (existingInstance.clockIn) {
                        return NextResponse.json({ error: "Already clocked in" }, { status: 400 });
                    }
                } else {
                    const newInstance = await prisma.jobAssignment.create({
                        data: {
                            workerId: user.id,
                            jobId: assignment.jobId,
                            date: dbTodayStart,
                            isRecurring: false,
                            breakTimeMinutes: assignment.breakTimeMinutes
                        }
                    });
                    targetAssignmentId = newInstance.id;
                }
            } else {
                if (assignment.clockIn) {
                    return NextResponse.json({ error: "Already clocked in" }, { status: 400 });
                }
            }

            // MAJ-06: Atomic clock-in — only update if clockIn is still null
            const updated = await prisma.jobAssignment.updateMany({
                where: { id: targetAssignmentId, clockIn: null },
                data: { clockIn: now, clockOut: null }
            });
            if (updated.count === 0) {
                throw new AppError("Already clocked in", 409);
            }
            return NextResponse.json({ success: true });
        } else if (action === "CLOCK_OUT") {
            if (!assignment.clockIn) {
                throw new AppError("Must clock in first", 400);
            }

            const now = new Date();

            // CRIT-09 + MAJ-07: Atomic $transaction with clockOut null guard
            const result = await prisma.$transaction(async (tx: any) => {
                // Atomic guard — only proceed if clockOut is still null
                const guard = await tx.jobAssignment.updateMany({
                    where: { id: assignmentId, clockOut: null },
                    data: { clockOut: now, status: "RECAP_PENDING" }
                });

                if (guard.count === 0) {
                    throw new AppError("Already clocked out", 409);
                }

                // Close any in-progress break so break time is fully counted
                const activeBreak = await tx.break.findFirst({
                    where: { assignmentId, endTime: null }
                });
                if (activeBreak) {
                    const breakMins = (now.getTime() - activeBreak.startTime.getTime()) / 60000;
                    await tx.break.update({
                        where: { id: activeBreak.id },
                        data: { endTime: now, durationMins: breakMins }
                    });
                    await tx.jobAssignment.update({
                        where: { id: assignmentId },
                        data: { breakTimeMinutes: { increment: breakMins } }
                    });
                }

                // Re-fetch to get accurate breakTimeMinutes (including any just-closed break)
                const fresh = await tx.jobAssignment.findUnique({ where: { id: assignmentId } });
                const grossMinutes = (now.getTime() - assignment.clockIn!.getTime()) / 60000;
                const breakMinutes = fresh?.breakTimeMinutes ?? 0;
                const workedHours = parseFloat(Math.max(0, (grossMinutes - breakMinutes) / 60).toFixed(2));

                await tx.jobAssignment.update({
                    where: { id: assignmentId },
                    data: { workedHours }
                });

                await tx.job.update({
                    where: { id: assignment.jobId },
                    data: { status: "RECAP_PENDING" }
                });

                await tx.notification.create({
                    data: {
                        userId: assignment.workerId,
                        title: 'Recap Required',
                        message: `Please submit your recap for your shift at ${assignment.job.store?.name || 'the store'}. You have clocked out — don't forget to submit your recap.`
                    }
                });

                return { clockOut: now, workedHours };
            });

            return NextResponse.json(result);
        }

        // N2: Auto-break via geofence exit — BREAK_START and BREAK_END actions
        if (action === "BREAK_START") {
            if (!assignment.clockIn || assignment.clockOut) {
                throw new AppError("Must be clocked in to start a break", 400);
            }
            const existingBreak = await prisma.break.findFirst({
                where: { assignmentId, endTime: null }
            });
            if (existingBreak) {
                return NextResponse.json({ error: "Break already active" }, { status: 409 });
            }
            await prisma.break.create({
                data: { assignmentId, startTime: now }
            });
            return NextResponse.json({ success: true });
        }

        if (action === "BREAK_END") {
            const activeBreak = await prisma.break.findFirst({
                where: { assignmentId, endTime: null }
            });
            if (!activeBreak) {
                return NextResponse.json({ error: "No active break" }, { status: 409 });
            }
            const durationMins = (now.getTime() - activeBreak.startTime.getTime()) / 60000;
            await prisma.$transaction([
                prisma.break.update({
                    where: { id: activeBreak.id },
                    data: { endTime: now, durationMins }
                }),
                prisma.jobAssignment.update({
                    where: { id: assignmentId },
                    data: { breakTimeMinutes: { increment: durationMins } }
                })
            ]);
            return NextResponse.json({ success: true, durationMins });
        }

        throw new AppError("Invalid action", 400);
    } catch (error) {
        return handleApiError(error);
    }
}
