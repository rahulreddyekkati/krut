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
  { name: "Total Wine 503",           address: "125 NW Loop 410 #260, San Antonio, TX 78216",         lat: 29.5266, lng: -98.5157 },
  { name: "Total Wine 504 (The RIM)", address: "17530 La Cantera Parkway #103, San Antonio, TX 78257", lat: 29.6004, lng: -98.6206 },
  { name: "Total Wine 520",           address: "8356 Agora Parkway, Selma, TX 78154",                  lat: 29.5849, lng: -98.3199 },
  { name: "WB Liquors 21 (Costco)",   address: "5607 UTSA Boulevard, San Antonio, TX 78249",           lat: 29.5776, lng: -98.6144 },
  { name: "WB Liquors 22 (Costco)",   address: "1203 FM 1604E North, San Antonio, TX 78232",           lat: 29.6195, lng: -98.4714 },
  { name: "WB Liquors 23 (Costco)",   address: "15330 IH 35N Suite 100, Selma, TX 78154",              lat: 29.5898, lng: -98.3132 },
];

async function main() {
  let market = await prisma.market.findFirst({
    where: { name: { contains: 'San Antonio' } }
  });

  if (!market) {
    console.log('⚠️  San Antonio market not found. Creating it...');
    market = await prisma.market.create({ data: { name: 'San Antonio' } });
    console.log(`✅ Created market: San Antonio (${market.id})`);
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
