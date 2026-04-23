import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { handleApiError } from "@/lib/apiError";

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(request, ["ADMIN", "MARKET_MANAGER"]);

        let jobWhere: any = {};
        if (user.role === "MARKET_MANAGER") {
            jobWhere = { store: { marketId: user.managedMarketId } };
        }

        const incompleteAssignments = await prisma.jobAssignment.findMany({
            where: {
                status: "RECAP_PENDING",
                job: jobWhere,
                OR: [
                    { recap: { is: null } },
                    { recap: { status: "REJECTED" } }
                ]
            },
            include: {
                worker: { select: { id: true, name: true, email: true } },
                job: {
                    include: {
                        store: { 
                            select: { 
                                name: true,
                                market: { select: { name: true } }
                            } 
                        }
                    }
                }
            },
            orderBy: { clockOut: 'asc' } // longest overdue first
        });

        const now = new Date();
        const data = incompleteAssignments.map((a: any) => {
            let hoursOverdue = 0;
            if (a.clockOut) {
                const diffMs = now.getTime() - new Date(a.clockOut).getTime();
                hoursOverdue = Math.floor(diffMs / (1000 * 60 * 60));
            }

            return {
                id: a.id,
                workerId: a.worker?.id || a.workerId,
                workerName: a.worker?.name || "Unknown",
                storeName: a.job?.store?.name || "Unknown Store",
                market: a.job?.market?.name || a.job?.store?.market?.name || "—",
                clockIn: a.clockIn,
                clockOut: a.clockOut,
                shiftDate: a.date,
                hoursOverdue
            };
        });

        return NextResponse.json(data);
    } catch (error) {
        return handleApiError(error);
    }
}
