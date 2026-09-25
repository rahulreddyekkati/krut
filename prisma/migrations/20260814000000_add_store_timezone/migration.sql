-- Add per-store IANA timezone. Defaults to Central since most stores are in that
-- zone; stores outside it (e.g. El Paso, which is Mountain) must be corrected
-- after this migration runs. See auto-clockout cron bug: it previously hardcoded
-- America/Chicago for every store, auto-clocking out Mountain-time stores an hour early.
ALTER TABLE "Store" ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'America/Chicago';
