-- Retail chain classification for stores (WB Liquors / Total Wine / Other), driving the
-- wine/WB spend breakdown in Analytics -- see apps/web/src/app/api/admin/reports/brand-spend/route.ts.
ALTER TABLE "Store" ADD COLUMN "chain" TEXT NOT NULL DEFAULT 'OTHER';

-- Best-guess backfill from existing store names (e.g. "WB Liquors 30", "Total Wine 506") --
-- admins can correct any misclassification afterward via the store edit form. Matches the
-- full chain name, not a bare substring like "wb" -- "Newburgh Wine & Spirits" or "Webster
-- Liquors" would both false-positive on '%wb%'. Keep this pattern in sync BY HAND with
-- apps/web/src/lib/storeChain.ts's guessChainFromName() -- SQL can't import that function, so
-- this is duplicated logic; if the matching rule ever changes, update both.
UPDATE "Store" SET "chain" = 'WB_LIQUORS' WHERE "name" LIKE '%wb liquors%';
UPDATE "Store" SET "chain" = 'TOTAL_WINE' WHERE "name" LIKE '%total wine%';
