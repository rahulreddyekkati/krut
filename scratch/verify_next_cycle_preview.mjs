import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./apps/web/.env") });

const prismaClientSingleton = () => {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    if (tursoUrl && (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://"))) {
        const libsql = createClient({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    }
    return new PrismaClient();
};

const prisma = prismaClientSingleton();

// Mirror of getCurrentCycleDates/getNextCycleDates from apps/web/src/lib/cycles.ts
function getCurrentCycleDates(baseDate = new Date()) {
    const year = baseDate.getFullYear(), month = baseDate.getMonth(), day = baseDate.getDate();
    if (day <= 15) return { start: new Date(year, month, 1, 0, 0, 0, 0), end: new Date(year, month, 15, 23, 59, 59, 999) };
    return { start: new Date(year, month, 16, 0, 0, 0, 0), end: new Date(year, month + 1, 0, 23, 59, 59, 999) };
}
function getNextCycleDates(baseDate = new Date()) {
    const year = baseDate.getFullYear(), month = baseDate.getMonth(), day = baseDate.getDate();
    if (day <= 15) return { start: new Date(year, month, 16, 0, 0, 0, 0), end: new Date(year, month + 1, 0, 23, 59, 59, 999) };
    return { start: new Date(year, month + 1, 1, 0, 0, 0, 0), end: new Date(year, month + 1, 15, 23, 59, 59, 999) };
}

async function main() {
    const now = new Date();
    const currentCycle = getCurrentCycleDates();
    const nextCycle = getNextCycleDates();
    const previewStart = new Date(nextCycle.start);
    previewStart.setDate(previewStart.getDate() - 4);

    console.log("now:", now.toISOString());
    console.log("currentCycle:", currentCycle);
    console.log("nextCycle:", nextCycle);
    console.log("previewStart:", previewStart.toISOString());
    console.log("within preview window right now:", now >= previewStart);

    // Find a worker who has recurring assignments in the current cycle
    const currentRecurring = await prisma.jobAssignment.findMany({
        where: { isRecurring: true, date: { gte: currentCycle.start, lte: currentCycle.end } },
        include: { worker: { select: { name: true, email: true } }, job: { select: { id: true, title: true } } },
        take: 10,
    });
    console.log(`\nFound ${currentRecurring.length} recurring assignments in current cycle (sample of up to 10):`);
    currentRecurring.forEach(a => console.log({ worker: a.worker?.name, job: a.job?.title, date: a.date }));

    if (currentRecurring.length === 0) { console.log("No recurring assignments to test against."); return; }

    const workerId = currentRecurring[0].workerId;
    const workerName = currentRecurring[0].worker?.name;

    const nextExisting = await prisma.jobAssignment.count({
        where: { workerId, isRecurring: true, date: { gte: nextCycle.start, lte: nextCycle.end } },
    });
    console.log(`\nWorker "${workerName}" — existing next-cycle recurring assignments BEFORE fix runs: ${nextExisting}`);
    console.log("(This should be created automatically next time this worker's app calls GET /jobs/my-shifts, since we're within the preview window.)");
}

main().catch(e => console.error("SCRIPT ERROR:", e)).finally(() => prisma.$disconnect());
