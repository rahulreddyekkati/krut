const { createClient } = require("@libsql/client");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoToken) {
  console.error("❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env");
  console.error("Resolved .env path was:", path.resolve(__dirname, "../.env"));
  process.exit(1);
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoToken,
});

async function run() {
  console.log("Connecting to Turso at:", tursoUrl);
  try {
    // Run the migration query
    await client.execute('ALTER TABLE "JobAssignment" ADD COLUMN "brandAllocation" TEXT;');
    console.log("✅ Successfully added 'brandAllocation' column to 'JobAssignment' table on Turso!");
  } catch (error) {
    if (error.message && error.message.includes("duplicate column name")) {
      console.log("ℹ️ Column 'brandAllocation' already exists on Turso database.");
    } else {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    }
  } finally {
    client.close();
  }
}

run();
