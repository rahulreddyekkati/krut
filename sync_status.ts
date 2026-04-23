import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Starting final data synchronization...");

    // 1. All assignments with clock-out NOT approved/rejected should be RECAP_PENDING
    const assignments = await prisma.jobAssignment.findMany({
        include: { recap: true }
    });

    let updatedCount = 0;
    for (const a of assignments) {
        let targetStatus = a.status;

        if (a.clockIn && a.clockOut) {
            if (a.recap?.status === "APPROVED") {
                targetStatus = "COMPLETED";
            } else {
                targetStatus = "RECAP_PENDING";
            }
        } else if (a.clockIn) {
            targetStatus = "IN_PROGRESS";
        } else {
            targetStatus = "ASSIGNED";
        }

        if (targetStatus !== a.status) {
            await prisma.jobAssignment.update({
                where: { id: a.id },
                data: { status: targetStatus }
            });
            updatedCount++;
            console.log(`Updated assignment ${a.id} status: ${a.status} -> ${targetStatus}`);
        }
    }

    console.log(`Synchronized ${updatedCount} assignments.`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
