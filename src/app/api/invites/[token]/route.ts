import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ token: string }> }
) {
    try {
        const resolvedParams = await context.params;
        const { token } = resolvedParams;

        const invite = await prisma.invite.findUnique({
            where: { token },
            include: {
                sender: {
                    select: { name: true }
                }
            }
        });

        if (!invite || invite.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invalid or expired invite" }, { status: 404 });
        }

        return NextResponse.json({
            email: invite.email,
            role: invite.role,
            invitedBy: invite.sender.name
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
