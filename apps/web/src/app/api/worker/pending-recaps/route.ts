import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Find all assignments for this worker where:
        // - They have clocked out (clockOut is not null)
        // - No recap has been submitted yet
        const pendingRecaps = await prisma.jobAssignment.findMany({
            where: {
                workerId: session.user.id,
                status: "RECAP_PENDING",
                OR: [
                    { recap: { is: null } },
                    { recap: { status: "REJECTED" } }
                ]
            },
            include: {
                job: {
                    include: {
                        store: {
                            include: {
                                market: { select: { name: true } }
                            }
                        }
                    }
                }
            },
            orderBy: { clockOut: "desc" }
        });

        const data = pendingRecaps.map((a: any) => ({
            assignmentId: a.id,
            jobId: a.job.id,
            jobTitle: a.job.title,
            storeName: a.job.store.name,
            marketName: a.job.store.market?.name || "—",
            clockIn: a.clockIn,
            clockOut: a.clockOut,
            shiftDate: a.date || a.clockIn || a.createdAt,
            startTime: a.job.startTimeStr,
            endTime: a.job.endTimeStr
        }));

        return NextResponse.json({ pendingRecaps: data });
    } catch (error) {
        console.error("Worker pending recaps error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
