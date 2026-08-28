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

        const where = {
            ...dateFilter,
            ...statusFilter,
            job: jobWhere
        };

        // List view only ever renders worker/store/market/date/status/reimbursement —
        // it never shows receiptUrl, managerSignature, customerFeedback, managerReview,
        // skus, or consumersSampled/consumersAttended (those are detail-only, fetched
        // separately by /api/admin/recaps/[id]). Using `select` instead of `include`
        // keeps those heavy fields (receiptUrl can be several MB of base64 receipt
        // photos per row) out of this query entirely, since pulling them for every
        // row here previously made this endpoint take 30s+ to resolve.
        const RECAP_LIST_TAKE = 500;

        const [recaps, total] = await Promise.all([
            (prisma.recap as any).findMany({
                where,
                select: {
                    id: true,
                    jobId: true,
                    status: true,
                    reimbursement: true,
                    receiptTotal: true,
                    rushLevel: true,
                    createdAt: true,
                    assignment: {
                        select: {
                            date: true,
                            clockIn: true,
                            clockOut: true,
                            worker: { select: { id: true, name: true, email: true } }
                        }
                    },
                    job: {
                        select: {
                            startTimeStr: true,
                            endTimeStr: true,
                            store: {
                                select: { name: true, market: { select: { name: true } } }
                            }
                        }
                    }
                },
                orderBy: { createdAt: "desc" },
                take: RECAP_LIST_TAKE
            }),
            (prisma.recap as any).count({ where })
        ]);

        if (total > recaps.length) {
            console.warn(`[admin/recaps] list truncated: returning ${recaps.length} of ${total} matching recaps (take=${RECAP_LIST_TAKE})`);
        }

        const data = recaps.map((r: any) => {
            const assignment = r.assignment;
            const worker = assignment?.worker;

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
                createdAt: r.createdAt,
                shiftDate: assignment?.date,
                startTime: r.job.startTimeStr,
                endTime: r.job.endTimeStr,
                clockIn: assignment?.clockIn,
                clockOut: assignment?.clockOut
            };
        });

        return NextResponse.json({ recaps: data, total });
    } catch (error) {
        return handleApiError(error);
    }
}


