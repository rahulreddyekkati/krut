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
    console.log("=== CHECKING ACCOUNT WITH SQLite COMPATIBLE SEARCH ===");
    
    // Check exact matching
    const exactMatch = await prisma.user.findFirst({
        where: {
            email: "kenya.washington03@gmail.com"
        }
    });

    console.log("Exact match:", exactMatch ? JSON.stringify(exactMatch, null, 2) : "None");

    // Fetch all users containing "kenya" in name or email
    const users = await prisma.user.findMany();
    const matches = users.filter(u => 
        (u.email && u.email.toLowerCase().includes("kenya")) || 
        (u.name && u.name.toLowerCase().includes("kenya"))
    );

    console.log("Matching users:", JSON.stringify(matches, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
