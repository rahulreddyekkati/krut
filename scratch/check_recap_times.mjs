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
    console.log("=== CHECKING KAREN BEATTY'S RECAP TIMESTAMPS ===");

    const recaps = await prisma.recap.findMany({
        where: {
            id: {
                in: ["cmr5lp2870001jl04k41oq5tq", "cmrglwrah0001jr04ah64aup1"]
            }
        }
    });

    for (const r of recaps) {
        console.log(`Recap ID: ${r.id}`);
        console.log(`  Created At: ${r.createdAt ? new Date(r.createdAt).toISOString() : 'N/A'}`);
        console.log(`  Updated At: ${r.updatedAt ? new Date(r.updatedAt).toISOString() : 'N/A'}`);
        console.log(`  Status: ${r.status}`);
        console.log("-----------------------------------------");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
