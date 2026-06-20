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
  { name: "WB Liquors 41", address: "4301 W William Cannon Dr Unit A-200, Austin, TX 78738",   lat: 30.2270, lng: -97.8481 },
  { name: "WB Liquors 42", address: "10001 Research Blvd Ste 300, Austin, TX 78737",            lat: 30.4017, lng: -97.7375 },
  { name: "WB Liquors 43", address: "4601-1 183A Toll Rd Bldg C, Cedar Park, TX 78613",         lat: 30.5194, lng: -97.7994 },
  { name: "WB Liquors 44", address: "1901 Kelly Lane Suite 100, Pflugerville, TX 78660",         lat: 30.4388, lng: -97.6200 },
];

async function main() {
  const market = await prisma.market.findFirst({
    where: { name: { contains: 'Austin' } }
  });

  if (!market) {
    console.error('❌ Austin market not found!');
    process.exit(1);
  }

  console.log(`✅ Found market: ${market.name} (${market.id})\n`);

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
