import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

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
                        { date: { gte: startOfToday, lte: endOfToday } },
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
                        date: { gte: startOfToday, lte: endOfToday },
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
            const nowTime = now.getHours() * 60 + now.getMinutes();
            const [endH, endM] = (activeAssignment.job.endTimeStr || "23:59").split(':').map(Number);
            const endTimeMins = endH * 60 + endM;

            // 1. Reset stale timestamps for recurring shifts (TEMPLATE ONLY)
            if (activeAssignment.isRecurring) {
                const clockInDate = activeAssignment.clockIn ? new Date(activeAssignment.clockIn) : null;
                if (clockInDate && (clockInDate < startOfToday || clockInDate > endOfToday)) {
                    // This is a safety reset for the template record itself if it leaked data
                    activeAssignment.clockIn = null;
                    activeAssignment.clockOut = null;
                }
            }

            const shiftDate = activeAssignment.date ? new Date(activeAssignment.date) : startOfToday;
            const isPastDay = shiftDate < startOfToday;

            // 2. Auto clock-out if past end time OR if it's a shift from a previous day
            if (activeAssignment.clockIn && !activeAssignment.clockOut && (isPastDay || nowTime > endTimeMins)) {
                console.log(`Auto clock-out triggered for assignment ${activeAssignment.id}`);
                const autoClockOut = new Date(activeAssignment.clockIn);
                
                // If it's an overnight shift (end time is smaller than start time), add 1 day
                const [startH, startM] = (activeAssignment.job.startTimeStr || "00:00").split(':').map(Number);
                if (endH < startH || (endH === startH && endM < startM)) {
                    autoClockOut.setDate(autoClockOut.getDate() + 1);
                }
                
                autoClockOut.setHours(endH, endM, 0, 0);

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
                // Check if already materialized today
                const startOfToday = new Date(now);
                startOfToday.setHours(0, 0, 0, 0);
                const endOfToday = new Date(now);
                endOfToday.setHours(23, 59, 59, 999);

                const existingInstance = await prisma.jobAssignment.findFirst({
                    where: {
                        workerId: session.user.id,
                        jobId: assignment.jobId,
                        date: { gte: startOfToday, lte: endOfToday },
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
                            date: startOfToday,
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
