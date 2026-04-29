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
                job: {
                    include: {
                        store: {
                            include: {
                                market: { select: { name: true } }
                            }
                        },
                        assignments: {
                            include: {
                                worker: { select: { id: true, name: true, email: true } }
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

        const assignmentWithTimes = recap.job.assignments?.find((a: any) => a.id === recap.assignmentId) || recap.job.assignments?.find((a: any) => a.clockIn || a.clockOut) || recap.job.assignments?.[0];
        const worker = assignmentWithTimes?.worker;

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
            shiftDate: assignmentWithTimes?.date,
            clockIn: assignmentWithTimes?.clockIn,
            clockOut: assignmentWithTimes?.clockOut
        };

        return NextResponse.json(data);
    } catch (error) {
        return handleApiError(error);
    }
}
