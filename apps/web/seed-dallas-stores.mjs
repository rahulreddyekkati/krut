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
  { name: "Total Wine 501", address: "9350 North Central Expressway, Dallas, TX 75231",       lat: 32.8720, lng: -96.7706 },
  { name: "Total Wine 502", address: "5200 South Hulen Street, Fort Worth, TX 76132",          lat: 32.6682, lng: -97.4138 },
  { name: "Total Wine 505", address: "721 North Central Expressway Ste 200, Plano, TX 75075",  lat: 33.0350, lng: -96.7023 },
  { name: "Total Wine 506", address: "8700 Preston Road Ste 113, Plano, TX 75024",             lat: 33.0854, lng: -96.8024 },
  { name: "Total Wine 507", address: "2325 South Stemmons Freeway, Lewisville, TX 75067",      lat: 33.0155, lng: -97.0105 },
  { name: "Total Wine 508", address: "981 Interstate 20 West, Arlington, TX 76017",            lat: 32.6904, lng: -97.1905 },
  { name: "Total Wine 511", address: "1800 South Loop 288 Ste 370, Denton, TX 76205",          lat: 33.1887, lng: -97.1261 },
  { name: "Total Wine 513", address: "6400 West Plano Parkway, Plano, TX 75093",               lat: 33.0199, lng: -96.8208 },
  { name: "Total Wine 521", address: "190 East Stacy Road, Allen, TX 75002",                   lat: 33.0997, lng: -96.6544 },
  { name: "Total Wine 523", address: "3101 Texas Sage Trail, Fort Worth, TX 76177",            lat: 32.9221, lng: -97.3412 },
  { name: "Total Wine 528", address: "2500 Rio Grande Boulevard, Euless, TX 76039",            lat: 32.8479, lng: -97.0823 },
  { name: "Total Wine 531", address: "3810 Congress Avenue, Dallas, TX 75219",                 lat: 32.8102, lng: -96.8218 },
  { name: "Total Wine 534", address: "428 E FM1382, Cedar Hill, TX 75104",                     lat: 32.5874, lng: -96.9285 },
  { name: "Total Wine 535", address: "7730 North MacArthur Blvd Ste A, Irving, TX 75063",      lat: 32.9060, lng: -96.9940 },
];

async function main() {
  const market = await prisma.market.findFirst({
    where: { name: { contains: 'Dallas' } }
  });

  if (!market) {
    console.error('❌ Dallas market not found! Please create it first in the admin panel.');
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
