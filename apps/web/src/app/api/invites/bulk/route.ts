import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";
import { sendInviteEmail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const { emails, role, marketId, hourlyWage } = await request.json();

        // Validate inputs
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json({ error: "Missing or invalid email list" }, { status: 400 });
        }
        if (!role) {
            return NextResponse.json({ error: "Missing role" }, { status: 400 });
        }

        // Market Managers can only invite Workers
        if (user.role === "MARKET_MANAGER" && role !== "WORKER") {
            return NextResponse.json({ error: "You can only invite Workers" }, { status: 403 });
        }

        // Auto-assign market for Market Managers
        let resolvedMarketId = marketId;
        if (user.role === "MARKET_MANAGER" && user.managedMarketId) {
            resolvedMarketId = user.managedMarketId;
        }

        // Look up market name for email branding
        let marketName = "Dallas";
        if (resolvedMarketId) {
            const market = await prisma.market.findUnique({
                where: { id: resolvedMarketId },
                select: { name: true }
            });
            if (market) marketName = market.name;
        }

        const results = [];

        for (const rawEmail of emails) {
            const email = rawEmail.trim().toLowerCase();
            if (!email) {
                results.push({ email, success: false, error: "Empty email address" });
                continue;
            }

            try {
                // Check if user already exists
                const existingUser = await prisma.user.findUnique({
                    where: { email },
                });

                if (existingUser) {
                    results.push({ email, success: false, error: "User already exists with this email" });
                    continue;
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
                const emailSent = await sendInviteEmail(email, inviteLink, role, marketName);

                results.push({
                    email,
                    success: true,
                    inviteLink,
                    emailSent
                });
            } catch (err: any) {
                results.push({
                    email,
                    success: false,
                    error: err.message || "Failed to process invitation"
                });
            }
        }

        return NextResponse.json({
            success: true,
            results
        });
    } catch (error) {
        return handleApiError(error);
    }
}
