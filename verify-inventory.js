const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const items = await prisma.inventoryItem.findMany();
        console.log('Successfully queried inventoryItem. Count:', items.length);
        process.exit(0);
    } catch (e) {
        console.error('Failed to query inventoryItem:', e.message);
        process.exit(1);
    }
}
main();
