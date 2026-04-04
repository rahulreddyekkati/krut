import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/stores - List all stores (optionally filtered by market)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const marketId = searchParams.get("marketId");

        const requester = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        const where: any = {};
        if (marketId) where.marketId = marketId;

        // Further filtering based on role scope
        if (requester?.role === "MARKET_MANAGER") {
            where.marketId = requester.managedMarketId;
        }

        const stores = await prisma.store.findMany({
            where,
            include: {
                market: { select: { name: true } },
                _count: { select: { jobs: true } }
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(stores);
    } catch (error) {
        console.error("Store fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/stores - Create a new store
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await request.json();
        const { name, address, latitude, longitude, marketId, radius } = data;

        if (!name || !address || latitude === undefined || longitude === undefined || !marketId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const store = await prisma.store.create({
            data: {
                name,
                address,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                marketId,
                radius: radius ? parseFloat(radius) : 100
            }
        });

        return NextResponse.json(store);
    } catch (error: any) {
        console.error("Store Creation Error:", error);
        return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
    }
}
