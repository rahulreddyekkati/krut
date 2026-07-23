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
    console.log("=== CHECKING FOR MISSING CLOCK-OUTS FROM YESTERDAY (JULY 10, 2026) ===");

    const dayStart = new Date("2026-07-10T00:00:00.000Z");
    const dayEnd = new Date("2026-07-10T23:59:59.999Z");

    const assignments = await prisma.jobAssignment.findMany({
        where: {
            date: {
                gte: dayStart,
                lte: dayEnd
            },
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
        }
    });

    console.log(`Found ${assignments.length} workers not clocked out:`);
    for (const a of assignments) {
        console.log(`Worker: ${a.worker.name} (${a.worker.email})`);
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
