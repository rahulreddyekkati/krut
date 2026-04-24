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

        // 3. Unassigned Released Shifts — match via sourceReleaseId (not fragile title suffix)
        const releasedShiftsCount = await prisma.job.count({
            where: { status: "OPEN", sourceReleaseId: { not: null } }
        });

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
