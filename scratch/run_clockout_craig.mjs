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
    console.log("=== CLOCKING OUT CRAIG STADLER FOR JULY 9, 2026 ===");

    // Find User
    const user = await prisma.user.findFirst({
        where: {
            name: {
                contains: "Craig"
            }
        }
    });

    if (!user) {
        console.log("User Craig Stadler not found");
        return;
    }

    const assignment = await prisma.jobAssignment.findFirst({
        where: {
            workerId: user.id,
            date: {
                gte: new Date("2026-07-09T00:00:00.000Z"),
                lte: new Date("2026-07-09T23:59:59.999Z")
            }
        },
        include: {
            breaks: true
        }
    });

    if (!assignment) {
        console.log("No assignment found for Craig Stadler on July 9, 2026.");
        return;
    }

    console.log("Found Assignment:", assignment.id);
    console.log("Clock In:", assignment.clockIn);

    // End time is 20:00 Central time (8:00 PM CDT) on July 9 = 2026-07-10T01:00:00.000Z
    const clockOutTime = new Date("2026-07-10T01:00:00.000Z");
    
    // Close open breaks if any
    let extraBreakMins = 0;
    for (const br of assignment.breaks) {
        if (!br.endTime) {
            const mins = (clockOutTime.getTime() - new Date(br.startTime).getTime()) / 60000;
            await prisma.break.update({
                where: { id: br.id },
                data: { endTime: clockOutTime, durationMins: Math.max(0, mins) }
            });
            extraBreakMins += Math.max(0, mins);
        }
    }

    const currentBreakMins = (assignment.breakTimeMinutes ?? 0) + extraBreakMins;
    const grossMins = (clockOutTime.getTime() - new Date(assignment.clockIn).getTime()) / 60000;
    const workedHours = parseFloat(Math.max(0, (grossMins - currentBreakMins) / 60).toFixed(2));

    const updated = await prisma.jobAssignment.update({
        where: { id: assignment.id },
        data: {
            clockOut: clockOutTime,
            breakTimeMinutes: currentBreakMins,
            workedHours,
            status: "RECAP_PENDING"
        }
    });

    // Update job status to RECAP_PENDING
    await prisma.job.update({
        where: { id: assignment.jobId },
        data: { status: "RECAP_PENDING" }
    });

    console.log("Updated Assignment status:", updated.status);
    console.log("Clock Out Time:", updated.clockOut.toISOString());
    console.log("Worked Hours:", updated.workedHours);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
