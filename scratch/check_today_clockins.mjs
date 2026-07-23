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
    console.log("=== COMPACT SUMMARY OF TODAY'S SHIFTS (JULY 10, 2026) ===");

    const dayStart = new Date("2026-07-10T00:00:00.000Z");
    const dayEnd = new Date("2026-07-10T23:59:59.999Z");

    const assignments = await prisma.jobAssignment.findMany({
        where: {
            date: {
                gte: dayStart,
                lte: dayEnd
            }
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

    console.log(`Total Shifts: ${assignments.length}`);
    const summary = assignments.map(a => {
        const startTime = a.customStartTimeStr ?? a.job.startTimeStr;
        const endTime = a.customEndTimeStr ?? a.job.endTimeStr;
        return {
            Worker: a.worker.name,
            Email: a.worker.email,
            Store: a.job.store.name,
            Schedule: `${startTime} - ${endTime}`,
            ClockedIn: a.clockIn ? new Date(a.clockIn).toISOString() : "NO",
            Status: a.status
        };
    });

    console.table(summary);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
