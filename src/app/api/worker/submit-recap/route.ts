import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        const {
            jobId,
            assignmentId, // NEW: Expect assignmentId
            rushLevel,
            customersSampled,
            receiptTotal,
            reimbursementTotal,
            inventoryData,
            customerFeedback,
            receiptUrl
        } = body;

        if (!jobId) {
            return NextResponse.json({ error: "jobId is required" }, { status: 400 });
        }

        // 1. Find the specific assignment (materialized instance)
        let assignment;
        if (assignmentId) {
            assignment = await prisma.jobAssignment.findFirst({
                where: { id: assignmentId, workerId: session.user.id }
            });
        } else {
            // Fallback: find today's instance for this job/worker.
            const now = new Date();
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);
            const endOfToday = new Date(now);
            endOfToday.setHours(23, 59, 59, 999);

            assignment = await prisma.jobAssignment.findFirst({
                where: { 
                    jobId, 
                    workerId: session.user.id,
                    OR: [
                        { date: { gte: startOfToday, lte: endOfToday } },
                        { isRecurring: true }
                    ]
                },
                orderBy: { date: 'desc' }
            });
        }

        if (!assignment) {
            return NextResponse.json({ error: "No active assignment found for this job today" }, { status: 404 });
        }

        // Build SKU data from inventoryData
        const skuData: { 
            skuName: string; 
            beginningInventory: number;
            purchased: number;
            bottlesSold: number;
            storePrice: number;
        }[] = [];
        if (inventoryData && typeof inventoryData === 'object') {
            Object.values(inventoryData).forEach((item: any) => {
                // If there's any data for this item, store it
                if (item.name) {
                    const beginning = parseInt(item.beginning);
                    const purchased = parseInt(item.purchased);
                    const sold = parseInt(item.sold);
                    const price = parseFloat(item.storePrice);

                    skuData.push({
                        skuName: item.name || 'Unknown',
                        beginningInventory: isNaN(beginning) ? 0 : beginning,
                        purchased: isNaN(purchased) ? 0 : purchased,
                        bottlesSold: isNaN(sold) ? 0 : sold,
                        storePrice: isNaN(price) ? 0 : price
                    });
                }
            });
        }

        // Create the recap linked to the assignment
        const recap = await (prisma.recap as any).create({
            data: {
                jobId,
                assignmentId: assignment.id, // NEW: Link to specific assignment
                consumersAttended: parseInt(customersSampled) || 0,
                consumersSampled: parseInt(customersSampled) || 0,
                reimbursement: parseFloat(reimbursementTotal) || 0,
                receiptTotal: parseFloat(receiptTotal) || 0,
                rushLevel: rushLevel || null,
                customerFeedback: customerFeedback || null,
                receiptUrl: receiptUrl || null,
                comments: customerFeedback || null,
                status: "PENDING",
                skus: {
                    create: skuData
                }
            }
        });

        // Update job status from RECAP_PENDING to COMPLETED
        await prisma.job.update({
            where: { id: jobId },
            data: { status: "COMPLETED" }
        });

        return NextResponse.json({ success: true, recap });
    } catch (error: any) {
        console.error("Recap submit error:", error);
        // If recap already exists
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: "Recap already submitted for this job" }, { status: 409 });
        }
        return NextResponse.json({ error: "Internal server error: " + error.message, details: error }, { status: 500 });
    }
}
