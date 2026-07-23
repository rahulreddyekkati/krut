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
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log("=== OLD query (buggy) would remind: ===");
    const old = await prisma.jobAssignment.findMany({
        where: { status: "RECAP_PENDING", clockOut: { gte: twentyFourHoursAgo, lte: oneHourAgo } },
        include: { worker: { select: { email: true, name: true } }, recap: true },
    });
    old.forEach(a => console.log({ worker: a.worker?.name, hasRecap: !!a.recap, recapStatus: a.recap?.status }));

    console.log("\n=== NEW query (fixed) would remind: ===");
    const fixed = await prisma.jobAssignment.findMany({
        where: { status: "RECAP_PENDING", clockOut: { gte: twentyFourHoursAgo, lte: oneHourAgo }, recap: { is: null } },
        include: { worker: { select: { email: true, name: true } }, recap: true },
    });
    fixed.forEach(a => console.log({ worker: a.worker?.name, hasRecap: !!a.recap }));
    if (fixed.length === 0) console.log("(none)");
}

main().catch(e => console.error("SCRIPT ERROR:", e)).finally(() => prisma.$disconnect());
