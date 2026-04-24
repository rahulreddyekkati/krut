import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/users/[id]/assignments - Fetch shifts for a worker
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await context.params;

        if (
            session.user.role !== "ADMIN" &&
            session.user.role !== "MARKET_MANAGER" &&
            session.user.id !== id
        ) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const assignments = await prisma.jobAssignment.findMany({
            where: { workerId: id },
            include: {
                job: true
            }
        });

        return NextResponse.json(assignments);
    } catch (error: any) {
        console.error("Fetch assignments error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/users/[id]/assignments - Assign a job to a worker
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { jobId, selectedDays, isRecurring, date } = body;

        if (!jobId) {
            return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
        }

        const assignments = [];

        // Handle recurring selection (days of the week)
        if (isRecurring && selectedDays && Array.isArray(selectedDays)) {
            for (const dayId of selectedDays) {
                const assignment = await prisma.jobAssignment.create({
                    data: {
                        workerId: id,
                        jobId,
                        dayOfWeek: dayId,
                        isRecurring: true
                    }
                });
                assignments.push(assignment);
            }
        }
        // Handle one-off date selection
        else if (date) {
            const assignment = await prisma.jobAssignment.create({
                data: {
                    workerId: id,
                    jobId,
                    date: new Date(date),
                    isRecurring: false
                }
            });
            assignments.push(assignment);
        } else {
            return NextResponse.json({ error: "Must provide either days for recurring shift or a specific date" }, { status: 400 });
        }

        return NextResponse.json({ success: true, count: assignments.length, assignments });
    } catch (error: any) {
        console.error("Create assignment error:", error);
        return NextResponse.json({
            error: error.message || "Internal server error",
            stack: error.stack
        }, { status: 500 });
    }
}

// PATCH /api/users/[id]/assignments - Override start/end time for a specific assignment (N4)
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { assignmentId, customStartTimeStr, customEndTimeStr } = body;

        if (!assignmentId) {
            return NextResponse.json({ error: "Missing assignmentId" }, { status: 400 });
        }

        const old = await prisma.jobAssignment.findUnique({
            where: { id: assignmentId },
            select: { customStartTimeStr: true, customEndTimeStr: true }
        });

        const [updated] = await prisma.$transaction([
            prisma.jobAssignment.update({
                where: { id: assignmentId },
                data: { customStartTimeStr: customStartTimeStr ?? null, customEndTimeStr: customEndTimeStr ?? null }
            }),
            prisma.auditLog.create({
                data: {
                    actorId: session.user.id,
                    action: "SHIFT_TIME_EDIT",
                    entityType: "JobAssignment",
                    entityId: assignmentId,
                    oldValue: JSON.stringify({ customStartTimeStr: old?.customStartTimeStr, customEndTimeStr: old?.customEndTimeStr }),
                    newValue: JSON.stringify({ customStartTimeStr, customEndTimeStr }),
                }
            })
        ]);

        return NextResponse.json({ success: true, assignment: updated });
    } catch (error: any) {
        console.error("Patch assignment error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/users/[id]/assignments - Remove an assignment
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const { searchParams } = new URL(request.url);
        const assignmentId = searchParams.get("id");


        if (!assignmentId) {
            return NextResponse.json({ error: "Missing assignment id" }, { status: 400 });
        }

        await prisma.jobAssignment.delete({
            where: { id: assignmentId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete assignment error:", error);
        return NextResponse.json({
            error: error.message || "Internal server error",
            stack: error.stack
        }, { status: 500 });
    }
}
