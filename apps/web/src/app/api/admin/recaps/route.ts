import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const requester = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!requester || (requester.role !== "ADMIN" && requester.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const dateParam = request.nextUrl.searchParams.get("date");

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
        if (requester.role === "MARKET_MANAGER") {
            jobWhere = { store: { marketId: requester.managedMarketId } };
        }

        const recaps = await (prisma.recap as any).findMany({
            where: {
                ...dateFilter,
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
    } catch (error: any) {
        console.error("Recaps list error:", error);
        return NextResponse.json({ error: "Internal server error", msg: error.message, stack: error.stack }, { status: 500 });
    }
}

// PATCH: approve or reject a recap
export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const requester = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!requester || (requester.role !== "ADMIN" && requester.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { recapId, action, managerReview } = await request.json();

        if (!recapId || !action) {
            return NextResponse.json({ error: "recapId and action are required" }, { status: 400 });
        }

        const recap = await (prisma.recap as any).findUnique({
            where: { id: recapId },
            include: {
                job: {
                    include: {
                        assignments: {
                            include: { worker: true }
                        }
                    }
                }
            }
        });

        if (!recap) {
            return NextResponse.json({ error: "Recap not found" }, { status: 404 });
        }

        if (action === "APPROVE") {
            await (prisma.recap as any).update({
                where: { id: recapId },
                data: {
                    status: "APPROVED",
                    managerReview: managerReview || null
                }
            });

            return NextResponse.json({ success: true, message: "Recap approved. Reimbursement added to pay cycle." });
        } else if (action === "REJECT") {
            await (prisma.recap as any).update({
                where: { id: recapId },
                data: {
                    status: "REJECTED",
                    managerReview: managerReview || null
                }
            });

            return NextResponse.json({ success: true, message: "Recap rejected." });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Recap approve error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
