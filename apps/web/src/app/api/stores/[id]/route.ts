import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { STORE_CHAINS } from "@/lib/storeChain";

// PUT /api/stores/[id] - Update a store
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
        const data = await request.json();
        const { name, address, latitude, longitude, marketId, radius, chain } = data;

        // No Zod adoption on this route today — a manual check consistent with its existing
        // style, but sourced from the same shared list POST's Zod enum uses (storeChain.ts),
        // so the two routes can't silently enforce different allowed values over time.
        if (chain !== undefined && !STORE_CHAINS.includes(chain)) {
            return NextResponse.json({ error: `Invalid chain: must be one of ${STORE_CHAINS.join(", ")}` }, { status: 400 });
        }

        const store = await prisma.store.update({
            where: { id },
            data: {
                name,
                address,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                marketId,
                radius: radius ? parseFloat(radius) : undefined,
                chain
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/stores/[id] - Delete a store
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

        // Check for existing jobs
        const store = await prisma.store.findUnique({
            where: { id },
            include: { _count: { select: { jobs: true } } }
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        if (store._count.jobs > 0) {
            return NextResponse.json({
                error: "Cannot delete store with existing jobs. Please delete the history first."
            }, { status: 400 });
        }

        await prisma.store.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
