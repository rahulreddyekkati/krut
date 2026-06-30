import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { encrypt } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { validate, verifyOtpSchema } from "@/lib/validate";

const MAX_ATTEMPTS = 5;
const GENERIC_ERROR = "Invalid or expired code";

export async function POST(request: NextRequest) {
    try {
        const { email, otp } = validate(verifyOtpSchema, await request.json());

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError(GENERIC_ERROR, 400);

        const record = await prisma.passwordResetOTP.findFirst({
            where: { userId: user.id, consumed: false, expiresAt: { gt: new Date() } },
            orderBy: { createdAt: "desc" }
        });

        if (!record) throw new AppError(GENERIC_ERROR, 400);
        if (record.attempts >= MAX_ATTEMPTS) {
            throw new AppError("Too many attempts. Please request a new code.", 400);
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if (!isMatch) {
            await prisma.passwordResetOTP.update({
                where: { id: record.id },
                data: { attempts: { increment: 1 } }
            });
            throw new AppError(GENERIC_ERROR, 400);
        }

        await prisma.passwordResetOTP.update({
            where: { id: record.id },
            data: { consumed: true }
        });

        const resetToken = await encrypt(
            { purpose: "password_reset", userId: user.id, otpId: record.id },
            "10m"
        );

        return NextResponse.json({ resetToken });
    } catch (error) {
        return handleApiError(error);
    }
}
