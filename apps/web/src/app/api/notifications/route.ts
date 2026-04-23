import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        const notifications = await prisma.notification.findMany({
            where: { userId: user.id, read: false },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        return NextResponse.json(notifications);
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        // CRIT-07: Only ADMIN or MARKET_MANAGER can create notifications
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const body = await request.json();
        const { recipientId, message, title, type } = body;

        if (!recipientId || !message) {
            throw new AppError("recipientId and message are required", 400);
        }

        const notification = await prisma.notification.create({
            data: {
                userId: recipientId,
                title: title || type || "Notification",
                message,
                read: false
            }
        });

        return NextResponse.json({ success: true, notification });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await requireAuth(request);

        const { ids } = await request.json();

        if (!ids || !Array.isArray(ids)) {
            throw new AppError("Invalid IDs", 400);
        }

        // Scoped to user's own notifications — MIN-11 owned check already correct
        await prisma.notification.updateMany({
            where: { id: { in: ids }, userId: user.id },
            data: { read: true }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}
