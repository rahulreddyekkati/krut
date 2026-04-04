import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// DELETE /api/jobs/[id] - Delete a job
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const requester = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!requester || (requester.role !== "ADMIN" && requester.role !== "MARKET_MANAGER")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        const job = await prisma.job.findUnique({
            where: { id },
            select: { marketId: true, status: true }
        });

        if (!job) {
            return NextResponse.json({ error: "Job not found" }, { status: 404 });
        }

        if (requester.role === "MARKET_MANAGER" && job.marketId !== requester.managedMarketId) {
            return NextResponse.json({ error: "Unauthorized: Job outside your market" }, { status: 403 });
        }

        // Delete related records first to satisfy foreign key constraints
        await prisma.jobAssignment.deleteMany({ where: { jobId: id } });
        await prisma.shiftRequest.deleteMany({ where: { jobId: id } });
        await prisma.releaseRequest.deleteMany({ where: { jobId: id } });

        // Delete recap SKUs and recaps
        await prisma.recapSKU.deleteMany({
            where: { recap: { jobId: id } }
        });
        await prisma.overtimeRequest.deleteMany({
            where: { recap: { jobId: id } }
        });
        await prisma.recap.deleteMany({
            where: { jobId: id }
        });

        await prisma.job.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE Job error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
