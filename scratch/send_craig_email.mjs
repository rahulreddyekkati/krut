import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./.env") });

function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    if (!host || !user || !pass) return null;
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
}

async function sendResetNotification(email) {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || '"Kruto Tastes" <support@krutovodka.com>';
    if (!transporter) {
        console.error("❌ SMTP not configured. Cannot send email.");
        return false;
    }
    
    try {
        const subject = "Your Password Has Been Reset";
        const textBody = `Hello Craig,\n\nYour Kruto Tastes password has been reset to: password123\n\nYou can log in using this temporary password and change it at any time on the Profile page.\n\nThe Kruto Tastes Team`;
        const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 28px;">
                    <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #6366f1; text-transform: uppercase;">Kruto Tastes</span>
                </div>
                <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Password Reset Notification</p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Hello Craig,
                </p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Your password has been reset by the system administrator to:
                </p>
                <div style="text-align: center; margin-bottom: 28px;">
                    <span style="display: inline-block; background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px 24px; font-size: 22px; font-weight: 700; color: #b91c1c;">password123</span>
                </div>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Please log in with this temporary password and change it to a secure password on your **Profile** page under **Change Password** once you are logged in.
                </p>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 14px;">
                    <p style="margin: 0 0 4px 0;">Thank you,</p>
                    <p style="margin: 0; font-weight: 600; color: #475569;">The Kruto Tastes Team</p>
                </div>
            </div>`;
            
        const info = await transporter.sendMail({ from, to: email, subject, text: textBody, html: htmlBody });
        console.log("Email sent successfully!", info.messageId);
        return true;
    } catch (error) {
        console.error("❌ Failed to send email:", error);
        return false;
    }
}

sendResetNotification("craig@smartdog-marketing.com");
