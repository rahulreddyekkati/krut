import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const resolvedParams = await context.params;
        const requestId = resolvedParams.id;

        const shiftRequest = await prisma.shiftRequest.findUnique({
            where: { id: requestId },
            include: { job: { include: { store: true } } }
        });

        if (!shiftRequest) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        const updated = await prisma.shiftRequest.update({
            where: { id: requestId },
            data: { status: "DENIED" }
        });

        // Notify the worker
        await prisma.notification.create({
            data: {
                userId: shiftRequest.workerId,
                title: "Shift Assign Rejected",
                message: `Your request for the shift at ${shiftRequest.job.store.name} on ${shiftRequest.date ? new Date(shiftRequest.date).toLocaleDateString() : "Recurring"} was not approved.`
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}
