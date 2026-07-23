import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./.env") });

const prismaClientSingleton = () => {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

    if (tursoUrl && (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://"))) {
        const libsql = createClient({
            url: tursoUrl,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    }

    return new PrismaClient();
};

const prisma = prismaClientSingleton();

function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) return null;
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

async function main() {
    console.log("=== SENDING APP UPDATE NOTIFICATION TO KAREN BEATTY ===");

    // Find Karen Beatty
    const user = await prisma.user.findFirst({
        where: {
            name: {
                contains: "Karen"
            }
        }
    });

    if (!user) {
        console.log("User Karen Beatty not found in the database.");
        return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || '"Kruto Tastes" <support@krutovodka.com>';
    if (!transporter) {
        console.error("❌ SMTP not configured. Cannot send email.");
        return;
    }

    try {
        const subject = "Please Update Your Kruto Tastes App";
        const textBody = `Hello Karen,\n\nWe have released an important update for the Kruto Tastes app. Please update your app to the latest version (1.0.6) to ensure the photo upload and clock-in features work correctly.\n\nBest regards,\nThe Kruto Tastes Team`;
        const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 28px;">
                    <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #6366f1; text-transform: uppercase;">Kruto Tastes</span>
                </div>
                <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">App Update Required</p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Hello Karen,
                </p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    We have released an important update for the Kruto Tastes app. Please update your app to the latest version (**1.0.6**) as soon as possible to ensure that geofenced clock-in and photo uploads function correctly on your device.
                </p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Thank you for your cooperation!
                </p>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 14px;">
                    <p style="margin: 0 0 4px 0;">Best regards,</p>
                    <p style="margin: 0; font-weight: 600; color: #475569;">The Kruto Tastes Team</p>
                </div>
            </div>`;

        const info = await transporter.sendMail({ from, to: user.email, subject, text: textBody, html: htmlBody });
        console.log("Email sent successfully to", user.email, info.messageId);
    } catch (error) {
        console.error("❌ Failed to send email:", error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
