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
        });
    }
    return result;
}

function main() {
    const juneCsv = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1906/content.md", "utf-8");
    const julyCsv = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1874/content.md", "utf-8");

    const juneRows = parseCsv(juneCsv);
    const julyRows = parseCsv(julyCsv);

    // Group June shifts by store + day to find standard time
    const patterns = {
        "total wine 506 | wednesday": "3:00 PM - 7:00 PM",
        "total wine 506 | thursday": "1:00 PM - 7:00 PM",
        "total wine 506 | friday": "12:00 PM - 7:00 PM",
        "total wine 506 | saturday": "11:00 AM - 6:00 PM",
        "wb liquors 30 (costco) | thursday": "12:00 PM - 5:00 PM", // with user's explicit correction
        "wb liquors 30 (costco) | friday": "12:00 PM - 6:00 PM",
        "wb liquors 29 (costco) | thursday": "1:00 PM - 6:00 PM",
        "wb liquors 29 (costco) | friday": "12:00 PM - 6:00 PM",
        "wb liquors 29 (costco) | saturday": "2:00 PM - 7:00 PM"
    };

    console.log("### Option 1: Overridden using June Recurring Schedule (Store + Day of Week + Timings)");
    console.log("| Date | Day | Store | Worker | Timing (June Pattern) |");
    console.log("|---|---|---|---|---|");
    julyRows.forEach(r => {
        const storeKey = r.storeName.replace(/\s+/g, ' ').trim().toLowerCase();
        const dayKey = r.dayOfWeek.trim().toLowerCase();
        const key = `${storeKey} | ${dayKey}`;
        const timing = patterns[key] || r.scheduledTime;
        const worker = normalizeWorkerName(r.brandAmbassador) || "Open";
        console.log(`| ${r.date} | ${r.dayOfWeek} | ${r.storeName} | ${worker} | ${timing} |`);
    });
}

main();
