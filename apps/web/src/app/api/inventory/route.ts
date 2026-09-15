import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

// GET /api/inventory - List all inventory items
export async function GET(request: NextRequest) {
    try {
        await requireAuth(request);

        const items = await prisma.inventoryItem.findMany({
            orderBy: { name: "asc" }
        });

        return NextResponse.json(items);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/inventory - Create a new inventory item
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, category, volume, unit } = body;

        if (!name) {
            return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
        }

        const item = await prisma.inventoryItem.create({
            data: {
                name,
                category,
                volume: volume?.toString(),
                unit
            }
        });

        return NextResponse.json(item);
    } catch (error: any) {
        console.error("POST Inventory error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
