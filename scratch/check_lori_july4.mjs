import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./apps/web/.env") });

const prismaClientSingleton = () => {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    if (tursoUrl && (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://"))) {
        const libsql = createClient({ url: tursoUrl, authToken: process.env.TURSO_AUTH_TOKEN });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    }
    return new PrismaClient();
};

const prisma = prismaClientSingleton();

async function main() {
    const user = await prisma.user.findFirst({ where: { name: { contains: "Lori Dedes" } } });
    console.log("User:", user?.id, user?.name, user?.email);
    if (!user) return;

    const assignments = await prisma.jobAssignment.findMany({
        where: { workerId: user.id, date: { gte: new Date(2026,6,1), lte: new Date(2026,6,15,23,59,59) } },
        include: { job: true },
        orderBy: { date: "asc" },
    });
    for (const a of assignments) {
        console.log({
            assignmentId: a.id,
            jobId: a.jobId,
            jobTitle: a.job?.title,
            date: a.date,
            isRecurring: a.isRecurring,
            dayOfWeek: a.dayOfWeek,
            status: a.status,
            clockIn: a.clockIn,
            clockOut: a.clockOut,
            createdAt: a.createdAt,
        });
    }
}
main().catch(e => console.error("ERR:", e)).finally(() => prisma.$disconnect());
