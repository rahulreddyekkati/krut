import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
                read: false
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 20
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Notifications GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const { recipientId, message, title, type } = body;

        if (!recipientId || !message) {
            return NextResponse.json({ error: "recipientId and message are required" }, { status: 400 });
        }

        const notification = await prisma.notification.create({
            data: {
                userId: recipientId,
                title: title || type || "Notification",
                message: message,
                read: false
            }
        });

        return NextResponse.json({ success: true, notification });
    } catch (error) {
        console.error("Notifications POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids)) {
            return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
        }

        await prisma.notification.updateMany({
            where: {
                id: { in: ids },
                userId: session.user.id
            },
            data: {
                read: true
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Notifications PATCH error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
