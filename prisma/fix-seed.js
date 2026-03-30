const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const worker1 = await prisma.user.findUnique({ where: { email: "worker1@example.com" } });
    const worker2 = await prisma.user.findUnique({ where: { email: "worker2@example.com" } });

    if (!worker1) return console.log("Worker 1 not found");

    const job = await prisma.job.findFirst({ where: { title: "Main Shift" } });
    if (!job) return console.log("Job not found");

    // 1. Create a Recurring Assignment for Worker 1
    // This makes the shift show up on their dashboard today
    await prisma.jobAssignment.create({
        data: {
            workerId: worker1.id,
            jobId: job.id,
            isRecurring: true,
            date: null
        }
    });

    console.log("Added recurring assignment for Worker 1.");

    // 2. Create Historical Assignments for March 12-14
    // This creates actual past data to show up in the Payroll Report
    const dates = [
        new Date("2026-03-12T00:00:00.000Z"),
        new Date("2026-03-13T00:00:00.000Z"),
        new Date("2026-03-14T00:00:00.000Z")
    ];

    let totalCreated = 0;
    for (const date of dates) {
        const clockIn = new Date(date);
        clockIn.setUTCHours(14, 0, 0, 0); // 9 AM EST (assuming UTC-5)
        
        const clockOut = new Date(date);
        clockOut.setUTCHours(22, 0, 0, 0); // 5 PM EST 

        const assignment = await prisma.jobAssignment.create({
            data: {
                workerId: worker1.id,
                jobId: job.id,
                date: date,
                isRecurring: false,
                clockIn: clockIn,
                clockOut: clockOut,
                workedHours: 8,
                breakTimeMinutes: 0
            }
        });
        
        // Approve a recap so there's reimbursement data as well
        await prisma.recap.create({
            data: {
                jobId: job.id,
                assignmentId: assignment.id,
                consumersAttended: 50,
                consumersSampled: 20,
                reimbursement: 15.50, // Test reimbursement
                status: "APPROVED"
            }
        });

        totalCreated++;
    }

    console.log(`Successfully created ${totalCreated} historical assignments with recaps for Worker 1.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
