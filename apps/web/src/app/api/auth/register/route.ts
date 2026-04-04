import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const { token, password, name, email } = await request.json();

        const invite = await prisma.invite.findUnique({
            where: { token },
        });

        if (!invite || invite.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 });
        }

        if (invite.email !== email) {
            return NextResponse.json({ error: "Email mismatch" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and delete invite in a transaction
        await prisma.$transaction([
            prisma.user.create({
                data: {
                    email: invite.email,
                    password: hashedPassword,
                    name: name,
                    role: invite.role,
                    status: "ACTIVE",
                    // Assignments from invite
                    marketId: invite.marketId,
                    hourlyWage: invite.hourlyWage,
                    // If it's a manager, set the managed fields
                    ...(invite.role === "MARKET_MANAGER" ? {
                        managedMarketId: invite.marketId
                    } : {})
                },
            }),
            prisma.invite.delete({
                where: { id: invite.id },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
