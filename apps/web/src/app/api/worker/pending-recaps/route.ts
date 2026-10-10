import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { resolveStoreTimezone, toLocalDateStr } from "@/lib/timezone";

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
                                market: { select: { name: true, timezone: true } }
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
            // Clients read shiftDate as a UTC-midnight calendar marker. A shift with no
            // marker falls back to the store-local day of its clock-in, converted to the
            // same marker form — returning the raw instant showed evening shifts a day late.
            shiftDate: a.date || new Date(
                toLocalDateStr(new Date(a.clockIn || a.createdAt), resolveStoreTimezone(a.job.store, a.job.store.market)) + "T00:00:00.000Z"
            ),
            startTime: a.job.startTimeStr,
            endTime: a.job.endTimeStr
        }));

        return NextResponse.json({ pendingRecaps: data });
    } catch (error) {
        console.error("Worker pending recaps error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
