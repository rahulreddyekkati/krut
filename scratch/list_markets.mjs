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
    console.log("=== LISTING MARKETS AND THEIR STORES ===");

    const markets = await prisma.market.findMany({
        include: {
            stores: true
        }
    });

    for (const m of markets) {
        console.log(`Market: ${m.name}`);
        for (const s of m.stores) {
            console.log(`  Store: ${s.name} | Address: ${s.address}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
