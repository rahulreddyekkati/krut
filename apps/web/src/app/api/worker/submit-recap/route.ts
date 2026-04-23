import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { validate, recapSchema } from "@/lib/validate";
import { resolveTimezone, getLocalDayBoundsUTC } from "@/lib/timezone";

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["WORKER"]);

        const body = await request.json();

        // Validate all recap fields via Zod (MAJ-11: no negatives, MAJ-12: 2MB limit)
        const {
            jobId,
            assignmentId,
            rushLevel,
            customersSampled,
            receiptTotal,
            reimbursementTotal,
            customerFeedback,
            receiptUrl,
            inventoryData,
        } = validate(recapSchema, body);

        // Find the specific assignment
        let assignment: any;
        if (assignmentId) {
            assignment = await prisma.jobAssignment.findFirst({
                where: { id: assignmentId, workerId: user.id },
                include: { job: true }
            });
        } else {
            const tz = resolveTimezone(request);
            const { start: startOfToday, end: endOfToday } = getLocalDayBoundsUTC(tz);
            assignment = await prisma.jobAssignment.findFirst({
                where: {
                    jobId,
                    workerId: user.id,
                    OR: [
                        { date: { gte: startOfToday, lte: endOfToday } },
                        { isRecurring: true }
                    ]
                },
                include: { job: true },
                orderBy: { date: "desc" }
            });
        }

        if (!assignment) {
            throw new AppError("No active assignment found for this job today", 404);
        }

        // CRIT-05: Require clockIn, clockOut, AND job status === RECAP_PENDING
        if (!assignment.clockIn) {
            throw new AppError("Cannot submit recap — you have not clocked in for this shift", 400);
        }
        if (!assignment.clockOut) {
            throw new AppError("Cannot submit recap — you must clock out before submitting", 400);
        }
        if (assignment.status !== "RECAP_PENDING") {
            throw new AppError(
                `Cannot submit recap — assignment status is '${assignment.status}', expected 'RECAP_PENDING'`,
                400
            );
        }

        // Build SKU data — inventory validation already done by Zod recapSchema
        const skuData: {
            skuName: string;
            beginningInventory: number;
            purchased: number;
            bottlesSold: number;
            storePrice: number;
        }[] = [];

        if (inventoryData && typeof inventoryData === "object") {
            Object.values(inventoryData).forEach((item: any) => {
                if (item.name) {
                    skuData.push({
                        skuName: item.name,
                        beginningInventory: parseInt(item.beginning) || 0,
                        purchased: parseInt(item.purchased) || 0,
                        bottlesSold: parseInt(item.sold) || 0,
                        storePrice: parseFloat(item.storePrice) || 0,
                    });
                }
            });
        }

        // MAJ-16: Wrap recap create + assignment update + job update in a single $transaction
        const recap = await prisma.$transaction(async (tx: any) => {
            const recapData = {
                consumersAttended: customersSampled,
                consumersSampled: customersSampled,
                reimbursement: reimbursementTotal,
                receiptTotal,
                rushLevel: rushLevel ?? null,
                customerFeedback: customerFeedback ?? null,
                receiptUrl: receiptUrl ?? null,
                comments: customerFeedback ?? null,
                status: "PENDING"
            };

            // Check for existing rejected recap for this assignment
            const existingRejected = await tx.recap.findFirst({
                where: { assignmentId: assignment.id, status: "REJECTED" }
            });

            let created;
            if (existingRejected) {
                // Update the rejected recap — don't create a duplicate
                created = await tx.recap.update({
                    where: { id: existingRejected.id },
                    data: { 
                        ...recapData,
                        skus: {
                            deleteMany: {}, // Clear old SKUs
                            create: skuData
                        }
                    }
                });
            } else {
                // First submission — create new
                created = await tx.recap.create({
                    data: {
                        ...recapData,
                        jobId,
                        assignmentId: assignment.id,
                        skus: { create: skuData }
                    }
                });
            }

            // Job status stays RECAP_PENDING or moves to RECAP_PENDING if it was something else
            // Actually, once submitted, the job status should probably stay RECAP_PENDING 
            // until all recaps are approved.
            await tx.job.update({
                where: { id: jobId },
                data: { status: "RECAP_PENDING" }
            });

            return created;
        });

        return NextResponse.json({ success: true, recap });
    } catch (error: any) {
        return handleApiError(error);
    }
}
