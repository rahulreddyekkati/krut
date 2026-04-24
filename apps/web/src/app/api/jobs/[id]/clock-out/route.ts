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
        const clockOutTime = new Date();

        const result = await prisma.$transaction(async (tx) => {
            // Atomic guard — updateMany with clockOut: null prevents double clock-out
            const updated = await tx.jobAssignment.updateMany({
                where: {
                    jobId,
                    workerId: session.user.id,
                    clockIn: { not: null },
                    clockOut: null,
                },
                data: { clockOut: clockOutTime, status: "RECAP_PENDING" }
            });

            if (updated.count === 0) {
                throw new Error("ALREADY_CLOCKED_OUT");
            }

            // Close any in-progress break so break time is fully accounted for
            const activeBreak = await tx.break.findFirst({
                where: {
                    assignment: { jobId, workerId: session.user.id },
                    endTime: null,
                }
            });
            if (activeBreak) {
                const breakMins = (clockOutTime.getTime() - activeBreak.startTime.getTime()) / 60000;
                await tx.break.update({
                    where: { id: activeBreak.id },
                    data: { endTime: clockOutTime, durationMins: breakMins }
                });
                await tx.jobAssignment.update({
                    where: { id: activeBreak.assignmentId },
                    data: { breakTimeMinutes: { increment: breakMins } }
                });
            }

            const assignment = await tx.jobAssignment.findFirst({
                where: { jobId, workerId: session.user.id, clockOut: clockOutTime }
            });

            if (!assignment || !assignment.clockIn) {
                throw new Error("ASSIGNMENT_NOT_FOUND");
            }

            const grossMinutes = (clockOutTime.getTime() - assignment.clockIn.getTime()) / 60000;
            const breakMinutes = assignment.breakTimeMinutes ?? 0;
            const workedHours = parseFloat(Math.max(0, (grossMinutes - breakMinutes) / 60).toFixed(2));

            await tx.jobAssignment.update({
                where: { id: assignment.id },
                data: { workedHours }
            });
            await tx.job.update({
                where: { id: jobId },
                data: { status: "RECAP_PENDING" }
            });

            return { clockOut: clockOutTime, workedHours };
        });

        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        if (error.message === "ALREADY_CLOCKED_OUT") {
            return NextResponse.json({ error: "Already clocked out" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
