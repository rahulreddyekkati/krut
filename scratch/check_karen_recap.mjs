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
    console.log("=== CHECKING KAREN BEATTY'S RECAP STATUS ===");

    const user = await prisma.user.findFirst({
        where: { name: { contains: "Karen" } }
    });

    if (!user) {
        console.log("User Karen Beatty not found");
        return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);

    const pendingRecaps = await prisma.jobAssignment.findMany({
        where: {
            workerId: user.id,
            status: "RECAP_PENDING"
        },
        include: {
            job: {
                include: { store: true }
            }
        }
    });

    console.log(`Found ${pendingRecaps.length} pending recaps:`);
    for (const a of pendingRecaps) {
        console.log(`Assignment ID: ${a.id}`);
        console.log(`Date: ${a.date ? new Date(a.date).toISOString().split('T')[0] : 'N/A'}`);
        console.log(`Store: ${a.job.store.name}`);
        console.log(`Schedule: ${a.customStartTimeStr ?? a.job.startTimeStr} - ${a.customEndTimeStr ?? a.job.endTimeStr}`);
        console.log(`Status: ${a.status}`);
        console.log("-----------------------------------------");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
