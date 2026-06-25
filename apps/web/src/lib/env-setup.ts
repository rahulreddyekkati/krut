// Sanitize DATABASE_URL for Prisma SQLite validation.
// Prisma Client validates that DATABASE_URL starts with 'file:' when provider is 'sqlite',
// even when using a driver adapter. We redirect actual traffic to Turso using the adapter.
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:")) {
    process.env.ORIGINAL_DATABASE_URL = process.env.DATABASE_URL;
    console.log("🔧 Sanitizing DATABASE_URL from %s to file:./dev.db for Prisma SQLite validation.", process.env.DATABASE_URL);
    process.env.DATABASE_URL = "file:./dev.db";
}

