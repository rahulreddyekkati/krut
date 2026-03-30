import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("q") || "";

        const { user } = session;
        let whereClause: any = {
            id: { not: user.id }, // Don't show self
            status: "ACTIVE"
        };

        // Add search filter if present
        if (query) {
            whereClause.OR = [
                { name: { contains: query } },
                { email: { contains: query } },
                { market: { name: { contains: query } } }
            ];
        }

        // Apply role-based filtering
        if (user.role === "WORKER" || user.role === "MARKET_MANAGER") {
            // Workers and Market Managers see:
            // 1. Everyone in their market
            // 2. Admins
            const userMarketId = user.managedMarketId || user.marketId;
            whereClause.OR = [
                ...(whereClause.OR || []),
                { role: "ADMIN" },
                { marketId: userMarketId }
            ];
        }
        // ADMIN sees everyone (no additional filtering)

        const contacts = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                role: true,
                email: true,
                market: { select: { name: true } }
            },
            take: 50,
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(contacts);
    } catch (error) {
        console.error("Contacts GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
