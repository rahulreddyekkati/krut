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
            dayOfWeek: row[1].trim(),
            scheduledTime: row[2].trim(),
            recapTime: row[3].trim(),
            hoursStr: row[4].trim(),
            payRateStr: row[5].trim(),
            brandAmbassador: row[6].trim(),
            storeName: row[7].trim(),
            sold375: parseInt(row[13]) || 0,
            sold750: parseInt(row[14]) || 0,
            sold1L: parseInt(row[15]) || 0,
            sold175: parseInt(row[16]) || 0,
            sold750Flawless: parseInt(row[17]) || 0,
            sold175Flawless: parseInt(row[18]) || 0,
            soldMulukBlanco750: parseInt(row[19]) || 0,
            soldMulukReposado750: parseInt(row[20]) || 0,
            soldMulukDiamanteBlanco750: parseInt(row[21]) || 0,
            soldMulukDiamanteReposado750: parseInt(row[22]) || 0,
            soldMulukDiamanteAnejo750: parseInt(row[23]) || 0,
            totalBottlesSold: parseInt(row[26]) || 0,
            paidStr: row[28].trim(),
            reimbursementStr: row[29].trim()
        });
    }
    return result;
}

async function main() {
    console.log("=== PARSING JUNE 2026 TAB ===");
    
    const csvContent = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1906/content.md", "utf-8");
    const rows = parseCsv(csvContent);
    console.log(`Total June rows parsed: ${rows.length}`);

    // Load active cache from database
    const dbUsers = await prisma.user.findMany({ select: { name: true } });
    const dbStores = await prisma.store.findMany({ select: { name: true } });

    const userNames = new Set(dbUsers.map(u => u.name.replace(/\s+/g, ' ').trim().toLowerCase()));
    const storeNames = new Set(dbStores.map(s => s.name.replace(/\s+/g, ' ').trim().toLowerCase()));

    const shifts = [];
    const missingWorkers = new Set();
    const missingStores = new Set();

    rows.forEach(r => {
        const normalizedWorker = normalizeWorkerName(r.brandAmbassador);
        const storeClean = r.storeName.replace('(Costco)', '').trim();
        
        const workerFound = normalizedWorker ? userNames.has(normalizedWorker.replace(/\s+/g, ' ').trim().toLowerCase()) : false;
        
        let storeFound = storeNames.has(r.storeName.replace(/\s+/g, ' ').trim().toLowerCase());
        if (!storeFound) {
            storeFound = storeNames.has(storeClean.toLowerCase());
        }

        if (normalizedWorker && !workerFound) {
            missingWorkers.add(normalizedWorker);
        }
        if (!storeFound) {
            missingStores.add(r.storeName);
        }

        let timeStr = r.scheduledTime;
        if (r.recapTime && r.recapTime !== 'S' && r.recapTime !== 'S ') {
            timeStr = r.recapTime;
        }
        const times = parseTimeRange(timeStr);

        shifts.push({
            date: r.date,
            dayOfWeek: r.dayOfWeek,
            timeStr,
            times,
            hours: parseFloat(r.hoursStr) || 0,
            rate: r.payRateStr ? parseFloat(r.payRateStr.replace(/[^0-9.]/g, '')) : null,
            worker: normalizedWorker,
            workerFound,
            store: r.storeName,
            storeFound,
            totalBottlesSold: r.totalBottlesSold,
            paid: r.paidStr ? parseFloat(r.paidStr.replace(/[^0-9.]/g, '')) : 0,
            reimbursement: r.reimbursementStr ? parseFloat(r.reimbursementStr.replace(/[^0-9.]/g, '')) : 0
        });
    });

    console.log("\n--- Store Status in DB ---");
    console.log(`Missing Stores: ${Array.from(missingStores).length}`);
    console.log(Array.from(missingStores));

    console.log("\n--- Worker Status in DB ---");
    console.log(`Missing Workers: ${Array.from(missingWorkers).length}`);
    console.log(Array.from(missingWorkers));

    // Group June shifts by worker
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

    console.log(`\nTotal Open Shifts in June: ${openShifts.length}`);
    
    const workerSummary = [];
    for (const [name, list] of Object.entries(workerGroups)) {
        const workerFound = list[0].workerFound;
        let totalHours = 0;
        let totalBottles = 0;
        let totalPaid = 0;
        let totalReimb = 0;
        
        list.forEach(s => {
            totalHours += s.hours;
            totalBottles += s.totalBottlesSold;
            totalPaid += s.paid;
            totalReimb += s.reimbursement;
        });

        workerSummary.push({
            name,
            workerFound,
            shiftsCount: list.length,
            totalHours,
            totalBottles,
            totalPaid,
            totalReimb
        });
    }

    console.log("\n--- June Worker Summary Table ---");
    console.log(String("Worker Name").padEnd(25) + " | " + 
                String("Status").padEnd(12) + " | " + 
                String("Shifts").padEnd(6) + " | " + 
                String("Hours").padEnd(6) + " | " + 
                String("Bottles").padEnd(8) + " | " + 
                String("Paid").padEnd(10) + " | " + 
                String("Reimburse").padEnd(10));
    console.log("-".repeat(95));
    workerSummary.sort((a,b) => b.shiftsCount - a.shiftsCount).forEach(w => {
        console.log(w.name.padEnd(25) + " | " + 
                    (w.workerFound ? "Active" : "⚠️ Missing").padEnd(12) + " | " + 
                    String(w.shiftsCount).padEnd(6) + " | " + 
                    w.totalHours.toFixed(1).padEnd(6) + " | " + 
                    String(w.totalBottles).padEnd(8) + " | " + 
                    `$${w.totalPaid.toFixed(2)}`.padEnd(10) + " | " + 
                    `$${w.totalReimb.toFixed(2)}`.padEnd(10));
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
