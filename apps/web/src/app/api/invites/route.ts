import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { sendInviteEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const { email, role, marketId, hourlyWage } = await request.json();

        // Market Managers can only invite Workers
        if (user.role === "MARKET_MANAGER" && role !== "WORKER") {
            return NextResponse.json({ error: "You can only invite Workers" }, { status: 403 });
        }

        // Auto-assign market for Market Managers
        let resolvedMarketId = marketId;
        if (user.role === "MARKET_MANAGER" && user.managedMarketId) {
            resolvedMarketId = user.managedMarketId;
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
                senderId: user.id,
                expiresAt,
            },
            create: {
                email,
                role,
                token,
                hourlyWage: hourlyWage ? parseFloat(hourlyWage) : null,
                marketId: resolvedMarketId,
                senderId: user.id,
                expiresAt,
            },
        });

        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`;

        // Look up market name for personalized email
        let marketName = "Dallas";
        if (invite.marketId) {
            const market = await prisma.market.findUnique({
                where: { id: invite.marketId },
                select: { name: true }
            });
            if (market) marketName = market.name;
        }

        const emailSent = await sendInviteEmail(email, inviteLink, role, marketName);

        return NextResponse.json({
            success: true,
            inviteLink,
            emailSent
        });
    } catch (error) {
        return handleApiError(error);
    }
}
