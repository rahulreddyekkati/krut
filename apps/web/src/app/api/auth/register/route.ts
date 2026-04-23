import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/apiError";
import { validate, registerSchema } from "@/lib/validate";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password, name, email } = validate(registerSchema, body);

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
        return handleApiError(error);
    }
}
