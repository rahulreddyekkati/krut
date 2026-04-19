import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
  try {
    const rs = await client.execute("SELECT * FROM JobAssignment WHERE id = 'cmo4r6asy0005ky04lzveeaue'");
    console.log("Found assignment:", rs.rows);
  } catch (e) {
    console.error(e);
  }
}
run();
