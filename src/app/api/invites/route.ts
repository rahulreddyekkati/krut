import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, role, marketId, hourlyWage } = await request.json();

        // Market Managers can only invite Workers
        if (session.user.role === "MARKET_MANAGER" && role !== "WORKER") {
            return NextResponse.json({ error: "You can only invite Workers" }, { status: 403 });
        }

        // Auto-assign market for Market Managers
        let resolvedMarketId = marketId;
        const requester = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (session.user.role === "MARKET_MANAGER" && requester?.managedMarketId) {
            resolvedMarketId = requester.managedMarketId;
        }

        if (!email || !role) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const invite = await (prisma.invite as any).upsert({
            where: { email },
            update: {
                role,
                token,
                hourlyWage: hourlyWage ? parseFloat(hourlyWage) : null,
                marketId: resolvedMarketId,
                senderId: session.user.id,
                expiresAt,
            },
            create: {
                email,
                role,
                token,
                hourlyWage: hourlyWage ? parseFloat(hourlyWage) : null,
                marketId: resolvedMarketId,
                senderId: session.user.id,
                expiresAt,
            },
        });

        return NextResponse.json({
            success: true,
            inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`
        });
    } catch (error) {
        console.error("Invite error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
