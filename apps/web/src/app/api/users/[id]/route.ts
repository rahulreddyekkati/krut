import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/users/[id] - Get single user
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await context.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                market: true,
                managedMarket: true
            }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/users/[id] - Update user details
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { role, status, hourlyWage, name, email, marketId, managedMarketId, manualWorkedHours } = body;

        const updateData = {
            role,
            status,
            name,
            email,
            hourlyWage: hourlyWage !== undefined ? parseFloat(hourlyWage) : undefined,
            manualWorkedHours: manualWorkedHours !== undefined ? parseFloat(manualWorkedHours) : undefined,
            marketId,
            managedMarketId
        };

        let user;
        if (status === 'DEACTIVATED') {
            user = await prisma.$transaction(async (tx: any) => {
                const updatedUser = await tx.user.update({
                    where: { id },
                    data: updateData
                });

                await tx.releaseRequest.updateMany({
                    where: { workerId: id, status: 'PENDING' },
                    data: { status: 'CANCELLED' }
                });

                try {
                    await tx.shiftRequest.updateMany({
                        where: { workerId: id, status: 'PENDING' },
                        data: { status: 'CANCELLED' }
                    });
                } catch (e) {
                    // Ignore if model does not exist or named differently
                }

                const activeAssignment = await tx.jobAssignment.findFirst({
                    where: { workerId: id, clockIn: { not: null }, clockOut: null }
                });

                if (activeAssignment) {
                    const now = new Date();
                    await tx.jobAssignment.update({
                        where: { id: activeAssignment.id },
                        data: {
                            clockOut: now,
                            status: 'RECAP_PENDING',
                            workedHours: parseFloat(Math.max(0, (now.getTime() - activeAssignment.clockIn.getTime()) / (1000 * 60 * 60)).toFixed(2))
                        }
                    });

                    await tx.job.update({
                        where: { id: activeAssignment.jobId },
                        data: { status: 'RECAP_PENDING' }
                    });
                }

                return updatedUser;
            });
        } else {
            user = await prisma.user.update({
                where: { id },
                data: updateData
            });
        }

        return NextResponse.json(user);
    } catch (error: any) {
        console.error("Update user error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
