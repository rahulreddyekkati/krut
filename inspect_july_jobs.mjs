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
    console.log("=== INSPECTING JULY 2026 JOBS ===");
    
    const count = await prisma.job.count({
        where: {
            date: {
                gte: new Date("2026-07-01T00:00:00.000Z"),
                lte: new Date("2026-07-31T23:59:59.999Z")
            }
        }
    });
    console.log(`Total July 2026 Jobs: ${count}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
