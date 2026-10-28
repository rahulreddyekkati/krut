import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/apiError";
import { validate, registerSchema } from "@/lib/validate";
import { sendNewSignupAlertEmail } from "@/lib/mailer";
import { getAdminAndMarketManagerEmails } from "@/lib/notifications";

async function notifyNewSignup(data: { name: string; email: string; phone?: string | null; role: string; marketId: string | null }) {
    const [recipients, market] = await Promise.all([
        getAdminAndMarketManagerEmails(data.marketId),
        data.marketId ? prisma.market.findUnique({ where: { id: data.marketId }, select: { name: true } }) : null,
    ]);
    // The new user may themselves be the market's manager — don't email them about their own sign-up.
    const to = recipients.filter((e) => e !== data.email);
    if (to.length === 0) return;
    await sendNewSignupAlertEmail(to, { ...data, marketName: market?.name ?? null });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password, name, phone, email: rawEmail } = validate(registerSchema, body);
        const email = rawEmail.trim().toLowerCase();

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
                    phone,
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

        // Alert all admins, plus the manager of the new user's market. Awaited so the
        // serverless function isn't torn down mid-send; errors are swallowed so a mail
        // failure never fails the sign-up (the account already exists at this point).
        await notifyNewSignup({ name, email: invite.email, phone, role: invite.role, marketId: invite.marketId })
            .catch((e) => console.error("[register] sign-up alert failed", e));

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
