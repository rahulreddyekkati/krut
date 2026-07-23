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

async function main() {
    console.log("=== Donovan's account ===");
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
    const user = allUsers.find(u => u.email?.toLowerCase() === "donovanlaurie77@gmail.com".toLowerCase());
    console.log(user ? user : "NOT FOUND (exact, case-insensitive)");

    if (!user) {
        const fuzzy = allUsers.filter(u => u.email?.toLowerCase().includes("donovan"));
        console.log("Fuzzy matches:", fuzzy);
        return;
    }

    const assignment = await prisma.jobAssignment.findFirst({
        where: { workerId: user.id, clockIn: { not: null }, clockOut: null },
        include: { job: true },
        orderBy: { clockIn: "desc" },
    });
    console.log("\n=== Donovan's active (clocked-in) assignment ===");
    console.log(assignment ? {
        id: assignment.id,
        date: assignment.date,
        clockIn: assignment.clockIn,
        customStartTimeStr: assignment.customStartTimeStr,
        customEndTimeStr: assignment.customEndTimeStr,
        jobId: assignment.jobId,
        jobStartTimeStr: assignment.job?.startTimeStr,
        jobEndTimeStr: assignment.job?.endTimeStr,
        isRecurring: assignment.isRecurring,
    } : "NO ACTIVE ASSIGNMENT FOUND");

    console.log("\n=== System-wide: currently clocked-in assignments missing effective start/end time ===");
    const active = await prisma.jobAssignment.findMany({
        where: { clockIn: { not: null }, clockOut: null },
        include: { job: true, worker: { select: { email: true, name: true } } },
    });
    console.log(`Total currently clocked-in: ${active.length}`);
    for (const a of active) {
        const effStart = a.customStartTimeStr ?? a.job?.startTimeStr;
        const effEnd = a.customEndTimeStr ?? a.job?.endTimeStr;
        if (!effStart || !effEnd) {
            console.log("MISSING TIME STR:", {
                worker: a.worker?.email,
                assignmentId: a.id,
                jobId: a.jobId,
                jobStartTimeStr: a.job?.startTimeStr,
                jobEndTimeStr: a.job?.endTimeStr,
                customStartTimeStr: a.customStartTimeStr,
                customEndTimeStr: a.customEndTimeStr,
            });
        }
    }
}

main().catch(e => console.error("SCRIPT ERROR:", e)).finally(() => prisma.$disconnect());
