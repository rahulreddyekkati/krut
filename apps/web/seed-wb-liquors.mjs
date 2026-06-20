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
  { name: "WB Liquors 29", address: "8902 Tehama Ridge Parkway, Fort Worth, TX 76177", lat: 32.9221, lng: -97.3412 },
  { name: "WB Liquors 30", address: "5310 Overton Ridge Boulevard, Fort Worth, TX 76132", lat: 32.6682, lng: -97.4138 },
  { name: "WB Liquors 31", address: "1705 Dallas Parkway, Plano, TX 78216", lat: 33.0199, lng: -96.8208 },
  { name: "WB Liquors 32", address: "3808 Central Expressway, Plano, TX 75074", lat: 33.0350, lng: -96.7023 },
  { name: "WB Liquors 33", address: "847 Hwy 121 South, Lewisville, TX 75067", lat: 33.0155, lng: -97.0105 },
  { name: "WB Liquors 34", address: "600 W Arbrook Blvd Suite A, Arlington, TX 76014", lat: 32.6904, lng: -97.1905 },
];

async function main() {
  const market = await prisma.market.findFirst({
    where: { name: { contains: 'Dallas' } }
  });

  if (!market) {
    console.error('❌ Dallas market not found!');
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
