import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- DB INSPECTION: RECENT RECAPS ---");
    
    const recaps = await libsql.execute(`
        SELECT r.id, r.status, r.rushLevel, r.consumersSampled, r.receiptTotal, r.reimbursement, r.createdAt,
               a.date as assignment_date, a.workerId, u.name as worker_name
        FROM Recap r
        JOIN JobAssignment a ON r.assignmentId = a.id
        JOIN User u ON a.workerId = u.id
        ORDER BY r.createdAt DESC
        LIMIT 5
    `);

    console.table(recaps.rows.map(row => ({
        id: row.id,
        status: row.status,
        rush: row.rushLevel,
        sampled: row.consumersSampled,
        receipt: row.receiptTotal,
        reimb: row.reimbursement,
        created: row.createdAt,
        shift_date: row.assignment_date,
        worker: row.worker_name
    })));

    console.log("\n--- DB INSPECTION: PENDING ASSIGNMENTS (INCOMPLETE) ---");
    const incomplete = await libsql.execute(`
        SELECT a.id, a.date, a.status, u.name as worker_name
        FROM JobAssignment a
        JOIN User u ON a.workerId = u.id
        LEFT JOIN Recap r ON a.id = r.assignmentId
        WHERE a.status = 'RECAP_PENDING' AND r.id IS NULL
        LIMIT 5
    `);
    
    console.table(incomplete.rows.map(row => ({
        id: row.id,
        date: row.date,
        status: row.status,
        worker: row.worker_name
    })));
}

run().catch(console.error).finally(() => process.exit(0));
