import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- CLEANING UP WORKER TWO ASSIGNMENTS ---");
    
    // We will delete all 'Specific' (non-recurring) assignments created in the last 24 hours for Worker Two
    // to let them start fresh from the template.
    const result = await libsql.execute(`
        DELETE FROM JobAssignment 
        WHERE workerId = (SELECT id FROM User WHERE name = 'Worker Two')
        AND isRecurring = 0
        AND (date >= '2026-04-22' OR createdAt >= '2026-04-22')
    `);

    console.log(`✅ Deleted ${result.rowsAffected} accidental records.`);
    
    // Ensure recurring assignments are clean
    await libsql.execute(`
        UPDATE JobAssignment 
        SET clockIn = NULL, clockOut = NULL, workedHours = NULL, status = 'ASSIGNED'
        WHERE workerId = (SELECT id FROM User WHERE name = 'Worker Two')
        AND isRecurring = 1
    `);
    console.log("✅ Reset all recurring templates to 'ASSIGNED'.");
}

run().catch(console.error).finally(() => process.exit(0));
