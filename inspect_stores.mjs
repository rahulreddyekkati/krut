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
    console.log("=== STORE MARKET INFORMATION ===");
    
    const storeIds = [
        "cmp713h070005itha12fre15v", // Total Wine 506
        "cmp71eziq0003itgxesc21i5e", // WB Liquors 30
        "cmp71ezbi0001itgxiqzr9uyh"  // WB Liquors 29
    ];

    const stores = await prisma.store.findMany({
        where: {
            id: { in: storeIds }
        },
        include: {
            market: { select: { id: true, name: true } }
        }
    });

    console.log(JSON.stringify(stores, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
