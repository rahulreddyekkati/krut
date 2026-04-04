import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/markets - List all markets
export async function GET() {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const markets = await prisma.market.findMany({
            include: {
                _count: {
                    select: { stores: true, managers: true, jobs: true }
                }
            },
            orderBy: { name: "asc" }
        });

        return NextResponse.json(markets);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/markets - Create a new market
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const market = await prisma.market.create({
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
