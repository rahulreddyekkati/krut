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
    console.log("=== SEARCHING FOR JESSE ROJANO ===");
    const users = await prisma.user.findMany({
        where: {
            name: {
                contains: "Jesse",
            }
        }
    });
    console.log("Found users matching 'Jesse':", JSON.stringify(users, null, 2));

    if (users.length === 0) {
        console.log("No Jesse found!");
        return;
    }

    const jesseId = users[0].id;
    console.log(`Jesse ID: ${jesseId}. Fetching assignments...`);

    const assignments = await prisma.jobAssignment.findMany({
        where: {
            workerId: jesseId
        },
        include: {
            job: {
                include: {
                    store: true
                }
            }
        }
    });

    console.log("Jesse's Assignments:");
    console.log(JSON.stringify(assignments, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
