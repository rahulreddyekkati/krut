import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

// GET /api/markets - List all markets
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        // MAJ-04: Market Managers only see their own market
        const where: any =
            user.role === "MARKET_MANAGER"
                ? { id: user.managedMarketId }
                : {};

        const markets = await prisma.market.findMany({
            where,
            include: {
                _count: { select: { stores: true, managers: true, jobs: true } }
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(markets);
    } catch (error) {
        return handleApiError(error);
    }
}

// POST /api/markets - Create a new market
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN"]);

        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const market = await prisma.market.create({
            data: { name }
        });

        return NextResponse.json(market);
    } catch (error) {
        return handleApiError(error);
    }
}
