import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { validate, storeSchema } from "@/lib/validate";

// GET /api/stores - List all stores (optionally filtered by market)
export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        const { searchParams } = new URL(request.url);
        const marketId = searchParams.get("marketId");

        const where: any = {};
        if (marketId) where.marketId = marketId;

        // Scope to own market for Market Managers
        if (user.role === "MARKET_MANAGER") {
            where.marketId = user.managedMarketId;
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
        return handleApiError(error);
    }
}

// POST /api/stores - Create a new store
export async function POST(request: NextRequest) {
    try {
        await requireAuth(request, ["ADMIN"]);

        const data = await request.json();

        // MAJ-02 + MAJ-03: Validate GPS coordinates (bounds) and radius (> 0) via Zod
        const validated = validate(storeSchema, {
            name: data.name,
            address: data.address,
            latitude: typeof data.latitude === "string" ? parseFloat(data.latitude) : data.latitude,
            longitude: typeof data.longitude === "string" ? parseFloat(data.longitude) : data.longitude,
            marketId: data.marketId,
            radius: data.radius != null ? (typeof data.radius === "string" ? parseFloat(data.radius) : data.radius) : 100,
        });

        const store = await prisma.store.create({
            data: {
                name: validated.name,
                address: validated.address,
                latitude: validated.latitude,
                longitude: validated.longitude,
                marketId: validated.marketId,
                radius: validated.radius,
            }
        });

        return NextResponse.json(store);
    } catch (error) {
        return handleApiError(error);
    }
}
