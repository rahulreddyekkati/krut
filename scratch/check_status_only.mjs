import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load env variables
dotenv.config({ path: path.resolve("./.env") });

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

// CSV Line Parser
function parseCSVLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

async function main() {
    console.log("=== CHECKING REGISTRATION STATUS ===");
    
    // Load CSV file
    const csvPath = "/Users/rahulreddyekkati/.gemini/antigravity/brain/36ef856f-f3ec-45fe-ad44-a25e3571e651/.system_generated/steps/232/content.md";
    const content = fs.readFileSync(csvPath, "utf-8");
    const lines = content.split("\n");
    
    let csvLines = [];
    let startCsv = false;
    for (const line of lines) {
        if (startCsv) {
            if (line.trim()) {
                csvLines.push(line.trim());
            }
        } else if (line.trim() === '---') {
            startCsv = true;
        }
    }
    
    const dataRows = csvLines.slice(1);
    
    const acceptedList = [];
    const pendingList = [];
    const skippedList = [];
    
    for (const rowText of dataRows) {
        const row = parseCSVLine(rowText);
        if (row.length < 4) continue;
        
        const firstName = row[0];
        const lastName = row[1];
        const emailField = row[2];
        const name = `${firstName} ${lastName}`;
        
        if (!emailField || emailField.toUpperCase() === 'N/A') {
            skippedList.push({ name, reason: "Missing/Invalid Email" });
            continue;
        }
        
        const emails = emailField.split(',').map(e => e.trim());
        
        for (const email of emails) {
            // Check if user already exists
            const user = await prisma.user.findUnique({
                where: { email }
            });
            
            if (user) {
                acceptedList.push({ name, email, status: user.status, role: user.role });
            } else {
                pendingList.push({ name, email });
            }
        }
    }
    
    console.log("\n=== STATUS CHECK REPORT ===");
    console.log(`Accepted (Registered Users): ${acceptedList.length}`);
    console.log(`Pending (Not Yet Registered): ${pendingList.length}`);
    console.log(`Skipped: ${skippedList.length}`);
    
    if (acceptedList.length > 0) {
        console.log("\n=== REGISTERED USERS ===");
        acceptedList.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [Role: ${u.role}, Status: ${u.status}]`);
        });
    }
    
    if (pendingList.length > 0) {
        console.log("\n=== PENDING USERS ===");
        pendingList.forEach(p => {
            console.log(`- ${p.name} (${p.email})`);
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
