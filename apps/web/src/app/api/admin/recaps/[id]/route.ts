import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);
        const { id } = await context.params;

        const recap = await (prisma.recap as any).findUnique({
            where: { id },
            include: {
                assignment: {
                    include: {
                        worker: { select: { id: true, name: true, email: true } }
                    }
                },
                job: {
                    include: {
                        store: {
                            include: {
                                market: { select: { name: true } }
                            }
                        }
                    }
                },
                skus: true
            }
        });

        if (!recap) {
            return NextResponse.json({ error: "Recap not found" }, { status: 404 });
        }

        // Market Manager scope check
        if (user.role === "MARKET_MANAGER" && recap.job.store.marketId !== user.managedMarketId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const assignment = recap.assignment;
        const worker = assignment?.worker;

        const data = {
            id: recap.id,
            jobId: recap.jobId,
            workerName: worker?.name || "Unknown",
            workerId: worker?.id,
            storeName: recap.job.store.name,
            marketName: recap.job.store.market?.name || "—",
            status: recap.status || "PENDING",
            reimbursement: recap.reimbursement,
            receiptTotal: recap.receiptTotal || 0,
            rushLevel: recap.rushLevel,
            consumersSampled: recap.consumersSampled,
            customerFeedback: recap.customerFeedback,
            receiptUrl: recap.receiptUrl,
            managerSignature: recap.managerSignature,
            storeManagerName: recap.storeManagerName,
            managerReview: recap.managerReview,
            skus: recap.skus || [],
            createdAt: recap.createdAt,
            shiftDate: assignment?.date,
            clockIn: assignment?.clockIn,
            clockOut: assignment?.clockOut
        };

        return NextResponse.json(data);
    } catch (error) {
        return handleApiError(error);
    }
}
