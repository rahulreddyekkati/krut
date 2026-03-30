import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Get user's assigned market
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { marketId: true }
        });

        if (!user || !user.marketId) {
            return NextResponse.json([]);
        }

        // Find open jobs in the same market
        const openJobs = await prisma.job.findMany({
            where: {
                marketId: user.marketId,
                status: "OPEN"
            },
            include: {
                store: { select: { name: true, address: true } },
                market: { select: { name: true } },
                _count: { select: { assignments: true } }
            },
            orderBy: { startTimeStr: "asc" }
        });

        // Also find pending release requests from OTHER workers in the same market
        const pendingReleases = await prisma.releaseRequest.findMany({
            where: {
                status: "PENDING",
                workerId: { not: session.user.id },
                job: { marketId: user.marketId }
            },
            include: {
                job: {
                    include: {
                        store: { select: { name: true, address: true } },
                        market: { select: { name: true } },
                        _count: { select: { assignments: true } }
                    }
                }
            }
        });

        // Map them to look like Jobs, with the specific date of the release
        const releasedShiftJobs = pendingReleases.map(pr => ({
            ...pr.job,
            date: pr.date,
            isReleasedShift: true
        }));

        const allAvailableJobs = [...openJobs, ...releasedShiftJobs];

        // Get user's pending shift requests
        const pendingRequests = await prisma.shiftRequest.findMany({
            where: {
                workerId: session.user.id,
                status: "PENDING"
            },
            select: { jobId: true }
        });
        const pendingJobIds = new Set(pendingRequests.map(r => r.jobId));

        // Filter out jobs that have already started and map with requested status
        const now = new Date();
        const filteredJobs = allAvailableJobs
            .filter(job => {
                if (!job.startTimeStr) return true;

                const [h, m] = job.startTimeStr.split(':').map(Number);
                const shiftDate = job.date ? new Date(job.date) : new Date();
                shiftDate.setHours(h, m, 0, 0);

                return now < shiftDate;
            })
            .map(job => ({
                ...job,
                isRequested: pendingJobIds.has(job.id)
            }));

        return NextResponse.json(filteredJobs);
    } catch (error) {
        console.error("Open shifts GET error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
