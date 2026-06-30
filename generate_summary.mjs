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
        
        if (row.length < 10) continue;
        result.push({
            date: row[0].trim(),
            scheduledTime: row[2].trim(),
            recapTime: row[3].trim(),
            hoursStr: row[4].trim(),
            payRateStr: row[5].trim(),
            ftmName: row[6].trim(),
            storeName: row[7].trim(),
            sold375: parseInt(row[13]) || 0,
            sold750: parseInt(row[14]) || 0,
            sold1L: parseInt(row[15]) || 0,
            sold175: parseInt(row[16]) || 0,
            sold750Flawless: parseInt(row[17]) || 0,
            sold175Flawless: parseInt(row[18]) || 0,
            totalBottlesSold: parseInt(row[19]) || 0,
            reimbursementStr: row[22].trim(),
            paidStr: row[21].trim()
        });
    }
    return result;
}

function main() {
    const csvContent = fs.readFileSync("/Users/rahulreddyekkati/.gemini/antigravity/brain/5a34422a-6048-43b3-a1a5-074f343d3336/.system_generated/steps/1811/content.md", "utf-8");
    const rows = parseCsv(csvContent);

    // Group by worker
    const workers = {};
    rows.forEach(r => {
        const name = normalizeWorkerName(r.ftmName) || "Unknown Worker";
        if (!workers[name]) {
            workers[name] = {
                name,
                shiftsCount: 0,
                totalHours: 0,
                totalBottles: 0,
                totalReimbursement: 0,
                totalPaid: 0,
                stores: new Set(),
                dates: []
            };
        }
        
        const w = workers[name];
        w.shiftsCount++;
        
        const hrs = parseFloat(r.hoursStr) || 0;
        w.totalHours += hrs;
        
        w.totalBottles += r.totalBottlesSold;
        
        const reimb = parseFloat(r.reimbursementStr.replace(/[^0-9.]/g, '')) || 0;
        w.totalReimbursement += reimb;

        const paid = parseFloat(r.paidStr.replace(/[^0-9.]/g, '')) || 0;
        w.totalPaid += paid;

        w.stores.add(r.storeName.trim());
        w.dates.push(r.date);
    });

    console.log("=== SHIFT SUMMARY GROUPED BY WORKER ===");
    console.log(String("Worker Name").padEnd(25) + " | " + 
                String("Shifts").padEnd(6) + " | " + 
                String("Hours").padEnd(6) + " | " + 
                String("Bottles").padEnd(8) + " | " + 
                String("Paid").padEnd(10) + " | " + 
                String("Reimburse").padEnd(10));
    console.log("-".repeat(75));
    
    Object.values(workers).sort((a,b) => b.shiftsCount - a.shiftsCount).forEach(w => {
        console.log(w.name.padEnd(25) + " | " + 
                    String(w.shiftsCount).padEnd(6) + " | " + 
                    w.totalHours.toFixed(1).padEnd(6) + " | " + 
                    String(w.totalBottles).padEnd(8) + " | " + 
                    `$${w.totalPaid.toFixed(2)}`.padEnd(10) + " | " + 
                    `$${w.totalReimbursement.toFixed(2)}`.padEnd(10));
    });
}

main();
