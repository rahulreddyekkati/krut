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
    const assignmentId = "cmrb9stid0007jy040jznyjpv";
    console.log(`=== FETCHING BREAKS FOR ASSIGNMENT: ${assignmentId} ===`);

    const breaks = await prisma.break.findMany({
        where: {
            assignmentId
        }
    });

    console.log("Breaks:", JSON.stringify(breaks, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
