import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const tzOffset = parseInt(request.headers.get("x-timezone-offset") || "0");
        const now = new Date();
        // Adjust "now" to local time based on the offset for hour/minute comparisons
        const localNow = new Date(now.getTime() - (tzOffset * 60 * 1000));
        
        // Compute "today" boundaries in the WORKER's local timezone, stored as UTC
        // localNow represents the worker's local clock (but stored in a Date object using UTC fields)
        const startOfToday = new Date(localNow);
        startOfToday.setUTCHours(0, 0, 0, 0);
        // Convert back to UTC for DB comparison
        const startOfTodayUTC = new Date(startOfToday.getTime() + (tzOffset * 60 * 1000));
        const endOfTodayUTC = new Date(startOfTodayUTC.getTime() + 24 * 60 * 60 * 1000 - 1);

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
                            dayOfWeek: now.getDay()
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
        // If not, treat them as null for the active session.
        if (activeAssignment) {
            const nowTime = localNow.getUTCHours() * 60 + localNow.getUTCMinutes();
            const [endH, endM] = (activeAssignment.job.endTimeStr || "23:59").split(':').map(Number);
            const endTimeMins = endH * 60 + endM;

            // 1. Reset stale timestamps for recurring shifts (TEMPLATE ONLY)
            if (activeAssignment.isRecurring) {
                const clockInDate = activeAssignment.clockIn ? new Date(activeAssignment.clockIn) : null;
                if (clockInDate && (clockInDate < startOfTodayUTC || clockInDate > endOfTodayUTC)) {
                    // This is a safety reset for the template record itself if it leaked data
                    activeAssignment.clockIn = null;
                    activeAssignment.clockOut = null;
                }
            }

            const shiftDate = activeAssignment.date ? new Date(activeAssignment.date) : startOfTodayUTC;
            const isPastDay = shiftDate < startOfTodayUTC;

            // 2. Auto clock-out if past end time OR if it's a shift from a previous day
            if (activeAssignment.clockIn && !activeAssignment.clockOut && (isPastDay || nowTime > endTimeMins)) {
                // Build the auto-clock-out time in the WORKER'S local timezone
                // shiftDay is in UTC; we need to place endH:endM in the worker's local tz
                const shiftDay = activeAssignment.date ? new Date(activeAssignment.date) : new Date(activeAssignment.clockIn);
                
                // Create a date for the shift day at midnight UTC
                const autoClockOut = new Date(shiftDay);
                // Set the time to endH:endM in UTC, then add the tzOffset to convert from local -> UTC
                // e.g. endTimeStr "17:00" CDT (offset 300) => 17:00 + 300min = 22:00 UTC
                autoClockOut.setUTCHours(endH, endM, 0, 0);
                autoClockOut.setTime(autoClockOut.getTime() + (tzOffset * 60 * 1000));
                
                // If it's an overnight shift (end time is smaller than start time), add 1 day
                const [startH, startM] = (activeAssignment.job.startTimeStr || "00:00").split(':').map(Number);
                if (endH < startH || (endH === startH && endM < startM)) {
                    autoClockOut.setDate(autoClockOut.getDate() + 1);
                }

                // Safety: if clockOut is still before clockIn (edge case), 
                // set clockOut to clockIn + shift duration
                if (autoClockOut.getTime() <= activeAssignment.clockIn.getTime()) {
                    const shiftDurationMins = ((endH * 60 + endM) - (startH * 60 + startM) + 1440) % 1440;
                    autoClockOut.setTime(activeAssignment.clockIn.getTime() + shiftDurationMins * 60 * 1000);
                }

                const diffMinutes = (autoClockOut.getTime() - activeAssignment.clockIn.getTime()) / (1000 * 60);
                const breakTimeMinutes = activeAssignment.breakTimeMinutes || 0;
                const workedHours = parseFloat(Math.max(0, (diffMinutes - breakTimeMinutes) / 60).toFixed(2));

                activeAssignment = await prisma.jobAssignment.update({
                    where: { id: activeAssignment.id },
                    data: { clockOut: autoClockOut, workedHours } as any,
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

        const tzOffset = parseInt(request.headers.get("x-timezone-offset") || "0");
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
        const localNow = new Date(now.getTime() - (tzOffset * 60 * 1000));

        if (action === "CLOCK_IN") {
            let targetAssignmentId = assignmentId;
            
            // If it's a recurring template, materialize it into a specific date instance
            if (assignment.isRecurring) {
                // Check if already materialized today (using worker's calendar day).
                const localTodayStart = new Date(localNow);
                localTodayStart.setUTCHours(0,0,0,0);
                // Convert back to UTC for DB query
                const dbTodayStart = new Date(localTodayStart.getTime() + (tzOffset * 60 * 1000));
                const dbTodayEnd = new Date(dbTodayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

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
                    // Create new instance for today (use the computed dbTodayStart)
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
