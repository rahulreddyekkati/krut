import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";

// 1. Load env variables
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

// Helper to create nodemailer transporter
function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) return null;
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

// Mail sending function
async function sendInviteEmail(email, inviteLink, role = "WORKER", marketName = "Dallas") {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || '"Kruto Tastes" <noreply@krutotastes.com>';
    if (!transporter) {
        console.warn(`⚠️ SMTP not configured. Generated Invite Link for ${email}: ${inviteLink}`);
        return false;
    }
    try {
        const displayRole = role === "WORKER" ? "Taster" : role === "MARKET_MANAGER" ? "Market Manager" : role;
        const subject = "Welcome to the Kruto Tastes Team! 🥂";
        const textBody = `Hello!\n\nYou have been invited to join the Kruto Tastes workforce management team as a ${displayRole} for the ${marketName} market.\n\nPlease click the link below to accept your invitation, set up your account, and configure your password:\n\n${inviteLink}\n\nNote: This invite link is secure and will expire in 7 days.\n\nAfter your account setup, download the app:\nAndroid: https://play.google.com/store/apps/details?id=com.krutotastes.app&hl=en_US\niOS: https://apps.apple.com/us/app/id6773445779\n\nWelcome to the team!\n\nThe Kruto Tastes Team`;
        const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                <div style="text-align: center; margin-bottom: 28px;">
                    <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #0f172a; text-transform: uppercase;">Kruto Tastes</span>
                </div>
                <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Hello!</p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    You have been invited to join the Kruto Tastes workforce management team as a <strong style="color: #0f172a;">${displayRole}</strong> for the <strong style="color: #0f172a;">${marketName} market</strong>.
                </p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Please click the button below to accept your invitation, set up your account, and configure your password:
                </p>
                <div style="text-align: center; margin-top: 28px; margin-bottom: 28px;">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #0f172a; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 32px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.15);">
                        Accept Invitation & Sign Up
                    </a>
                </div>
                <div style="background-color: #f8fafc; border-left: 4px solid #94a3b8; padding: 12px 16px; border-radius: 4px; margin-bottom: 28px;">
                    <p style="color: #475569; font-size: 13px; line-height: 18px; margin: 0;">
                        <strong>Note:</strong> This invite link is secure and will expire in 7 days.
                    </p>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-bottom: 28px;">
                    <p style="color: #0f172a; font-size: 15px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">After your account setup, download the mobile app:</p>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #475569;">
                                🤖 <strong>Android:</strong> <a href="https://play.google.com/store/apps/details?id=com.krutotastes.app&hl=en_US" style="color: #2563eb; text-decoration: none; font-weight: 500;">Google Play Store</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; font-size: 14px; color: #475569;">
                                🍎 <strong>iOS:</strong> <a href="https://apps.apple.com/us/app/id6773445779" style="color: #2563eb; text-decoration: none; font-weight: 500;">Apple App Store</a>
                            </td>
                        </tr>
                    </table>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 14px; line-height: 20px;">
                    <p style="margin: 0 0 4px 0;">Welcome to the team!</p>
                    <p style="margin: 0; font-weight: 600; color: #475569;">The Kruto Tastes Team</p>
                </div>
            </div>`;
        await transporter.sendMail({ from, to: email, subject, text: textBody, html: htmlBody });
        return true;
    } catch (error) {
        console.error(`❌ Failed to send invite email to ${email}:`, error);
        return false;
    }
}

// CSV Line Parser
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

async function main() {
    console.log("=== INITIATING BULK INVITES ===");
    
    // Find an Admin user to be the sender
    const admin = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    });
    if (!admin) {
        throw new Error("No ADMIN user found in the database to send invites.");
    }
    console.log(`Using sender admin: ${admin.email} (ID: ${admin.id})`);
    
    const marketId = "cmp2vkipa0002l504v6a8lm8f"; // Dallas,Tx
    const marketName = "Dallas,Tx";
    
    // Load CSV file
    const csvPath = "/Users/rahulreddyekkati/.gemini/antigravity/brain/36ef856f-f3ec-45fe-ad44-a25e3571e651/.system_generated/steps/232/content.md";
    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split("\n");
    
    // Extract CSV lines after the '---'
    let csvLines = [];
    let startCsv = false;
    for (const line of lines) {
        if (startCsv) {
            if (line.trim()) {
                csvLines.push(line.trim());
            }
        } else if (line.trim() === '---') {
            startCsv = true;
        }
    }
    
    if (csvLines.length === 0) {
        throw new Error("No CSV lines found in file.");
    }
    
    // Header is row 0
    const header = parseCSVLine(csvLines[0]);
    console.log("CSV Header fields:", header);
    
    const dataRows = csvLines.slice(1);
    const invitesCreated = [];
    const skipped = [];
    
    for (const rowText of dataRows) {
        const row = parseCSVLine(rowText);
        if (row.length < 4) continue;
        
        const firstName = row[0];
        const lastName = row[1];
        const emailField = row[2];
        const payField = row[3];
        
        if (!emailField || emailField.toUpperCase() === 'N/A') {
            skipped.push({ name: `${firstName} ${lastName}`, reason: "Missing/Invalid Email" });
            continue;
        }
        
        // Split potential multiple emails
        const emails = emailField.split(',').map(e => e.trim());
        const payVal = parseFloat(payField.replace('$', '').trim());
        
        for (const email of emails) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                skipped.push({ name: `${firstName} ${lastName} (${email})`, reason: "User already exists" });
                continue;
            }
            
            // Generate token and dates
            const token = crypto.randomBytes(32).toString("hex");
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
            
            // Create or update invite
            const invite = await prisma.invite.upsert({
                where: { email },
                update: {
                    role: "WORKER",
                    token,
                    hourlyWage: payVal,
                    marketId,
                    senderId: admin.id,
                    expiresAt
                },
                create: {
                    email,
                    role: "WORKER",
                    token,
                    hourlyWage: payVal,
                    marketId,
                    senderId: admin.id,
                    expiresAt
                }
            });
            
            // Generate invite link (using the NEXT_PUBLIC_APP_URL)
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://krut-6zbd.vercel.app";
            const inviteLink = `${baseUrl}/invite/${token}`;
            
            // Send invite email
            const emailSent = await sendInviteEmail(email, inviteLink, "WORKER", marketName);
            
            invitesCreated.push({
                name: `${firstName} ${lastName}`,
                email,
                pay: payVal,
                inviteLink,
                emailSent
            });
        }
    }
    
    console.log("\n=== SUMMARY ===");
    console.log(`Successfully created/updated ${invitesCreated.length} invites.`);
    console.log(`Skipped ${skipped.length} users.`);
    
    console.log("\n=== GENERATED INVITE LINKS ===");
    invitesCreated.forEach(inv => {
        console.log(`- ${inv.name} (${inv.email}) [Pay: $${inv.pay}]: ${inv.inviteLink} (Email Sent: ${inv.emailSent})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
