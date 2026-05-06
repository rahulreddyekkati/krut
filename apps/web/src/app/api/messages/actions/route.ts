import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request);
        const body = await request.json();
        const { action, userId, reason } = body;

        if (!action || !userId) {
            throw new AppError("Action and userId required", 400);
        }

        if (action === "BLOCK") {
            await prisma.block.upsert({
                where: {
                    blockerId_blockedId: {
                        blockerId: user.id,
                        blockedId: userId,
                    },
                },
                create: {
                    blockerId: user.id,
                    blockedId: userId,
                },
                update: {},
            });
            return NextResponse.json({ success: true, message: "User blocked" });
        }

        if (action === "REPORT") {
            if (!reason) {
                throw new AppError("Reason required for report", 400);
            }
            await prisma.userReport.create({
                data: {
                    reporterId: user.id,
                    reportedId: userId,
                    reason,
                },
            });
            return NextResponse.json({ success: true, message: "User reported" });
        }

        throw new AppError("Invalid action", 400);
    } catch (error) {
        return handleApiError(error);
    }
}
