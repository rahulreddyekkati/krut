import "./env-setup";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const prismaClientSingleton = () => {
    const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.ORIGINAL_DATABASE_URL;

    if (tursoUrl && (tursoUrl.startsWith("libsql://") || tursoUrl.startsWith("https://"))) {
        const libsql = createClient({
            url: tursoUrl,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
        const adapter = new PrismaLibSQL(libsql);
        return new PrismaClient({ adapter });
    }

    // Fallback to native SQLite for local dev
    return new PrismaClient();
};

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// Cache the singleton in every environment, not just non-production. In dev this avoids
// Next.js hot-reload spawning a fresh client (and libsql connection) per file save. In
// production/serverless, it's what makes a warm function instance actually reuse its one
// connection across invocations instead of accumulating fresh ones — the previous
// production-only exclusion meant this reference was never stored there, which likely
// contributed to Turso connection exhaustion under real traffic (every request hanging).
globalThis.prisma = prisma;
