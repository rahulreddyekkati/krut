import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
});
const adapter = new PrismaLibSQL(client);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Find Hector Gonzalez
    const user = await prisma.user.findFirst({
        where: { name: { contains: "Hector Gonzalez" } }
    });

    if (!user) {
        console.error("❌ Hector Gonzalez not found.");
        return;
    }

    const dates = ["2026-07-16", "2026-07-17", "2026-07-18"];

    console.log(`Checking recap records for Hector Gonzalez on July 16, 17, and 18...\n`);

    for (const d of dates) {
        const startOfDay = new Date(d + "T00:00:00Z");
        const endOfDay = new Date(d + "T23:59:59.999Z");

        const assignment = await prisma.jobAssignment.findFirst({
            where: {
                workerId: user.id,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                job: { include: { store: true } },
                recap: {
                    include: {
                        skus: true
                    }
                }
            }
        });

        if (!assignment) {
            console.log(`Date: ${d} | No shift found for Hector Gonzalez.\n`);
            continue;
        }

        console.log(`Date: ${d} | Store: ${assignment.job.store.name}`);
        console.log(`Shift Status: ${assignment.status}`);
        
        if (assignment.recap) {
            const r = assignment.recap;
            console.log(`Recap Status: ${r.status}`);
            console.log(`Recap CreatedAt: ${r.createdAt}`);
            console.log(`Comments: "${r.comments || ""}"`);
            console.log(`Reimbursement: $${r.reimbursement || 0}`);
            console.log(`SKU Inventory/Sales Count: ${r.skus ? r.skus.length : 0} items`);
            for (const s of r.skus || []) {
                console.log(`  - SKU ID: ${s.skuId} | Bottles Sold: ${s.bottlesSold} | Samples Poured: ${s.samplesPoured}`);
            }
        } else {
            console.log(`Recap: NOT CREATED`);
        }
        console.log(`--------------------------------------------------\n`);
    }
}

main()
    .catch(e => console.error("Error:", e))
    .finally(() => prisma.$disconnect());
