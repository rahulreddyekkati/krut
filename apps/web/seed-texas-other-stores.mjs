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
  { name: "Total Wine 532",         address: "8889 West Gateway Boulevard, El Paso, TX 79925",           lat: 31.7695064, lng: -106.3684045 },
  { name: "Total Wine 533",         address: "5425 South Padre Island Dr #136, Corpus Christi, TX 78411", lat: 27.7300, lng: -97.3801 },
  { name: "Total Wine 537",         address: "1450 Texas Ave South, College Station, TX 77840",           lat: 30.6014, lng: -96.3148 },
  { name: "Total Wine 538",         address: "800 E Expressway 83 Suite 200, McAllen, TX 78503",          lat: 26.1924, lng: -98.2154 },
  { name: "Total Wine 542",         address: "6038 Marsha Sharp Fwy W #100, Lubbock, TX 79407",          lat: 33.549839, lng: -101.949347 },
  { name: "WB Liquors 45 (Costco)", address: "6101 Gateway West Building 4, El Paso, TX 79925",           lat: 31.8318, lng: -106.5596 },
  { name: "WB Liquors 46 (Costco)", address: "6020 34th St Suite 200, Lubbock, TX 79404",                 lat: 33.5343, lng: -101.9277 },
];

async function main() {
  // Find or create Texas (Other) market
  let market = await prisma.market.findFirst({
    where: { name: { contains: 'Texas (Other)' } }
  });

  if (!market) {
    console.log('⚠️  "Texas (Other)" market not found. Creating it...');
    market = await prisma.market.create({
      data: { name: 'Texas (Other)' }
    });
    console.log(`✅ Created market: Texas (Other) (${market.id})`);
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
