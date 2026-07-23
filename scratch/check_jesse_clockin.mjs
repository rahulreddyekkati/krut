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
    console.log("=== CHECKING JESSE ROJANO'S SHIFT FOR TODAY (JULY 9, 2026) ===");
    
    // Find Jesse
    const user = await prisma.user.findFirst({
        where: {
            name: {
                contains: "Jesse"
            }
        }
    });

    if (!user) {
        console.log("User not found");
        return;
    }

    console.log(`User found: ${user.name} (${user.id})`);

    const dayStart = new Date("2026-07-09T00:00:00.000Z");
    const dayEnd = new Date("2026-07-09T23:59:59.999Z");

    const assignments = await prisma.jobAssignment.findMany({
        where: {
            workerId: user.id,
            date: {
                gte: dayStart,
                lte: dayEnd
            }
        },
        include: {
            job: {
                include: {
                    store: true
                }
            }
        }
    });

    console.log("Today's assignments:", JSON.stringify(assignments, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
