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

        // Fetch all OPEN jobs that have a sourceReleaseId (released shifts awaiting reassignment)
        const openJobs = await prisma.job.findMany({
            where: { status: "OPEN", sourceReleaseId: { not: null } }
        });

        // Match each approved release to its still-open job via sourceReleaseId
        const unassignedReleases = approvedReleases.map(release => {
            const matchedJob = openJobs.find(job => job.sourceReleaseId === release.id);
            return { ...release, openJobId: matchedJob?.id };
        }).filter(r => r.openJobId);

        return NextResponse.json(unassignedReleases);
    } catch (error) {
        console.error("Get released shifts error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
