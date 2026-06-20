import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('../../.env') });

const libsql = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

const stores = [
  { name: "Total Wine 509", address: "5601 Brodie Lane Ste 800, Sunset Valley, TX 78749",    lat: 30.2109, lng: -97.8396 },
  { name: "Total Wine 510", address: "11066 Pecan Park Blvd Ste 117, Cedar Park, TX 78737",  lat: 30.5194, lng: -97.7994 },
  { name: "Total Wine 514", address: "1201 Barbara Jordan Blvd #900, Austin, TX 78723",       lat: 30.2849, lng: -97.6879 },
  { name: "Total Wine 522", address: "10001 Research Blvd Ste 300, Austin, TX 78660",         lat: 30.4017, lng: -97.7375 },
  { name: "Total Wine 536", address: "3925 Market St, Bee Cave, TX 78738",                    lat: 30.3077, lng: -97.9617 },
];

async function main() {
  // Find or create Austin market
  let market = await prisma.market.findFirst({
    where: { name: { contains: 'Austin' } }
  });

  if (!market) {
    console.log('⚠️  Austin market not found. Creating it...');
    market = await prisma.market.create({
      data: { name: 'Austin, TX' }
    });
    console.log(`✅ Created market: Austin, TX (${market.id})`);
  } else {
    console.log(`✅ Found market: ${market.name} (${market.id})`);
  }

  console.log('');
  let created = 0, skipped = 0;

  for (const store of stores) {
    const existing = await prisma.store.findFirst({ where: { name: store.name } });
    if (existing) {
      console.log(`⏭  Skipping (exists): ${store.name}`);
      skipped++;
      continue;
    }
    await prisma.store.create({
      data: { name: store.name, address: store.address, latitude: store.lat, longitude: store.lng, radius: 100, marketId: market.id }
    });
    console.log(`✅ Added: ${store.name}`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
