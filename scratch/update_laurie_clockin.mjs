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
    console.log("=== UPDATING LAURIE'S CLOCK-IN FOR TODAY ===");

    // Find User
    const user = await prisma.user.findFirst({
        where: {
            email: {
                contains: "donovanlaurie77@gmail.com",
                //mode: "insensitive"
            }
        }
    });

    if (!user) {
        console.log("User donovanlaurie77@gmail.com not found");
        return;
    }

    console.log(`Found user: ${user.name} (${user.id})`);

    const dayStart = new Date("2026-07-09T00:00:00.000Z");
    const dayEnd = new Date("2026-07-09T23:59:59.999Z");

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
        console.log("No assignment found for Laurie today.");
        return;
    }

    console.log(`Found assignment: ${assignment.id}, current clockIn: ${assignment.clockIn}, current status: ${assignment.status}`);

    // Update clockIn to 4:00 PM CDT (21:00:00 UTC), status to IN_PROGRESS
    const targetClockIn = new Date("2026-07-09T21:00:00.000Z");
    
    const updated = await prisma.jobAssignment.update({
        where: {
            id: assignment.id
        },
        data: {
            clockIn: targetClockIn,
            status: "IN_PROGRESS"
        }
    });

    console.log(`Successfully updated assignment!`);
    console.log(`New clockIn: ${updated.clockIn.toISOString()}`);
    console.log(`New status: ${updated.status}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
