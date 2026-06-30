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
    console.log("=== INSPECTING DATABASE ===");
    
    const users = await prisma.user.findMany({
        take: 10,
        select: { id: true, name: true, email: true, role: true }
    });
    console.log("\n--- Users (First 10) ---");
    console.log(users);

    const stores = await prisma.store.findMany({
        take: 10,
        select: { id: true, name: true, address: true, market: { select: { name: true } } }
    });
    console.log("\n--- Stores (First 10) ---");
    console.log(stores);

    const jobs = await prisma.job.findMany({
        take: 5,
        select: { id: true, title: true, startTimeStr: true, endTimeStr: true, date: true, store: { select: { name: true } } }
    });
    console.log("\n--- Jobs (First 5) ---");
    console.log(jobs);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
