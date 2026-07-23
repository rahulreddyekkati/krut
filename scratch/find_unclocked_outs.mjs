import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./apps/web/.env") });

const prismaClientSingleton = () => {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

    if (tursoUrl && (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://"))) {
        const libsql = createClient({
            url: tursoUrl,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    }

    return new PrismaClient();
};

const prisma = prismaClientSingleton();

async function main() {
    console.log("=== CHECKING FOR ANY OPEN CLOCK-INS (CLOCK-OUT IS NULL) ===");

    const assignments = await prisma.jobAssignment.findMany({
        where: {
            clockIn: { not: null },
            clockOut: null
        },
        include: {
            worker: { select: { name: true, email: true } },
            job: {
                include: {
                    store: { select: { name: true } }
                }
            }
        },
        orderBy: { date: "asc" }
    });

    console.log(`Found ${assignments.length} open clock-ins:`);
    for (const a of assignments) {
        console.log(`Worker: ${a.worker.name} (${a.worker.email})`);
        console.log(`  Date: ${a.date ? new Date(a.date).toISOString().split('T')[0] : 'N/A'}`);
        console.log(`  Store: ${a.job.store.name}`);
        console.log(`  Schedule: ${a.customStartTimeStr ?? a.job.startTimeStr} - ${a.customEndTimeStr ?? a.job.endTimeStr}`);
        console.log(`  ClockIn: ${a.clockIn.toISOString()}`);
        console.log(`  Status: ${a.status}`);
        console.log("-----------------------------------------");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
