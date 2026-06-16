import prisma from "./prisma";

export async function sendPushToUser(userId: string, title: string, body: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { expoPushToken: true },
    });
    if (!user?.expoPushToken) return;
    await sendExpoNotification(user.expoPushToken, title, body);
}

export async function sendPushToMany(userIds: string[], title: string, body: string) {
    if (!userIds.length) return;
    const users = await prisma.user.findMany({
        where: { id: { in: userIds }, expoPushToken: { not: null } },
        select: { expoPushToken: true },
    });
    const tokens = users.map((u) => u.expoPushToken).filter(Boolean) as string[];
    if (!tokens.length) return;
    await Promise.all(tokens.map((token) => sendExpoNotification(token, title, body)));
}

async function sendExpoNotification(token: string, title: string, body: string) {
    try {
        await fetch("https://exp.host/--/api/v2/push/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                "Accept-Encoding": "gzip, deflate",
            },
            body: JSON.stringify({ to: token, title, body, sound: "default" }),
        });
    } catch (e) {
        console.error("[push] Failed to send Expo notification:", e);
    }
}
