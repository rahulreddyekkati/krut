import prisma from "./prisma";

export interface StoreImportRow {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    marketName: string;
}

export async function importStores(rows: StoreImportRow[]) {
    const results = {
        success: 0,
        failed: 0,
        errors: [] as string[]
    };

    for (const row of rows) {
        try {
            // Find or create market
            let market = await prisma.market.findUnique({
                where: { name: row.marketName }
            });

            if (!market) {
                market = await prisma.market.create({
                    data: { name: row.marketName }
                });
            }

            await prisma.store.create({
                data: {
                    name: row.name,
                    address: row.address,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    marketId: market.id
                }
            });
            results.success++;
        } catch (error) {
            results.failed++;
            results.errors.push(`Failed to import ${row.name}: ${(error as Error).message}`);
        }
    }

    return results;
}
