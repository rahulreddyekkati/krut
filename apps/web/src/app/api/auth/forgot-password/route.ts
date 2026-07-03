import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/apiError";
import { validate, forgotPasswordSchema } from "@/lib/validate";
import { sendPasswordResetOTPEmail } from "@/lib/mailer";

const GENERIC_MESSAGE = "If an account exists with this email, a code has been sent.";
const RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_TTL_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
    try {
        const { email: rawEmail } = validate(forgotPasswordSchema, await request.json());
        const email = rawEmail.trim().toLowerCase();

        const user = await prisma.user.findUnique({ where: { email } });

        // Always return the same generic response — never reveal whether the email exists
        if (!user) {
            return NextResponse.json({ message: GENERIC_MESSAGE });
        }

        const recentOtp = await prisma.passwordResetOTP.findFirst({
            where: {
                userId: user.id,
                consumed: false,
                createdAt: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) }
            }
        });

        if (!recentOtp) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const otpHash = await bcrypt.hash(otp, 10);

            await prisma.passwordResetOTP.create({
                data: {
                    userId: user.id,
                    otpHash,
                    expiresAt: new Date(Date.now() + OTP_TTL_MS)
                }
            });

            sendPasswordResetOTPEmail(user.email, otp).catch(() => {});
        }

        return NextResponse.json({ message: GENERIC_MESSAGE });
    } catch (error) {
        return handleApiError(error);
    }
}
