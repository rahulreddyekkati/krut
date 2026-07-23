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
    console.log("=== CHECKING PATRICIA COUSINS' SHIFTS ===");

    const user = await prisma.user.findFirst({
        where: { name: { contains: "Patricia" } }
    });

    if (!user) {
        console.log("User Patricia not found");
        return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);

    const assignments = await prisma.jobAssignment.findMany({
        where: { workerId: user.id },
        include: {
            job: {
                include: { store: true }
            }
        },
        orderBy: { date: "desc" }
    });

    console.log(`Found ${assignments.length} assignments:`);
    for (const a of assignments) {
        console.log(`Date: ${a.date ? new Date(a.date).toISOString().split('T')[0] : 'N/A'}`);
        console.log(`  Store: ${a.job.store.name}`);
        console.log(`  Schedule: ${a.customStartTimeStr ?? a.job.startTimeStr} - ${a.customEndTimeStr ?? a.job.endTimeStr}`);
        console.log(`  ClockIn: ${a.clockIn ? new Date(a.clockIn).toISOString() : 'NO'}`);
        console.log(`  ClockOut: ${a.clockOut ? new Date(a.clockOut).toISOString() : 'NO'}`);
        console.log(`  Status: ${a.status}`);
        console.log(`  -----------------------------------------`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
