import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session || !["ADMIN", "MARKET_MANAGER"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Pending Recaps
        const recapsCount = await prisma.recap.count({
            where: { status: "PENDING" }
        });

        // 2. Pending Shift Release & Assign Approvals
        const pendingReleasesCount = await prisma.releaseRequest.count({
            where: { status: "PENDING" }
        });
        const pendingAssignsCount = await prisma.shiftRequest.count({
            where: { status: "PENDING" }
        });
        const shiftApprovalsCount = pendingReleasesCount + pendingAssignsCount;

        // 3. Unassigned Released Shifts
        const approvedReleases = await prisma.releaseRequest.findMany({
            where: { status: "APPROVED" },
            include: { job: { select: { storeId: true, startTimeStr: true } } }
        });

        const openJobs = await prisma.job.findMany({
            where: { status: "OPEN" },
            select: { id: true, storeId: true, startTimeStr: true, date: true, title: true }
        });

        let releasedShiftsCount = 0;
        for (const release of approvedReleases) {
            if (!release.date) {
                if (openJobs.some(job => job.title.includes(release.id.slice(-4)))) {
                    releasedShiftsCount++;
                }
            } else {
                const releaseDateStr = new Date(release.date).toISOString().split('T')[0];
                const isStillOpen = openJobs.some(job => 
                    job.storeId === release.job.storeId &&
                    job.startTimeStr === release.job.startTimeStr &&
                    job.date && new Date(job.date).toISOString().split('T')[0] === releaseDateStr &&
                    job.title.includes(release.id.slice(-4))
                );
                if (isStillOpen) releasedShiftsCount++;
            }
        }

        // 4. Messages (assuming we just return 0 for now since messages aren't fully tracked yet)
        const messagesCount = 0; 

        return NextResponse.json({
            recaps: recapsCount,
            shiftApprovals: shiftApprovalsCount,
            releasedShifts: releasedShiftsCount,
            messages: messagesCount
        });
    } catch (error) {
        console.error("Get notification counts error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
