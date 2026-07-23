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
    console.log("=== CHECKING KAREN BEATTY'S SHIFT FOR TODAY ===");

    const user = await prisma.user.findFirst({
        where: { name: { contains: "Karen" } }
    });

    if (!user) {
        console.log("User Karen Beatty not found");
        return;
    }

    const dayStart = new Date("2026-07-11T00:00:00.000Z");
    const dayEnd = new Date("2026-07-11T23:59:59.999Z");

    const assignment = await prisma.jobAssignment.findFirst({
        where: {
            workerId: user.id,
            date: { gte: dayStart, lte: dayEnd }
        },
        include: {
            job: {
                include: { store: true }
            }
        }
    });

    if (!assignment) {
        console.log("No shift assignment found for Karen Beatty today.");
        return;
    }

    console.log("Assignment details:");
    console.log(`  ID: ${assignment.id}`);
    console.log(`  Store: ${assignment.job.store.name}`);
    console.log(`  Schedule: ${assignment.customStartTimeStr ?? assignment.job.startTimeStr} - ${assignment.customEndTimeStr ?? assignment.job.endTimeStr}`);
    console.log(`  Clock In: ${assignment.clockIn ? new Date(assignment.clockIn).toISOString() : "NO"}`);
    console.log(`  Status: ${assignment.status}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
