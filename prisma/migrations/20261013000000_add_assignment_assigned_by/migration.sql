-- The admin / market manager who put the current worker on this shift. Null for
-- AVAILABLE assignments and for every row that predates this column (no backfill:
-- the assigner was never recorded, and Job.creatorId is not a reliable stand-in).
ALTER TABLE "JobAssignment" ADD COLUMN "assignedById" TEXT;
