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
    const user = await prisma.user.findFirst({ where: { name: { contains: "Lori Dedes" } } });
    if (!user) { console.log("Lori not found"); return; }

    const assignment = await prisma.jobAssignment.findFirst({
        where: { workerId: user.id, date: new Date("2026-07-03T00:00:00.000Z") },
        include: { recap: true, job: { include: { store: true } } },
    });

    if (!assignment?.recap) { console.log("No recap found for Jul 3"); return; }

    const r = assignment.recap;
    console.log("Recap id:", r.id);
    console.log("Status:", r.status);
    const url = r.receiptUrl || "";
    console.log("receiptUrl length:", url.length);
    console.log("receiptUrl first 100 chars:", url.slice(0, 100));
    console.log("receiptUrl last 100 chars:", url.slice(-100));
    console.log("Contains 'undefined':", url.includes("undefined"));
}
main().catch(e => console.error("ERR:", e)).finally(() => prisma.$disconnect());
