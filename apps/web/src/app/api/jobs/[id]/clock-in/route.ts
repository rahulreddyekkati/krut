import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resolveTimezone, getLocalDayBoundsUTC } from "@/lib/timezone";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "WORKER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id: jobId } = await context.params;
        const { latitude, longitude } = await request.json();

        const assignment = await prisma.jobAssignment.findFirst({
            where: {
                jobId,
                workerId: session.user.id
            },
            include: { job: { include: { store: true } } }
        });

        if (!assignment) {
            return NextResponse.json({ error: "Not assigned to this job" }, { status: 403 });
        }

        if (assignment.clockIn) {
            return NextResponse.json({ error: "Already clocked in" }, { status: 400 });
        }

        // Geofencing (Simple check for now, can be sophisticated later)
        // For now, let's just log coordinates and proceed
        console.log(`Clock-in attempt at Job ${jobId} by ${session.user.email} from ${latitude}, ${longitude}`);

        const now = new Date();
        const tz = resolveTimezone(request);
        const { start: startOfToday, end: endOfToday } = getLocalDayBoundsUTC(tz);

        let targetAssignmentId = assignment.id;

        // If it's a recurring template, materialize it into a specific date instance
        if (assignment.isRecurring) {
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

        await prisma.jobAssignment.update({
            where: { id: targetAssignmentId },
            data: {
                clockIn: now,
                job: { update: { status: "IN_PROGRESS" } }
            }
        });

        return NextResponse.json({ success: true, clockIn: now });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
