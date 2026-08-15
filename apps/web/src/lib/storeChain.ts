// Canonical source for the retail chain a store belongs to (see Store.chain in
// prisma/schema.prisma). One list, everywhere: the Zod schema, the store PUT route's
// validation, the CSV import fallback, and the store list/edit UI all import from here so
// they can't silently drift out of sync with each other (e.g. if a 4th chain value is ever
// added and only some of those spots get updated).

export const STORE_CHAINS = ["WB_LIQUORS", "TOTAL_WINE", "OTHER"] as const;
export type StoreChain = typeof STORE_CHAINS[number];

export const STORE_CHAIN_LABELS: Record<StoreChain, string> = {
    WB_LIQUORS: "WB Liquors",
    TOTAL_WINE: "Total Wine",
    OTHER: "Other",
};

/**
 * Best-guess chain classification from a store name (e.g. "WB Liquors 30" → WB_LIQUORS,
 * "Total Wine 506" → TOTAL_WINE). Matches the full chain name, not a bare substring like
 * "wb" — "Newburgh Wine & Spirits" or "Webster Liquors" would both false-positive on that.
 *
 * Keep this in sync BY HAND with the backfill UPDATE statements in
 * prisma/migrations/20260815000000_add_store_chain/migration.sql — SQL can't import this
 * function, so that migration duplicates this exact rule; if the matching rule ever changes,
 * update both.
 */
export function guessChainFromName(name: string): StoreChain {
    const n = (name || "").toLowerCase();
    if (n.includes("wb liquors")) return "WB_LIQUORS";
    if (n.includes("total wine")) return "TOTAL_WINE";
    return "OTHER";
}
