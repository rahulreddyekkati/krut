import fs from "fs";

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
            brandAmbassador: row[6].trim(),
            storeName: row[7].trim(),
            payRateStr: row[5].trim(),
        });
    }
    return result;
}

function main() {
    const csvContent = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1906/content.md", "utf-8");
    const rows = parseCsv(csvContent);

    // Group shifts by store and day of week
    const patterns = {};
    rows.forEach(r => {
        const store = r.storeName.trim();
        const day = r.dayOfWeek.trim();
        const time = r.scheduledTime.trim();
        const worker = normalizeWorkerName(r.brandAmbassador);
        
        const key = `${store} | ${day}`;
        if (!patterns[key]) {
            patterns[key] = {
                store,
                day,
                timeOccurrences: {},
                workerOccurrences: {}
            };
        }
        
        const p = patterns[key];
        p.timeOccurrences[time] = (p.timeOccurrences[time] || 0) + 1;
        if (worker) {
            p.workerOccurrences[worker] = (p.workerOccurrences[worker] || 0) + 1;
        } else {
            p.workerOccurrences["Open"] = (p.workerOccurrences["Open"] || 0) + 1;
        }
    });

    console.log("=== JUNE RECURRING SHIFT PATTERNS ===");
    Object.values(patterns).sort((a,b) => a.store.localeCompare(b.store) || a.day.localeCompare(b.day)).forEach(p => {
        // Find most frequent time and worker
        const topTime = Object.entries(p.timeOccurrences).sort((x,y) => y[1] - x[1])[0];
        const topWorker = Object.entries(p.workerOccurrences).sort((x,y) => y[1] - x[1])[0];
        
        console.log(`${p.store.padEnd(25)} | ${p.day.padEnd(10)} | Time: ${topTime[0]} (${topTime[1]}x) | Worker: ${topWorker ? topWorker[0] : 'None'} (${topWorker ? topWorker[1] : 0}x)`);
    });
}

main();
