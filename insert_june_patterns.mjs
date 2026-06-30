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

// Helper to convert time from "2:00PM" to "14:00"
function convertTo24Hour(timeStr) {
    timeStr = timeStr.trim().toUpperCase();
    const isPM = timeStr.includes("PM");
    const isAM = timeStr.includes("AM");
    let cleanTime = timeStr.replace("PM", "").replace("AM", "").trim();
    
    let hour = 0;
    let min = 0;
    if (cleanTime.includes(":")) {
        const parts = cleanTime.split(":");
        hour = parseInt(parts[0], 10);
        min = parseInt(parts[1], 10);
    } else {
        hour = parseInt(cleanTime, 10);
    }
    
    if (isPM && hour !== 12) {
        hour += 12;
    }
    if (isAM && hour === 12) {
        hour = 0;
    }
    
    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

const shiftsData = [
    { store: "TOTAL WINE 501", day: "WED", time: "2:00PM-6:00PM" },
    { store: "TOTAL WINE 501", day: "THU", time: "1:00PM-7:00PM" },
    { store: "TOTAL WINE 501", day: "FRI", time: "12:00PM-7:00PM" },
    { store: "TOTAL WINE 501", day: "SAT", time: "11:00AM-6:00PM" },

    { store: "TOTAL WINE 502", day: "WED", time: "3:00PM-7:00PM" },
    { store: "TOTAL WINE 502", day: "THU", time: "3:00PM-8:00PM" },
    { store: "TOTAL WINE 502", day: "FRI", time: "1:00PM-7:00PM" },
    { store: "TOTAL WINE 502", day: "SAT", time: "11:00AM-6:00PM" },

    { store: "TOTAL WINE 505", day: "THU", time: "2:00PM-8:00PM" },
    { store: "TOTAL WINE 505", day: "FRI", time: "12:00PM-3:00PM" },
    { store: "TOTAL WINE 505", day: "SAT", time: "11:00AM-5:00PM" },

    { store: "TOTAL WINE 506", day: "WED", time: "3:00PM-7:00PM" },
    { store: "TOTAL WINE 506", day: "THU", time: "1:00PM-7:00PM" },
    { store: "TOTAL WINE 506", day: "FRI", time: "12:00PM-7:00PM" },
    { store: "TOTAL WINE 506", day: "SAT", time: "11:00AM-6:00PM" },

    { store: "TOTAL WINE 507", day: "WED", time: "4:00PM-7:00PM" },
    { store: "TOTAL WINE 507", day: "THU", time: "4:30PM-8:30PM" },
    { store: "TOTAL WINE 507", day: "FRI", time: "2:30PM-8:15PM" },
    { store: "TOTAL WINE 507", day: "SAT", time: "11:00AM-6:00PM" },

    { store: "TOTAL WINE 508", day: "THU", time: "3:00PM-8:00PM" },
    { store: "TOTAL WINE 508", day: "FRI", time: "1:00PM-8:00PM" },
    { store: "TOTAL WINE 508", day: "SAT", time: "11:00AM-5:00PM" },

    { store: "TOTAL WINE 511", day: "THU", time: "4:00PM-7:00PM" },
    { store: "TOTAL WINE 511", day: "FRI", time: "1:00PM-7:00PM" },
    { store: "TOTAL WINE 511", day: "SAT", time: "11:00AM-5:00PM" },

    { store: "TOTAL WINE 513", day: "THU", time: "3:00PM-7:00PM" },
    { store: "TOTAL WINE 513", day: "FRI", time: "3:00PM-8:00PM" },
    { store: "TOTAL WINE 513", day: "SAT", time: "11:00AM-6:00PM" },

    { store: "TOTAL WINE 521", day: "WED", time: "3:00PM-7:30PM" },
    { store: "TOTAL WINE 521", day: "THU", time: "2:30PM-8:00PM" },
    { store: "TOTAL WINE 521", day: "FRI", time: "2:00PM-8:00PM" },
    { store: "TOTAL WINE 521", day: "SAT", time: "11:45AM-7:15PM" },

    { store: "TOTAL WINE 523", day: "WED", time: "3:00PM-7:00PM" },
    { store: "TOTAL WINE 523", day: "THU", time: "3:00PM-8:00PM" },
    { store: "TOTAL WINE 523", day: "FRI", time: "1:00PM-8:00PM" },
    { store: "TOTAL WINE 523", day: "SAT", time: "11:00AM-5:00PM" },

    { store: "TOTAL WINE 528", day: "WED", time: "3:00PM-7:00PM" },
    { store: "TOTAL WINE 528", day: "THU", time: "1:00PM-7:00PM" },
    { store: "TOTAL WINE 528", day: "FRI", time: "12:00PM-7:00PM" },
    { store: "TOTAL WINE 528", day: "SAT", time: "11:00AM-6:00PM" },

    { store: "TOTAL WINE 531", day: "FRI", time: "1:00PM-7:00PM" },

    { store: "TOTAL WINE 534", day: "WED", time: "3:00PM-7:00PM" },
    { store: "TOTAL WINE 534", day: "THU", time: "3:00PM-8:00PM" },
    { store: "TOTAL WINE 534", day: "FRI", time: "1:00PM-8:00PM" },
    { store: "TOTAL WINE 534", day: "SAT", time: "11:00AM-6:00PM" },

    { store: "TOTAL WINE 535", day: "THU", time: "1:00PM-7:00PM" },
    { store: "TOTAL WINE 535", day: "FRI", time: "1:00PM-8:00PM" },
    { store: "TOTAL WINE 535", day: "SAT", time: "11:00AM-5:00PM" }
];

async function main() {
    console.log("=== STARTING SHIFT IMPORT ===");
    
    // 1. Get Dallas,Tx Market
    const market = await prisma.market.findFirst({
        where: {
            name: {
                equals: "Dallas,Tx"
            }
        }
    });
    
    if (!market) {
        throw new Error("Market 'Dallas,Tx' not found in database!");
    }
    console.log(`Found Market: ${market.name} (ID: ${market.id})`);

    // 2. Get Creator User (Prefer active admin/market manager)
    let creator = await prisma.user.findFirst({
        where: { id: "cmncjhl1e0002sbeivher6cpm" }
    });
    
    if (!creator) {
        creator = await prisma.user.findFirst({
            where: {
                role: { in: ["ADMIN", "MARKET_MANAGER"] }
            }
        });
    }

    if (!creator) {
        throw new Error("No admin or market manager found to assign as creator!");
    }
    console.log(`Using Creator User: ${creator.name} (${creator.email})`);

    // 3. Fetch all stores in Dallas market to do case-insensitive matching
    const stores = await prisma.store.findMany({
        where: { marketId: market.id }
    });
    console.log(`Fetched ${stores.length} stores from database for matching.`);

    // 4. Process each shift
    for (const shift of shiftsData) {
        // Find Store (case-insensitive match in memory)
        const dbStore = stores.find(s => s.name.trim().toLowerCase() === shift.store.trim().toLowerCase());

        if (!dbStore) {
            console.error(`❌ Store NOT FOUND in database: "${shift.store}" in Dallas market. Skipping.`);
            continue;
        }

        // Job Name format e.g. "TOTAL WINE 501 WED"
        const jobName = `${shift.store} ${shift.day}`;

        // Parse start and end times from time range e.g. "2:00PM-6:00PM"
        const timeParts = shift.time.split("-");
        const startTimeStr = convertTo24Hour(timeParts[0]);
        const endTimeStr = convertTo24Hour(timeParts[1]);

        // Check if shift already exists by title
        const existingJob = await prisma.job.findUnique({
            where: {
                title: jobName
            }
        });

        if (existingJob) {
            console.log(`⚠️ Shift already exists: "${jobName}" (${existingJob.startTimeStr} - ${existingJob.endTimeStr}). Skipping.`);
            continue;
        }

        // Create the job record in the database
        const newJob = await prisma.job.create({
            data: {
                title: jobName,
                startTimeStr,
                endTimeStr,
                date: null, // recurring/template
                bonus: 0,
                status: "OPEN",
                storeId: dbStore.id,
                marketId: market.id,
                creatorId: creator.id
            }
        });

        console.log(`✅ Created Job: "${newJob.title}" | Time: ${newJob.startTimeStr} - ${newJob.endTimeStr} | Store ID: ${newJob.storeId}`);
    }

    console.log("=== SHIFT IMPORT COMPLETED SUCCESSFULLY ===");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
