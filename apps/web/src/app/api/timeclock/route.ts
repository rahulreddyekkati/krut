import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resolveTimezone, getLocalDayBoundsUTC, localShiftEndToUTC, toLocalDateStr } from "@/lib/timezone";
import { toZonedTime } from "date-fns-tz";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
                workerId: session.user.id,
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
                    workerId: session.user.id,
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
                        workerId: session.user.id,
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

            const shiftDate = activeAssignment.date ? new Date(activeAssignment.date) : startOfTodayUTC;
            const isPastDay = shiftDate < startOfTodayUTC;

            // 2. Auto clock-out if past end time OR if it's a shift from a previous day
            if (activeAssignment.clockIn && !activeAssignment.clockOut && (isPastDay || nowTimeMins > endTimeMins)) {
                // Use localShiftEndToUTC for DST-aware, overnight-aware clock-out
                const shiftDateStr = toLocalDateStr(
                    activeAssignment.date ? new Date(activeAssignment.date) : new Date(activeAssignment.clockIn),
                    tz
                );
                const autoClockOut = localShiftEndToUTC(shiftDateStr, startTimeStr, endTimeStr, tz);

                // Safety: if clockOut is still before clockIn (shouldn't happen now, but guard anyway)
                let finalClockOut = autoClockOut;
                if (autoClockOut.getTime() <= activeAssignment.clockIn.getTime()) {
                    const [sH, sM] = startTimeStr.split(':').map(Number);
                    const shiftDurationMins = ((endH * 60 + endM) - (sH * 60 + sM) + 1440) % 1440;
                    finalClockOut = new Date(activeAssignment.clockIn.getTime() + shiftDurationMins * 60 * 1000);
                }

                const diffMinutes = (finalClockOut.getTime() - activeAssignment.clockIn.getTime()) / (1000 * 60);
                const breakTimeMinutes = activeAssignment.breakTimeMinutes || 0;
                const workedHours = parseFloat(Math.max(0, (diffMinutes - breakTimeMinutes) / 60).toFixed(2));

                activeAssignment = await prisma.jobAssignment.update({
                    where: { id: activeAssignment.id },
                    data: { clockOut: finalClockOut, workedHours } as any,
                    include: {
                        job: {
                            include: {
                                store: { select: { name: true, address: true } }
                            }
                        }
                    }
                }) as any;

                // Also update job status
                await prisma.job.update({
                    where: { id: activeAssignment!.jobId },
                    data: { status: "RECAP_PENDING" }
                });
            }
        }

        return NextResponse.json({ activeAssignment });
    } catch (error) {
        console.error("Timeclock status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Resolve timezone ONCE
        const tz = resolveTimezone(request);
        const body = await request.json();
        const { action, assignmentId } = body; // action: 'CLOCK_IN' or 'CLOCK_OUT'

        if (!assignmentId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const assignment = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            include: { job: true }
        });

        if (!assignment || assignment.workerId !== session.user.id) {
            return NextResponse.json({ error: "Assignment not found or unauthorized" }, { status: 404 });
        }

        const now = new Date();

        if (action === "CLOCK_IN") {
            let targetAssignmentId = assignmentId;

            // If it's a recurring template, materialize it into a specific date instance
            if (assignment.isRecurring) {
                const { start: dbTodayStart, end: dbTodayEnd } = getLocalDayBoundsUTC(tz);

                const existingInstance = await prisma.jobAssignment.findFirst({
                    where: {
                        workerId: session.user.id,
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
                    // Create new instance for today
                    const newInstance = await prisma.jobAssignment.create({
                        data: {
                            workerId: session.user.id,
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

            const updated = await prisma.jobAssignment.update({
                where: { id: targetAssignmentId },
                data: { clockIn: now, clockOut: null }
            });
            return NextResponse.json(updated);
        } else if (action === "CLOCK_OUT") {
            if (!assignment.clockIn) {
                return NextResponse.json({ error: "Must clock in first" }, { status: 400 });
            }
            if (assignment.clockOut) {
                return NextResponse.json({ error: "Already clocked out" }, { status: 400 });
            }

            const diffMinutes = (now.getTime() - assignment.clockIn.getTime()) / (1000 * 60);
            const breakTimeMinutes = assignment.breakTimeMinutes || 0;
            const workedHours = parseFloat(Math.max(0, (diffMinutes - breakTimeMinutes) / 60).toFixed(2));

            const updated = await prisma.jobAssignment.update({
                where: { id: assignmentId },
                data: { clockOut: now, workedHours }
            });

            // Update job status if needed
            await prisma.job.update({
                where: { id: assignment.jobId },
                data: { status: "RECAP_PENDING" }
            });

            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Timeclock POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
