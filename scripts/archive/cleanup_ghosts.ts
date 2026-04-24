import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
dotenv.config();

const libsql = createClient({
  url: process.env.DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

async function run() {
    console.log("--- CLEANING UP GHOSB RECAPS: WORKER TWO ---");
    
    // We want to delete any RECAP_PENDING assignments that are NOT our current active one.
    // Our active one is IN_PROGRESS. 
    // Any remaining RECAP_PENDING from today is a ghost of our previous test failures.
    
    const result = await libsql.execute(`
        DELETE FROM JobAssignment 
        WHERE workerId = (SELECT id FROM User WHERE name = 'Worker Two')
        AND status = 'RECAP_PENDING'
    `);

    console.log(`✅ Deleted ${result.rowsAffected} ghost recap records.`);
}

run().catch(console.error).finally(() => process.exit(0));
