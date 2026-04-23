import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const assignments = await prisma.jobAssignment.findMany({
        where: {
            OR: [
                { status: "RECAP_PENDING" },
                { status: "COMPLETED" }
            ]
        },
        include: {
            recap: true,
            worker: { select: { name: true } },
            job: { select: { date: true, startTimeStr: true } }
        }
    });

    console.log("--- Job Assignments ---");
    assignments.forEach(a => {
        console.log(`ID: ${a.id}`);
        console.log(`Worker: ${a.worker?.name}`);
        console.log(`Date: ${a.job?.date?.toISOString()}`);
        console.log(`Status: ${a.status}`);
        console.log(`Recap Status: ${a.recap?.status || "NULL"}`);
        console.log(`Recap ID: ${a.recap?.id || "NULL"}`);
        console.log("------------------------");
    });
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(() => prisma.$disconnect());
