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
    console.log("=== UPDATING PATRICIA COUSINS' CLOCK-IN TIME TO 11:00 AM CDT ===");

    // Find User
    const user = await prisma.user.findFirst({
        where: {
            name: {
                contains: "Patricia"
            }
        }
    });

    if (!user) {
        console.log("User Patricia not found");
        return;
    }

    const dayStart = new Date("2026-07-10T00:00:00.000Z");
    const dayEnd = new Date("2026-07-10T23:59:59.999Z");

    const assignment = await prisma.jobAssignment.findFirst({
        where: {
            workerId: user.id,
            date: {
                gte: dayStart,
                lte: dayEnd
            }
        }
    });

    if (!assignment) {
        console.log("No assignment found for Patricia Cousins today.");
        return;
    }

    console.log(`Found assignment: ${assignment.id}, current clockIn: ${assignment.clockIn}`);

    // Update clockIn to 11:00 AM CDT (16:00:00 UTC)
    const targetClockIn = new Date("2026-07-10T16:00:00.000Z");
    
    const updated = await prisma.jobAssignment.update({
        where: {
            id: assignment.id
        },
        data: {
            clockIn: targetClockIn
        }
    });

    console.log(`Successfully updated clock-in time to: ${updated.clockIn.toISOString()}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
