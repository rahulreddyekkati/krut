-- The brand a job is for (KRUTO / MULUK / BOTH). Null for every pre-existing job (no
-- backfill: which brand an old job was for was never recorded).
ALTER TABLE "Job" ADD COLUMN "brand" TEXT;
