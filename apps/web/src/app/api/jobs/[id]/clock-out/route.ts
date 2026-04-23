import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

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

        const assignment = await prisma.jobAssignment.findFirst({
            where: {
                jobId,
                workerId: session.user.id,
                clockIn: { not: null },
                clockOut: null
            },
            include: { job: true },
            orderBy: { clockIn: 'desc' }
        });

        if (!assignment || !assignment.clockIn) {
            return NextResponse.json({ error: "Must be clocked in first" }, { status: 400 });
        }

        if (assignment.clockOut) {
            return NextResponse.json({ error: "Already clocked out" }, { status: 400 });
        }

        const clockOutTime = new Date();
        const diffMinutes = (clockOutTime.getTime() - assignment.clockIn.getTime()) / 60000;
        const breakTimeMinutes = (assignment as any).breakTimeMinutes || 0;
        const workedHours = parseFloat(Math.max(0, (diffMinutes - breakTimeMinutes) / 60).toFixed(2));

        await prisma.jobAssignment.update({
            where: { id: assignment.id },
            data: {
                clockOut: clockOutTime,
                workedHours,
                status: "RECAP_PENDING",
                job: { update: { status: "RECAP_PENDING" } }
            }
        });

        return NextResponse.json({ success: true, clockOut: clockOutTime });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
