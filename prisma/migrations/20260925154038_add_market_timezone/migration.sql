-- Add per-market default IANA timezone. Used as the pre-fill/fallback for stores in
-- this market, so a newly created store no longer silently inherits the unrelated
-- Store.timezone column default (see 20260814000000_add_store_timezone) — that gap is
-- what caused the auto-clockout cron to cap Mountain-time shifts an hour early until
-- someone noticed and corrected the store by hand.
ALTER TABLE "Market" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Chicago';
