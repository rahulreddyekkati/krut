import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// PUT /api/markets/[id] - Update a market
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const market = await prisma.market.update({
            where: { id },
            data: { name }
        });

        return NextResponse.json(market);
    } catch (error) {
        if ((error as any).code === "P2002") {
            return NextResponse.json({ error: "Market name already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/markets/[id] - Delete a market
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

        // Check if market has stores or jobs
        const market = await prisma.market.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { stores: true, jobs: true }
                }
            }
        });

        if (!market) {
            return NextResponse.json({ error: "Market not found" }, { status: 404 });
        }

        if (market._count.stores > 0 || market._count.jobs > 0) {
            return NextResponse.json({
                error: "Cannot delete market with existing stores or jobs. Please reassign or delete them first."
            }, { status: 400 });
        }

        await prisma.market.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
