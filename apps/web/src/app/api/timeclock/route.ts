import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { getLocalDayBoundsUTC, localShiftEndToUTC, toLocalDateStr, toUTCLocalDateStr, resolveStoreTimezone, storeToday } from "@/lib/timezone";
import { toZonedTime } from "date-fns-tz";
import { sendPushToUser } from "@/lib/notifications";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        // No request timezone here on purpose: everything below is about a shift, and a
        // shift's day and times are wall-clock values at its store. The phone's zone (or
        // the Central fallback when the header was missing) used to decide "today" and
        // the auto clock-out time, which stamped Mountain stores an hour early.
        const now = new Date();

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
                        store: { select: { name: true, address: true, latitude: true, longitude: true, radius: true, chain: true, timezone: true } }
                    }
                }
            },
            orderBy: { clockIn: "desc" }
        }) as any;

        // 2. If no shift is currently "Clocked In", look for today's assignment (scheduled).
        // "Today" is the calendar day at each shift's own store. Dates are stored as
        // UTC-midnight markers, and a marker one day either side of the UTC date can be
        // "today" somewhere in the US, so fetch that window and keep the row whose marker
        // is today at its store.
        if (!activeAssignment) {
            const DAY_MS = 24 * 60 * 60 * 1000;
            const utcToday = new Date(toUTCLocalDateStr(now) + "T00:00:00.000Z");
            const candidates = await prisma.jobAssignment.findMany({
                where: {
                    workerId: user.id,
                    OR: [
                        { date: { gte: new Date(utcToday.getTime() - DAY_MS), lte: new Date(utcToday.getTime() + DAY_MS) } },
                        { isRecurring: true, date: null }
                    ]
                },
                include: {
                    job: {
                        include: {
                            store: { select: { name: true, address: true, latitude: true, longitude: true, radius: true, chain: true, timezone: true } }
                        }
                    }
                },
                orderBy: { createdAt: "desc" }
            }) as any[];

            activeAssignment = candidates.find((a) => {
                const storeTz = resolveStoreTimezone(a.job.store);
                return a.date
                    ? toUTCLocalDateStr(new Date(a.date)) === toLocalDateStr(now, storeTz)
                    : a.dayOfWeek === toZonedTime(now, storeTz).getDay();
            }) ?? null;

            // 3. If it's a recurring template, check if a materialized instance for today already exists
            if (activeAssignment?.isRecurring) {
                const todayUTCMidnight = storeToday(resolveStoreTimezone(activeAssignment.job.store), now);
                const tomorrowUTCMidnight = new Date(todayUTCMidnight.getTime() + DAY_MS);
                const instance = await prisma.jobAssignment.findFirst({
                    where: {
                        workerId: user.id,
                        jobId: activeAssignment.jobId,
                        date: { gte: todayUTCMidnight, lt: tomorrowUTCMidnight },
                        isRecurring: false
                    },
                    include: {
                        job: {
                            include: {
                                store: { select: { name: true, address: true, latitude: true, longitude: true, radius: true, chain: true, timezone: true } }
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
            const startTimeStr = (activeAssignment as any).customStartTimeStr ?? activeAssignment.job.startTimeStr ?? "00:00";
            const [endH, endM] = endTimeStr.split(':').map(Number);
            const endTimeMins = endH * 60 + endM;

            // Shift times are wall-clock times at the store, so everything that turns them
            // into a real instant must use the store's timezone — never the request's (a
            // device reporting another zone, or no zone at all, falls back to Central and
            // stamps Eastern stores an hour late and Mountain stores an hour early). Same
            // rule as cron/auto-clockout.
            const storeTz = resolveStoreTimezone(activeAssignment.job.store);

            // 1. Reset stale timestamps for recurring shifts (TEMPLATE ONLY)
            if (activeAssignment.isRecurring) {
                const { start: startOfTodayUTC, end: endOfTodayUTC } = getLocalDayBoundsUTC(storeTz);
                const clockInDate = activeAssignment.clockIn ? new Date(activeAssignment.clockIn) : null;
                if (clockInDate && (clockInDate < startOfTodayUTC || clockInDate > endOfTodayUTC)) {
                    activeAssignment.clockIn = null;
                    activeAssignment.clockOut = null;
                }
            }

            const storeNow = toZonedTime(now, storeTz);
            const storeNowMins = storeNow.getHours() * 60 + storeNow.getMinutes();

            const todayStr = toLocalDateStr(now, storeTz);
            const shiftDateStr = activeAssignment.date
                ? new Date(activeAssignment.date).toISOString().split('T')[0]
                : toLocalDateStr(new Date(activeAssignment.clockIn), storeTz);
            const isPastDay = shiftDateStr < todayStr;

            // 2. Auto clock-out if past end time OR if it's a shift from a previous day
            // Use customEndTimeStr if admin set an override, else fall back to job's endTimeStr (N4)
            const effectiveEndTimeStr = (activeAssignment as any).customEndTimeStr ?? endTimeStr;
            const [effEndH, effEndM] = effectiveEndTimeStr.split(':').map(Number);
            const effEndTimeMins = effEndH * 60 + effEndM;

            if (activeAssignment.clockIn && !activeAssignment.clockOut && (isPastDay || storeNowMins > effEndTimeMins + 10)) {
                const autoClockOut = localShiftEndToUTC(shiftDateStr, startTimeStr, effectiveEndTimeStr, storeTz);

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
                        job: { include: { store: { select: { name: true, address: true, latitude: true, longitude: true, radius: true, chain: true, timezone: true } } } }
                    }
                }) as any;

                await prisma.job.update({
                    where: { id: activeAssignment!.jobId },
                    data: { status: "RECAP_PENDING" }
                });
            }
        }

        if (activeAssignment && activeAssignment.job) {
            activeAssignment = {
                ...activeAssignment,
                job: {
                    ...activeAssignment.job,
                    startTimeStr: activeAssignment.customStartTimeStr ?? activeAssignment.job.startTimeStr,
                    endTimeStr:   activeAssignment.customEndTimeStr   ?? activeAssignment.job.endTimeStr,
                }
            };
        }

        return NextResponse.json({ activeAssignment });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        const body = await request.json();
        const { action, assignmentId } = body;

        if (!assignmentId || !action) {
            throw new AppError("Missing required fields", 400);
        }

        const assignment = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            include: { job: { include: { store: { select: { name: true, address: true, latitude: true, longitude: true, radius: true, chain: true, timezone: true } } } } }
        });

        if (!assignment || assignment.workerId !== user.id) {
            throw new AppError("Assignment not found or unauthorized", 404);
        }

        const now = new Date();

        if (action === "CLOCK_IN") {
            // N3: Clock-in is normally mobile-app only — web browser GPS is less reliable
            // for geofencing. TEMPORARY (2026-07-23, mobile app auth outage post-Vercel-
            // transfer): allow web clock-in too, but only with a real, verified location —
            // mobile keeps its existing behavior unchanged. Revert to mobile-only once the
            // mobile app fix is confirmed live for everyone.
            const isMobileApp = request.headers.get("x-app-client") === "mobile-app";
            const { latitude: clockInLat, longitude: clockInLng } = body;
            if (!isMobileApp && (clockInLat == null || clockInLng == null)) {
                throw new AppError(
                    "Location access is required to clock in from the web. Please allow location access and try again.",
                    403
                );
            }

            // Block clock-in if worker has any unsubmitted recaps
            const pendingRecap = await prisma.jobAssignment.findFirst({
                where: {
                    workerId: user.id,
                    status: "RECAP_PENDING",
                    id: { not: assignmentId },
                    OR: [
                        { recap: { is: null } },
                        { recap: { status: "REJECTED" } }
                    ]
                },
                include: { job: { include: { store: { select: { name: true } } } } }
            });
            if (pendingRecap) {
                const storeName = pendingRecap.job?.store?.name || "a previous shift";
                throw new AppError(
                    `You have an unsubmitted recap for ${storeName}. Please complete it before clocking in to your next shift.`,
                    403
                );
            }

            // Reject clock-in if outside shift window
            const { toZonedTime } = await import("date-fns-tz");
            // Store's timezone, not the request's — see the note in GET above.
            const zonedNow = toZonedTime(now, resolveStoreTimezone(assignment.job.store));
            const nowMins = zonedNow.getHours() * 60 + zonedNow.getMinutes();
            const startTimeStr = (assignment as any).customStartTimeStr ?? assignment.job.startTimeStr;
            const endTimeStr = (assignment as any).customEndTimeStr ?? assignment.job.endTimeStr;
            const [startH, startM] = startTimeStr.split(":").map(Number);
            const [endH, endM] = endTimeStr.split(":").map(Number);
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;
            const EARLY_CLOCKIN_BUFFER_MINS = 10;
            if (nowMins < startMins - EARLY_CLOCKIN_BUFFER_MINS) {
                throw new AppError(
                    `Your shift doesn't start until ${startH % 12 || 12}:${String(startM).padStart(2, "0")} ${startH >= 12 ? "PM" : "AM"}. You can clock in up to 10 minutes early.`,
                    400
                );
            }
            if (nowMins > endMins + 10) {
                throw new AppError(
                    `Your shift ended at ${endH % 12 || 12}:${String(endM).padStart(2, "0")} ${endH >= 12 ? "PM" : "AM"}. Clock-in is no longer available.`,
                    400
                );
            }

            // Geofence check: worker must be within store radius
            const { latitude, longitude } = body;
            if (latitude != null && longitude != null) {
                const store = assignment.job.store as any;
                if (store?.latitude != null && store?.longitude != null && store?.radius != null) {
                    const R = 6371000; // Earth radius in meters
                    const toRad = (deg: number) => (deg * Math.PI) / 180;
                    const dLat = toRad(latitude - store.latitude);
                    const dLng = toRad(longitude - store.longitude);
                    const a =
                        Math.sin(dLat / 2) ** 2 +
                        Math.cos(toRad(store.latitude)) * Math.cos(toRad(latitude)) *
                        Math.sin(dLng / 2) ** 2;
                    const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    if (distance > store.radius) {
                        throw new AppError(
                            `You are ${Math.round(distance)}m away from ${store.name}. Must be within ${store.radius}m to clock in.`,
                            403
                        );
                    }
                }
            }

            let targetAssignmentId = assignmentId;

            // Only materialize if this is a true recurring template (isRecurring=true AND no date).
            // Dated recurring instances (isRecurring=true WITH a date) are clocked in directly.
            if (assignment.isRecurring && !assignment.date) {
                // The shift date is the calendar day at the store, not on the worker's phone.
                const todayLocalStr = toLocalDateStr(new Date(), resolveStoreTimezone(assignment.job.store));
                const todayUTCMidnight = new Date(todayLocalStr + "T00:00:00.000Z");
                const tomorrowUTCMidnight = new Date(todayLocalStr + "T00:00:00.000Z");
                tomorrowUTCMidnight.setUTCDate(tomorrowUTCMidnight.getUTCDate() + 1);

                // Not filtering on isRecurring here — any row already dated for today (whether a
                // recurring instance or a fresh materialization) counts as "already exists" and
                // must be reused, or a second clock-in attempt creates a duplicate shift.
                const existingInstance = await prisma.jobAssignment.findFirst({
                    where: {
                        workerId: user.id,
                        jobId: assignment.jobId,
                        date: { gte: todayUTCMidnight, lt: tomorrowUTCMidnight }
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
                            date: todayUTCMidnight,
                            isRecurring: false,
                            breakTimeMinutes: assignment.breakTimeMinutes
                        }
                    });
                    targetAssignmentId = newInstance.id;
                }
            } else {
                // Specific date assignment (or dated recurring instance) — clock in directly
                if (assignment.clockIn) {
                    return NextResponse.json({ error: "Already clocked in" }, { status: 400 });
                }
            }

            // MAJ-06: Atomic clock-in — only update if clockIn is still null
            const updated = await prisma.jobAssignment.updateMany({
                where: { id: targetAssignmentId, clockIn: null },
                data: { clockIn: now, clockOut: null, status: "IN_PROGRESS" }
            });
            if (updated.count === 0) {
                throw new AppError("Already clocked in", 409);
            }
            return NextResponse.json({ success: true });
        } else if (action === "CLOCK_OUT") {
            if (!assignment.clockIn) {
                throw new AppError("Must clock in first", 400);
            }

            let clockOutTime = new Date();

            // Cap clockOut at scheduled end time to prevent extra hours from late clock-outs (e.g. from home)
            const startTimeStr = (assignment as any).customStartTimeStr ?? assignment.job.startTimeStr;
            const effectiveEndTimeStr = (assignment as any).customEndTimeStr ?? assignment.job.endTimeStr;
            // Store's timezone, not the request's — see the note in GET above.
            const storeTz = resolveStoreTimezone(assignment.job.store);
            const shiftDateStr = assignment.date
                ? new Date(assignment.date).toISOString().split('T')[0]
                : toLocalDateStr(new Date(assignment.clockIn), storeTz);
            const scheduledEnd = localShiftEndToUTC(shiftDateStr, startTimeStr, effectiveEndTimeStr, storeTz);

            if (clockOutTime.getTime() > scheduledEnd.getTime()) {
                clockOutTime = scheduledEnd;
            }

            // CRIT-09 + MAJ-07: Atomic $transaction with clockOut null guard
            const result = await prisma.$transaction(async (tx: any) => {
                // Atomic guard — only proceed if clockOut is still null
                const guard = await tx.jobAssignment.updateMany({
                    where: { id: assignmentId, clockOut: null },
                    data: { clockOut: clockOutTime, status: "RECAP_PENDING" }
                });

                if (guard.count === 0) {
                    throw new AppError("Already clocked out", 409);
                }

                // Close any in-progress break so break time is fully counted
                const activeBreak = await tx.break.findFirst({
                    where: { assignmentId, endTime: null }
                });
                if (activeBreak) {
                    const breakMins = (clockOutTime.getTime() - activeBreak.startTime.getTime()) / 60000;
                    await tx.break.update({
                        where: { id: activeBreak.id },
                        data: { endTime: clockOutTime, durationMins: breakMins }
                    });
                    await tx.jobAssignment.update({
                        where: { id: assignmentId },
                        data: { breakTimeMinutes: { increment: breakMins } }
                    });
                }

                // Re-fetch to get accurate breakTimeMinutes (including any just-closed break)
                const fresh = await tx.jobAssignment.findUnique({ where: { id: assignmentId } });
                const grossMinutes = (clockOutTime.getTime() - assignment.clockIn!.getTime()) / 60000;
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

                return { clockOut: clockOutTime, workedHours, workerId: assignment.workerId, storeName: assignment.job.store?.name || 'the store' };
            });

            sendPushToUser(
                result.workerId,
                "Recap Required",
                `Please submit your recap for your shift at ${result.storeName}. You have clocked out — don't forget to submit your recap.`
            ).catch(() => {});
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
