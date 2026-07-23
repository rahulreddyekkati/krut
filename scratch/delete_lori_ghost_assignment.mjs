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

const GHOST_ID = "cmrmg7hjh0001l704qtrlm1bq";

async function main() {
    const row = await prisma.jobAssignment.findUnique({ where: { id: GHOST_ID }, include: { job: true, recap: true } });
    if (!row) { console.log("Not found — already deleted?"); return; }

    console.log("About to delete:", {
        id: row.id,
        jobTitle: row.job?.title,
        date: row.date,
        status: row.status,
        clockIn: row.clockIn,
        clockOut: row.clockOut,
        hasRecap: !!row.recap,
    });

    // Safety guard: refuse to delete if it somehow has clock data or a recap
    if (row.clockIn || row.clockOut || row.recap) {
        console.log("ABORTING — this row has real clock/recap data, not deleting.");
        return;
    }

    await prisma.jobAssignment.delete({ where: { id: GHOST_ID } });
    console.log("Deleted.");
}

main().catch(e => console.error("SCRIPT ERROR:", e)).finally(() => prisma.$disconnect());
