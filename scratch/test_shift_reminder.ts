import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import { localTimeToUTC, toUTCLocalDateStr, getMarketTimezone } from "../apps/web/src/lib/timezone.ts";
import { to12hr } from "../apps/web/src/lib/timeFormat.ts";

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
    console.log("=== DRY RUN OF SHIFT REMINDER CRON LOGIC WITH MARKET TIMEZONES ===");

    const now = new Date();
    console.log("Current UTC Time:", now.toISOString());

    const minDiffMs = 1.75 * 60 * 60 * 1000; // 1hr 45m
    const maxDiffMs = 2.25 * 60 * 60 * 1000; // 2hr 15m

    const assignments = await prisma.jobAssignment.findMany({
        where: {
            status: "ASSIGNED",
            date: { not: null }
        },
        include: {
            worker: true,
            job: {
                include: {
                    store: true,
                    market: true
                }
            }
        }
    });

    console.log(`Checking ${assignments.length} ASSIGNED assignments...`);

    let matchCount = 0;

    for (const a of assignments) {
        const dateStr = toUTCLocalDateStr(new Date(a.date));
        const startTimeStr = a.customStartTimeStr ?? a.job.startTimeStr;
        const marketName = a.job.market?.name || "";
        const storeAddress = a.job.store?.address || "";
        const tz = getMarketTimezone(marketName, storeAddress);
        const shiftStart = localTimeToUTC(dateStr, startTimeStr, tz);
        
        const diffMs = shiftStart.getTime() - now.getTime();
        const diffHrs = diffMs / (60 * 60 * 1000);

        console.log(`Worker: ${a.worker.name.padEnd(20)} | Market: ${marketName.padEnd(12)} | TZ: ${tz.padEnd(20)} | Shift: ${dateStr} ${startTimeStr} | Hours Until Start: ${diffHrs.toFixed(2)}h`);

        if (diffMs >= minDiffMs && diffMs <= maxDiffMs) {
            console.log(`  🎯 MATCH! Sending reminder for this shift!`);
            matchCount++;
        }
    }

    console.log(`\nDry run completed. Matches found: ${matchCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
