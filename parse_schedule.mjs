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

// Time range parsing helper
function parseTimeRange(timeStr) {
    if (!timeStr || timeStr === 'NS' || timeStr === 'S' || timeStr === 'S ') {
        return null;
    }
    timeStr = timeStr.toLowerCase().trim();
    const parts = timeStr.split('-');
    if (parts.length !== 2) return null;
    let startPart = parts[0].trim();
    let endPart = parts[1].trim();

    let isPm = false;
    let isAm = false;
    if (endPart.includes('pm') || endPart.includes('p')) {
        isPm = true;
        endPart = endPart.replace('pm', '').replace('p', '').trim();
    } else if (endPart.includes('am') || endPart.includes('a')) {
        isAm = true;
        endPart = endPart.replace('am', '').replace('a', '').trim();
    }

    let startPm = false;
    let startAm = false;
    if (startPart.includes('pm') || startPart.includes('p')) {
        startPm = true;
        startPart = startPart.replace('pm', '').replace('p', '').trim();
    } else if (startPart.includes('am') || startPart.includes('a')) {
        startAm = true;
        startPart = startPart.replace('am', '').replace('a', '').trim();
    }

    let endHour, endMin;
    if (endPart.includes(':')) {
        const t = endPart.split(':');
        endHour = parseInt(t[0]);
        endMin = parseInt(t[1]);
    } else {
        endHour = parseInt(endPart);
        endMin = 0;
    }

    let startHour, startMin;
    if (startPart.includes(':')) {
        const t = startPart.split(':');
        startHour = parseInt(t[0]);
        startMin = parseInt(t[1]);
    } else {
        startHour = parseInt(startPart);
        startMin = 0;
    }

    if (isPm && endHour < 12) {
        endHour += 12;
    }
    if (!isPm && !isAm) {
        if (endHour < 12) endHour += 12;
    }

    if (startPm && startHour < 12) {
        startHour += 12;
    }
    if (!startPm && !startAm) {
        if (startHour < 9 || (startHour < 12 && endHour >= 12 && startHour <= endHour - 12)) {
            startHour += 12;
        }
    }

    const pad = (num) => String(num).padStart(2, '0');
    return {
        start: `${pad(startHour)}:${pad(startMin)}`,
        end: `${pad(endHour)}:${pad(endMin)}`
    };
}

// Convert "LastName, FirstName" to "FirstName LastName"
function normalizeWorkerName(ftmName) {
    if (!ftmName) return null;
    ftmName = ftmName.trim().replace(/^"|"$/g, '');
    const parts = ftmName.split(',');
    if (parts.length === 2) {
        return `${parts[1].trim()} ${parts[0].trim()}`;
    }
    return ftmName;
}

// Parse CSV content
function parseCsv(content) {
    const lines = content.split('\n');
    const result = [];
    
    // Line 9 is header, index 10 starts first data row (index 11 in 1-based text)
    // Wait, let's look at content.md:
    // Line 10: Date,Day,Scheduled Time,Recap Time...
    const header = lines[9].split(',');
    
    for (let i = 10; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Simple CSV split (handles quotes for FTM name like "Stadler, Craig" and address "721 North Central Expressway, Ste. 200")
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
        
        if (row.length < 10) continue;
        result.push({
            date: row[0].trim(),
            scheduledTime: row[2].trim(),
            recapTime: row[3].trim(),
            hoursStr: row[4].trim(),
            payRateStr: row[5].trim(),
            ftmName: row[6].trim(),
            storeName: row[7].trim(),
            address: row[8].trim(),
            sold375: parseInt(row[13]) || 0,
            sold750: parseInt(row[14]) || 0,
            sold1L: parseInt(row[15]) || 0,
            sold175: parseInt(row[16]) || 0,
            sold750Flawless: parseInt(row[17]) || 0,
            sold175Flawless: parseInt(row[18]) || 0,
            totalBottlesSold: parseInt(row[19]) || 0,
            reimbursementStr: row[22].trim()
        });
    }
    return result;
}

async function main() {
    console.log("=== PARSING AND MAPPING SCHEDULE ===");
    
    const csvContent = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1811/content.md", "utf-8");
    const rows = parseCsv(csvContent);
    console.log(`Total rows parsed from CSV: ${rows.length}`);

    // Load active cache from database
    const dbUsers = await prisma.user.findMany({
        select: { id: true, name: true, email: true }
    });
    const dbStores = await prisma.store.findMany({
        select: { id: true, name: true, address: true }
    });

    const userMap = new Map();
    dbUsers.forEach(u => {
        // Store lowercase name, and normalized name
        userMap.set(u.name.toLowerCase().trim(), u);
        // Also map trimmed (e.g. Neha Kapadia has trailing space)
        userMap.set(u.name.replace(/\s+/g, ' ').trim().toLowerCase(), u);
    });

    const storeMap = new Map();
    dbStores.forEach(s => {
        storeMap.set(s.name.toLowerCase().trim(), s);
    });

    const mappedShifts = [];
    const missingWorkers = new Set();
    const missingStores = new Set();

    for (const row of rows) {
        const normalizedWorker = normalizeWorkerName(row.ftmName);
        const workerKey = normalizedWorker ? normalizedWorker.replace(/\s+/g, ' ').trim().toLowerCase() : null;
        
        let workerUser = null;
        if (workerKey) {
            workerUser = userMap.get(workerKey);
            if (!workerUser) {
                // Try fuzzy matching (e.g. contains name)
                const matched = dbUsers.find(u => {
                    const dbNameNorm = u.name.replace(/\s+/g, ' ').trim().toLowerCase();
                    return dbNameNorm.includes(workerKey) || workerKey.includes(dbNameNorm);
                });
                if (matched) {
                    workerUser = matched;
                } else {
                    missingWorkers.add(normalizedWorker);
                }
            }
        }

        const storeKey = row.storeName.replace(/\s+/g, ' ').trim().toLowerCase();
        let store = storeMap.get(storeKey);
        if (!store) {
            // Try fuzzy matching on name
            const matched = dbStores.find(s => {
                const dbStoreNorm = s.name.replace(/\s+/g, ' ').trim().toLowerCase();
                return dbStoreNorm.includes(storeKey) || storeKey.includes(dbStoreNorm);
            });
            if (matched) {
                store = matched;
            } else {
                missingStores.add(row.storeName);
            }
        }

        // Determine times
        // If Recap Time is set and not 'S' or empty, use Recap Time for shift times.
        // If Recap Time is 'S' or empty, use Scheduled Time.
        let timeStr = row.scheduledTime;
        let isCompleted = false;
        
        if (row.recapTime && row.recapTime !== 'S' && row.recapTime !== 'S ') {
            timeStr = row.recapTime;
            isCompleted = true;
        } else if (row.recapTime === 'S' || row.recapTime === 'S ') {
            isCompleted = true;
        }
        
        // If there is any sales or payment, it is completed
        if (row.totalBottlesSold > 0 || row.hoursStr && parseFloat(row.hoursStr) > 0) {
            isCompleted = true;
        }

        const times = parseTimeRange(timeStr);

        mappedShifts.push({
            dateStr: row.date,
            rawRow: row,
            normalizedWorker,
            workerUser,
            store,
            times,
            isCompleted
        });
    }

    console.log("\n--- Missing Workers in Database ---");
    console.log(Array.from(missingWorkers));

    console.log("\n--- Missing Stores in Database ---");
    console.log(Array.from(missingStores));

    console.log("\n--- Mapped Shifts Summary ---");
    let completedCount = 0;
    let scheduledCount = 0;
    let successfulMapCount = 0;

    mappedShifts.forEach(s => {
        if (s.isCompleted) completedCount++;
        else scheduledCount++;
        
        if (s.workerUser && s.store && s.times) {
            successfulMapCount++;
        }
    });

    console.log(`Total Completed Shifts: ${completedCount}`);
    console.log(`Total Scheduled-only Shifts: ${scheduledCount}`);
    console.log(`Successfully mapped (Worker + Store + Times resolved): ${successfulMapCount} / ${mappedShifts.length}`);

    // Print first 5 mapped shifts
    console.log("\n--- First 5 Mapped Shifts Details ---");
    console.log(JSON.stringify(mappedShifts.slice(0, 5), (key, value) => {
        if (key === 'rawRow') return undefined; // hide raw row for cleaner print
        return value;
    }, 2));
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
