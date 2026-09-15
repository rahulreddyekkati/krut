import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { validate, sampleRequestSchema } from "@/lib/validate";
import { sendSampleRequestEmail } from "@/lib/mailer";
import { getAdminEmails } from "@/lib/notifications";

// POST /api/sample-requests — a worker requests sample items during a clocked-in shift
export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["WORKER"]);

        const body = await request.json();
        const { jobAssignmentId, inventoryItemIds } = validate(sampleRequestSchema, body);

        const assignment = await prisma.jobAssignment.findFirst({
            where: { id: jobAssignmentId, workerId: user.id },
            include: { job: { include: { store: true } } },
        });
        if (!assignment) {
            throw new AppError("No matching shift found for this worker", 404);
        }

        // Server-side enforcement — not just the mobile client's isClockedIn check
        if (!assignment.clockIn || assignment.clockOut) {
            throw new AppError("You must be clocked in to request samples", 400);
        }

        // Dedupe before validating — a malformed/replayed request with a repeated id must not
        // reach the @@unique([sampleRequestId, inventoryItemId]) constraint as a raw DB error
        const uniqueIds = [...new Set(inventoryItemIds)];

        const items = await prisma.inventoryItem.findMany({
            where: { id: { in: uniqueIds } },
        });
        if (items.length !== uniqueIds.length) {
            throw new AppError("One or more selected items are invalid", 400);
        }

        const sampleRequest = await prisma.sampleRequest.create({
            data: {
                workerId: user.id,
                assignmentId: assignment.id,
                storeName: assignment.job.store.name,
                storeAddress: assignment.job.store.address,
                items: { create: items.map((i) => ({ inventoryItemId: i.id })) },
            },
            include: { items: { include: { inventoryItem: true } } },
        });

        const adminEmails = await getAdminEmails();
        if (adminEmails.length === 0) {
            console.warn("[sample-requests] no active admins to notify");
        } else {
            sendSampleRequestEmail(adminEmails, {
                workerName: user.name,
                storeName: assignment.job.store.name,
                storeAddress: assignment.job.store.address,
                items: items.map((i) => i.name),
            }).catch((e) => console.error("[sample-requests] email send failed", e));
        }

        return NextResponse.json(sampleRequest);
    } catch (error) {
        return handleApiError(error);
    }
}
