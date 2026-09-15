-- Explicit submission/approval timestamps on Recap, replacing the implicit reliance on
-- createdAt (which only captures the FIRST submission and is never refreshed on a
-- resubmission after rejection) and the AuditLog trail (never joined into any recap view)
-- for approval time.
ALTER TABLE "Recap" ADD COLUMN "submittedAt" DATETIME;
ALTER TABLE "Recap" ADD COLUMN "approvedAt" DATETIME;

-- Backfill: for existing rows, createdAt is the closest available proxy for the original
-- submission time.
UPDATE "Recap" SET "submittedAt" = "createdAt" WHERE "submittedAt" IS NULL;

-- Backfill: best-effort approvedAt from the audit trail for already-approved recaps; rows
-- with no matching audit log entry are left NULL rather than guessed.
UPDATE "Recap"
SET "approvedAt" = (
    SELECT "createdAt" FROM "AuditLog"
    WHERE "AuditLog"."entityType" = 'Recap'
      AND "AuditLog"."entityId" = "Recap"."id"
      AND "AuditLog"."action" = 'RECAP_APPROVED'
    ORDER BY "AuditLog"."createdAt" DESC LIMIT 1
)
WHERE "Recap"."status" = 'APPROVED';
