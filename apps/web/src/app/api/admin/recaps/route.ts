import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError, AppError } from "@/lib/apiError";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        const dateParam = request.nextUrl.searchParams.get("date");
        const statusParam = request.nextUrl.searchParams.get("status");

        let dateFilter: any = {};
        if (dateParam) {
            const [y, m, d] = dateParam.split('-').map(Number);
            const start = new Date(y, m - 1, d, 0, 0, 0, 0);
            const end = new Date(y, m - 1, d, 23, 59, 59, 999);
            // Filter by assignment date instead of recap creation date
            dateFilter = { 
                assignment: {
                    date: { gte: start, lte: end }
                }
            };
        }

        let jobWhere: any = {};
        if (user.role === "MARKET_MANAGER") {
            jobWhere = { store: { marketId: user.managedMarketId } };
        }

        let statusFilter: any = {};
        if (statusParam) {
            const statuses = statusParam.split(',');
            statusFilter = { status: { in: statuses } };
        }

        const recaps = await (prisma.recap as any).findMany({
            where: {
                ...dateFilter,
                ...statusFilter,
                job: jobWhere
            },
            include: {
                job: {
                    include: {
                        store: {
                            include: { market: { select: { name: true } } }
                        },
                        assignments: {
                            include: {
                                worker: { select: { id: true, name: true, email: true } }
                            }
                        }
                    }
                },
                skus: true
            },
            orderBy: { createdAt: "desc" }
        });

        const data = recaps.map((r: any) => {
            // Find an assignment that actually has clock times if possible
            const assignmentWithTimes = r.job.assignments?.find((a: any) => a.clockIn || a.clockOut) || r.job.assignments?.[0];
            const worker = assignmentWithTimes?.worker;

            return {
                id: r.id,
                jobId: r.jobId,
                workerName: worker?.name || "Unknown",
                workerId: worker?.id,
                workerEmail: worker?.email,
                storeName: r.job.store.name,
                marketName: r.job.store.market?.name || "—",
                status: r.status || "PENDING",
                reimbursement: r.reimbursement,
                receiptTotal: r.receiptTotal || 0,
                rushLevel: r.rushLevel,
                consumersSampled: r.consumersSampled,
                customerFeedback: r.customerFeedback,
                receiptUrl: r.receiptUrl,
                managerReview: r.managerReview,
                skus: r.skus || [],
                createdAt: r.createdAt,
                startTime: r.job.startTimeStr,
                endTime: r.job.endTimeStr,
                clockIn: assignmentWithTimes?.clockIn,
                clockOut: assignmentWithTimes?.clockOut
            };
        });

        return NextResponse.json({ recaps: data });
    } catch (error) {
        return handleApiError(error);
    }
}


