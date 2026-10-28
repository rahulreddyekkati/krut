import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";
import { validate, recapSchema } from "@/lib/validate";
import { resolveTimezone, toLocalDateStr } from "@/lib/timezone";
import { offloadReceipts } from "@/lib/receiptStorage";

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
            storeManagerName,
            managerSignature,
        } = validate(recapSchema, body);

        // Find the specific assignment
        let assignment: any;
        if (assignmentId) {
            assignment = await prisma.jobAssignment.findFirst({
                where: { id: assignmentId, workerId: user.id },
                include: { job: true }
            });
        } else {
            // No assignmentId (e.g. "Log Recap" right after clock-out on older app builds).
            // Prefer the completed shift still awaiting its recap — for recurring jobs the
            // newest assignment is often a future date that hasn't been clocked into yet.
            assignment = await prisma.jobAssignment.findFirst({
                where: {
                    jobId,
                    workerId: user.id,
                    status: "RECAP_PENDING",
                    clockIn: { not: null },
                    clockOut: { not: null },
                    recap: { is: null },
                },
                include: { job: true },
                orderBy: { clockOut: "desc" }
            });
        }
        if (!assignment && !assignmentId) {
            // Last resort: today's shift for this job (e.g. resubmitting after a rejection).
            // Shift dates are UTC-midnight markers of the store-local calendar day, so
            // match today's marker — not real local-midnight bounds, which miss today's
            // marker and catch tomorrow's. Only a shift that was actually worked counts;
            // an undated or future recurring row must never receive the recap.
            const jobStore = await prisma.job.findUnique({
                where: { id: jobId },
                select: { store: { select: { timezone: true } } }
            });
            const tz = jobStore?.store?.timezone || resolveTimezone(request);
            const todayMarker = new Date(toLocalDateStr(new Date(), tz) + "T00:00:00.000Z");
            const tomorrowMarker = new Date(todayMarker.getTime() + 24 * 60 * 60 * 1000);
            assignment = await prisma.jobAssignment.findFirst({
                where: {
                    jobId,
                    workerId: user.id,
                    date: { gte: todayMarker, lt: tomorrowMarker },
                    clockIn: { not: null },
                    clockOut: { not: null }
                },
                include: { job: true },
                orderBy: { clockOut: "desc" }
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

        // Move receipt photos to S3 before the transaction, so the network uploads don't hold it open.
        const storedReceiptUrl = await offloadReceipts(receiptUrl, `receipts/${assignment.id}`);

        // MAJ-16: Wrap recap create + assignment update + job update in a single $transaction
        const recap = await prisma.$transaction(async (tx: any) => {
            const recapData = {
                consumersAttended: customersSampled,
                consumersSampled: customersSampled,
                reimbursement: reimbursementTotal,
                receiptTotal,
                rushLevel: rushLevel ?? null,
                customerFeedback: customerFeedback ?? null,
                receiptUrl: storedReceiptUrl ?? null,
                comments: customerFeedback ?? null,
                storeManagerName: storeManagerName || null,
                managerSignature: managerSignature || null,
                status: "PENDING",
                // Stamped on every submission, including a resubmission after rejection below
                // (spread into both the create and update branches) — unlike createdAt (set
                // once, at first submission), this always reflects the latest submission.
                submittedAt: new Date(),
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
