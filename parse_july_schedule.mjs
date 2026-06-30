import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

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

function normalizeWorkerName(ftmName) {
    if (!ftmName) return null;
    ftmName = ftmName.trim().replace(/^"|"$/g, '');
    const parts = ftmName.split(',');
    if (parts.length === 2) {
        return `${parts[1].trim()} ${parts[0].trim()}`;
    }
    return ftmName;
}

function parseCsv(content) {
    const lines = content.split('\n');
    const result = [];
    
    for (let i = 10; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const row = [];
        let inQuotes = false;
        let currentField = '';
        
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                row.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        row.push(currentField);
        
        if (!row[0] || !row[0].includes('/')) continue;
        
        result.push({
            date: row[0].trim(),
            scheduledTime: row[2].trim(),
            hoursStr: row[4].trim(),
            payRateStr: row[5].trim(),
            brandAmbassador: row[6].trim(),
            storeName: row[7].trim(),
            address: row[8].trim()
        });
    }
    return result;
}

async function main() {
    const csvContent = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1874/content.md", "utf-8");
    const rows = parseCsv(csvContent);

    const dbUsers = await prisma.user.findMany({ select: { name: true } });
    const dbStores = await prisma.store.findMany({ select: { name: true } });

    const userNames = new Set(dbUsers.map(u => u.name.replace(/\s+/g, ' ').trim().toLowerCase()));
    const storeNames = new Set(dbStores.map(s => s.name.replace(/\s+/g, ' ').trim().toLowerCase()));

    const shifts = [];
    
    rows.forEach(r => {
        const normalizedWorker = normalizeWorkerName(r.brandAmbassador);
        const storeClean = r.storeName.replace('(Costco)', '').trim();
        
        const workerFound = normalizedWorker ? userNames.has(normalizedWorker.replace(/\s+/g, ' ').trim().toLowerCase()) : false;
        
        // Match store names
        let storeFound = storeNames.has(r.storeName.replace(/\s+/g, ' ').trim().toLowerCase());
        if (!storeFound) {
            // Try matching without Costco
            storeFound = storeNames.has(storeClean.toLowerCase());
        }

        shifts.push({
            date: r.date,
            time: r.scheduledTime,
            hours: parseFloat(r.hoursStr) || 0,
            rate: r.payRateStr ? parseFloat(r.payRateStr.replace(/[^0-9.]/g, '')) : null,
            worker: normalizedWorker,
            workerFound,
            store: r.storeName,
            storeClean,
            storeFound
        });
    });

    console.log("=== JULY SHIFTS OVERVIEW ===");
    console.log(`Total Shifts parsed: ${shifts.length}`);
    
    // Group shifts by worker
    const workerGroups = {};
    const openShifts = [];
    
    shifts.forEach(s => {
        if (!s.worker) {
            openShifts.push(s);
        } else {
            if (!workerGroups[s.worker]) {
                workerGroups[s.worker] = [];
            }
            workerGroups[s.worker].push(s);
        }
    });

    console.log("\n--- Open Shifts (No worker assigned yet) ---");
    console.log(`Total: ${openShifts.length}`);
    openShifts.forEach(s => {
        console.log(`- Date: ${s.date} | Store: ${s.store} | Time: ${s.time} | Hours: ${s.hours}`);
    });

    for (const [name, list] of Object.entries(workerGroups)) {
        const workerFound = list[0].workerFound;
        console.log(`\n--- Worker: ${name} (${workerFound ? "Active in DB" : "⚠️ NOT in DB - Will auto-create"}) ---`);
        console.log(`Total shifts: ${list.length}`);
        list.forEach(s => {
            console.log(`- Date: ${s.date} | Store: ${s.store} | Time: ${s.time} | Hours: ${s.hours} | Rate: $${s.rate || "N/A"}`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
