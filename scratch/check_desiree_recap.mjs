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
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true, name: true } });
    const user = allUsers.find(u => u.name?.toLowerCase().includes("desiree") || u.email?.toLowerCase().includes("desiree"));
    console.log("User:", user);
    if (!user) return;

    const assignments = await prisma.jobAssignment.findMany({
        where: { workerId: user.id, clockOut: { not: null } },
        include: { recap: true, job: { include: { store: true } } },
        orderBy: { clockOut: "desc" },
        take: 5,
    });

    for (const a of assignments) {
        console.log({
            assignmentId: a.id,
            store: a.job?.store?.name,
            clockOut: a.clockOut,
            assignmentStatus: a.status,
            recapExists: !!a.recap,
            recapStatus: a.recap?.status,
        });
    }
}

main().catch(e => console.error("SCRIPT ERROR:", e)).finally(() => prisma.$disconnect());
