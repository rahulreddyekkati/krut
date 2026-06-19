import nodemailer from "nodemailer";

export async function sendInviteEmail(
    email: string,
    inviteLink: string,
    role: string = "Taster",
    marketName: string = "Dallas"
): Promise<boolean> {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM || '"Kruto Tastes" <noreply@krutotastes.com>';

    if (!host || !user || !pass) {
        console.warn("⚠️ SMTP settings are not configured in environment variables. Skipping automatic email send.");
        console.warn(`Generated Invite Link for ${email}: ${inviteLink}`);
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465, // true for 465, false for 587 or other ports
            auth: {
                user,
                pass,
            },
        });

        // Map role key to user friendly name
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
            </div>
        `;

        await transporter.sendMail({
            from,
            to: email,
            subject,
            text: textBody,
            html: htmlBody,
        });

        return true;
    } catch (error) {
        console.error(`❌ Failed to send invite email to ${email}:`, error);
        return false;
    }
}

export async function sendRecapReminderEmail(email: string, storeName: string): Promise<boolean> {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_FROM || '"Kruto Tastes" <noreply@krutotastes.com>';

    if (!host || !user || !pass) {
        console.warn("⚠️ SMTP settings are not configured. Skipping recap reminder email send.");
        return false;
    }

    try {
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: {
                user,
                pass,
            },
        });

        const subject = "Recap Reminder: Submit your shift recap 📝";
        const textBody = `Hello!\n\nThis is a reminder that you have not completed your shift recap for your shift at ${storeName}.\n\nPlease submit it as soon as possible through the app.\n\nThank you,\nThe Kruto Tastes Team`;

        const htmlBody = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);">
                <div style="text-align: center; margin-bottom: 28px;">
                    <span style="font-size: 28px; font-weight: 800; letter-spacing: -0.025em; color: #0f172a; text-transform: uppercase;">Kruto Tastes</span>
                </div>
                
                <p style="color: #0f172a; font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Recap Reminder</p>
                
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    This is a reminder that you have not completed your shift recap for your shift at <strong style="color: #0f172a;">${storeName}</strong>.
                </p>
                
                <p style="color: #334155; font-size: 15px; line-height: 24px; margin-top: 0; margin-bottom: 24px;">
                    Please open the Kruto Tastes app and submit your recap as soon as possible.
                </p>
                
                <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 14px; line-height: 20px;">
                    <p style="margin: 0 0 4px 0;">Thank you,</p>
                    <p style="margin: 0; font-weight: 600; color: #475569;">The Kruto Tastes Team</p>
                </div>
            </div>
        `;

        await transporter.sendMail({
            from,
            to: email,
            subject,
            text: textBody,
            html: htmlBody,
        });

        return true;
    } catch (error) {
        console.error(`❌ Failed to send recap reminder email to ${email}:`, error);
        return false;
    }
}

