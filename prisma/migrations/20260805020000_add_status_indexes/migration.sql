-- None of the 6 tables with a `status` column had an index on it. Confirmed live
-- in production: filtering Recap by status went from 9-12 SECONDS to under 250ms
-- once indexed (378 rows -- this was never a "big table" problem, just a genuinely
-- missing index that turned every status-filtered query into a pathological scan).
-- This directly caused the admin recaps screen (which filters by status) to hang
-- or time out entirely.
--
-- Already applied directly to production Turso via raw SQL before this migration
-- file was written (this DB doesn't use tracked `prisma migrate deploy`, so there's
-- no _prisma_migrations bookkeeping to reconcile) -- this file exists so the schema
-- and a fresh `prisma db push`/local dev DB match what's actually live.
CREATE INDEX IF NOT EXISTS "Recap_status_idx" ON "Recap"("status");
CREATE INDEX IF NOT EXISTS "JobAssignment_status_idx" ON "JobAssignment"("status");
CREATE INDEX IF NOT EXISTS "Job_status_idx" ON "Job"("status");
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");
CREATE INDEX IF NOT EXISTS "ReleaseRequest_status_idx" ON "ReleaseRequest"("status");
CREATE INDEX IF NOT EXISTS "ShiftRequest_status_idx" ON "ShiftRequest"("status");
