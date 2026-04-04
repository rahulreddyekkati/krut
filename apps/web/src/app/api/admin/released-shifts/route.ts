import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Fetch all approved ReleaseRequests
        const approvedReleases = await prisma.releaseRequest.findMany({
            where: { status: "APPROVED" },
            include: {
                worker: { select: { name: true } },
                job: { include: { store: true, market: true } }
            },
            orderBy: { createdAt: "desc" }
        });

        // Fetch all OPEN jobs to see which releases are still unfulfilled
        const openJobs = await prisma.job.findMany({
            where: { status: "OPEN" }
        });

        // We only want released shifts that have "not been assigned to any others".
        // A release is considered unassigned if the cloned Open Job is STILL "OPEN".
        const unassignedReleases = approvedReleases.map(release => {
            if (!release.date) {
                // If recurring (no specific date), it's unassigned if an open job exists containing its ID
                const matchedJob = openJobs.find(job => job.title.includes(release.id.slice(-4)));
                return { ...release, openJobId: matchedJob?.id };
            }
            
            // Check if there's an OPEN job that matches this release exactly
            const matchedJob = openJobs.find(job => 
                job.storeId === release.job.storeId &&
                job.startTimeStr === release.job.startTimeStr &&
                job.date && release.date &&
                new Date(job.date).toISOString().split('T')[0] === new Date(release.date).toISOString().split('T')[0] &&
                job.title.includes(release.id.slice(-4))
            );
            return { ...release, openJobId: matchedJob?.id };
        }).filter(r => r.openJobId); // keeping only those where the active open job exists

        return NextResponse.json(unassignedReleases);
    } catch (error) {
        console.error("Get released shifts error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
