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
  // Total Wine
  { name: "Total Wine 512", address: "7640 Cypress Creek Parkway, Houston, TX 77070",              lat: 29.9969, lng: -95.5261 },
  { name: "Total Wine 515", address: "18740 Gulf Freeway, Friendswood, TX 77546",                  lat: 29.5160, lng: -95.1543 },
  { name: "Total Wine 516", address: "5016 San Felipe Street, Houston, TX 77056",                  lat: 29.7518, lng: -95.4616 },
  { name: "Total Wine 517", address: "12516 Memorial Drive, Houston, TX 77024",                    lat: 29.7638, lng: -95.5455 },
  { name: "Total Wine 518", address: "2617 West Holcombe Boulevard, Houston, TX 77025",            lat: 29.7082, lng: -95.4257 },
  { name: "Total Wine 519", address: "5472 West Grand Parkway South, Richmond, TX 77406",         lat: 29.6724, lng: -95.7608 },
  { name: "Total Wine 524", address: "1900 Lake Woodlands Dr Ste 900, The Woodlands, TX 77380",   lat: 30.1736, lng: -95.4614 },
  { name: "Total Wine 525", address: "7055 Highway 6 North, Houston, TX 77095",                   lat: 29.8464, lng: -95.6576 },
  { name: "Total Wine 526", address: "9805 FM 1960 Bypass Road West, Humble, TX 77338",           lat: 29.9983, lng: -95.2764 },
  { name: "Total Wine 527", address: "16762-B Southwest Freeway, Sugar Land, TX 77479",           lat: 29.5794, lng: -95.6346 },
  { name: "Total Wine 529", address: "10322 Broadway Street, Pearland, TX 77584",                 lat: 29.5380, lng: -95.3220 },
  { name: "Total Wine 530", address: "2857 Katy Freeway Suite 100, Houston, TX 77007",            lat: 29.7634, lng: -95.4195 },
  { name: "Total Wine 539", address: "219 South Loop 336 West, Conroe, TX 77304",                 lat: 30.3082, lng: -95.4785 },
  // WB Liquors
  { name: "WB Liquors 51 (Costco)", address: "3834 Richmond Ave, Houston, TX 77027",                        lat: 29.7388, lng: -95.4508 },
  { name: "WB Liquors 52 (Costco)", address: "1150 Bunker Hill Road Ste 100, Houston, TX 77055",            lat: 29.7896, lng: -95.5415 },
  { name: "WB Liquors 53 (Costco)", address: "12405 N Gessner Rd Ste 100, Houston, TX 77064",              lat: 29.9135, lng: -95.5554 },
  { name: "WB Liquors 54 (Costco)", address: "23647 Katy Freeway, Katy, TX 77494",                         lat: 29.7856, lng: -95.8240 },
  { name: "WB Liquors 55 (Costco)", address: "17518 SW Freeway, Sugar Land, TX 77479",                     lat: 29.5621, lng: -95.6279 },
  { name: "WB Liquors 56 (Costco)", address: "8167 Hwy 242 Suite 200, Conroe, TX 77385",                   lat: 30.2215, lng: -95.4297 },
  { name: "WB Liquors 57 (Costco)", address: "21802 W Townsen Blvd Suite A, Humble, TX 77338",             lat: 30.0468, lng: -95.3612 },
  { name: "WB Liquors 58 (Costco)", address: "3500 Business Center Dr Ste 100, Pearland, TX 77584",        lat: 29.5627, lng: -95.3574 },
  { name: "WB Liquors 59 (Costco)", address: "1310 Jasmine Ave Suite A, Webster, TX 77598",                lat: 29.5369, lng: -95.1194 },
];

async function main() {
  let market = await prisma.market.findFirst({
    where: { name: { contains: 'Houston' } }
  });

  if (!market) {
    console.log('⚠️  Houston market not found. Creating it...');
    market = await prisma.market.create({ data: { name: 'Houston' } });
    console.log(`✅ Created market: Houston (${market.id})`);
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
