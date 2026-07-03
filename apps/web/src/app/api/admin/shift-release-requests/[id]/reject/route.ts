import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendPushToUser } from "@/lib/notifications";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await context.params;
        const requestId = resolvedParams.id;

        const releaseRequest = await prisma.releaseRequest.findUnique({
            where: { id: requestId },
            include: { job: { include: { store: true } } }
        });

        if (!releaseRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // Deny the request
        await prisma.releaseRequest.update({
            where: { id: requestId },
            data: { status: "DENIED" }
        });

        const rejectTitle = "Shift Release Rejected";
        const rejectMessage = `Your request to release the shift at ${releaseRequest.job.store.name} on ${releaseRequest.date ? new Date(releaseRequest.date).toLocaleDateString(undefined, { timeZone: "UTC" }) : "Recurring"} was not approved.`;

        // Notify the worker
        await prisma.notification.create({
            data: { userId: releaseRequest.workerId, title: rejectTitle, message: rejectMessage }
        });
        sendPushToUser(releaseRequest.workerId, rejectTitle, rejectMessage).catch(() => {});

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reject release request error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
