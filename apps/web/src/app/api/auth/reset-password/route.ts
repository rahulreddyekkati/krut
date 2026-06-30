import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { validate, resetPasswordSchema } from "@/lib/validate";

export async function POST(request: NextRequest) {
    try {
        const { resetToken, newPassword } = validate(resetPasswordSchema, await request.json());

        let payload: any;
        try {
            payload = await decrypt(resetToken);
        } catch {
            throw new AppError("Invalid or expired reset token", 400);
        }

        if (payload?.purpose !== "password_reset" || !payload?.userId || !payload?.otpId) {
            throw new AppError("Invalid or expired reset token", 400);
        }

        // Token is single-use: the backing OTP record is deleted once consumed here,
        // so replaying the same resetToken fails this lookup on a second attempt.
        const otpRecord = await prisma.passwordResetOTP.findUnique({ where: { id: payload.otpId } });
        if (!otpRecord || otpRecord.userId !== payload.userId) {
            throw new AppError("Invalid or expired reset token", 400);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: payload.userId },
                data: { password: hashedPassword }
            }),
            prisma.passwordResetOTP.delete({ where: { id: otpRecord.id } })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
