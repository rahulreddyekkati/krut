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

async function sendShiftMissedNotification(email) {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || '"Kruto Tastes" <support@krutovodka.com>';
    if (!transporter) {
        console.error("❌ SMTP not configured. Cannot send email.");
        return false;
    }
    
    try {
        const subject = "Regarding Your Scheduled Shift Today";
        const textBody = `Hello Laurie,\n\nIt is past your scheduled shift time for today. We wanted to check in and ask if the app problems or any issues you were experiencing have been resolved?\n\nPlease let us know if you need any assistance.\n\nBest regards,\nThe Kruto Tastes Team`;
        const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 28px;">
                    <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #6366f1; text-transform: uppercase;">Kruto Tastes</span>
                </div>
                <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Checking In on Your Shift</p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Hello Laurie,
                </p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    It is now past your scheduled shift start time for today. We wanted to check in and ask if any app problems or issues you were experiencing have been resolved?
                </p>
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Please let us know if you need any assistance or if there is anything we can do to help.
                </p>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 14px;">
                    <p style="margin: 0 0 4px 0;">Best regards,</p>
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

sendShiftMissedNotification("donovanlaurie77@gmail.com");
