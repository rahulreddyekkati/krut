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
    console.log("=== CHECKING KAREN BEATTY'S RECAP RECORDS ===");

    const user = await prisma.user.findFirst({
        where: { name: { contains: "Karen" } }
    });

    if (!user) {
        console.log("User Karen Beatty not found");
        return;
    }

    const assignments = await prisma.jobAssignment.findMany({
        where: {
            workerId: user.id,
            id: {
                in: ["cmr2xityk000nl504yvz2j35q", "cmr2xj8pr000pl504khq66hx9"]
            }
        },
        include: {
            recap: true,
            job: {
                include: { store: true }
            }
        }
    });

    for (const a of assignments) {
        console.log(`Assignment ID: ${a.id}`);
        console.log(`  Date: ${a.date ? new Date(a.date).toISOString().split('T')[0] : 'N/A'}`);
        console.log(`  Store: ${a.job.store.name}`);
        console.log(`  Assignment Status: ${a.status}`);
        if (a.recap) {
            console.log(`  Recap Record Found:`);
            console.log(`    Recap ID: ${a.recap.id}`);
            console.log(`    Recap Status: ${a.recap.status}`);
            console.log(`    Receipts Attached: ${a.recap.receiptUrl ? "YES" : "NO"}`);
        } else {
            console.log(`  Recap Record Found: NONE`);
        }
        console.log("-----------------------------------------");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
