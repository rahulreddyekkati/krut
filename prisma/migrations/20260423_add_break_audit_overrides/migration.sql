-- Migration: add_break_audit_overrides
-- Adds: Break model, AuditLog model, Job.sourceReleaseId,
--       JobAssignment custom time overrides, Recap.storeManagerName

-- Job: link released-shift open jobs back to their source release request
ALTER TABLE "Job" ADD COLUMN "sourceReleaseId" TEXT;

-- JobAssignment: per-worker per-shift time overrides (admin-initiated extensions)
ALTER TABLE "JobAssignment" ADD COLUMN "customStartTimeStr" TEXT;
ALTER TABLE "JobAssignment" ADD COLUMN "customEndTimeStr" TEXT;

-- Recap: typed name of the store manager who signed off at the event
ALTER TABLE "Recap" ADD COLUMN "storeManagerName" TEXT;

-- Break: individual break intervals within a shift (supports multiple breaks)
CREATE TABLE "Break" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "assignmentId" TEXT NOT NULL,
    "startTime"    DATETIME NOT NULL,
    "endTime"      DATETIME,
    "durationMins" REAL,
    CONSTRAINT "Break_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "JobAssignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AuditLog: immutable log of admin actions that affect payroll calculations
CREATE TABLE "AuditLog" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "actorId"    TEXT NOT NULL,
    "action"     TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId"   TEXT NOT NULL,
    "oldValue"   TEXT,
    "newValue"   TEXT,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON UPDATE CASCADE
);

-- Indexes for common query patterns
CREATE INDEX "Break_assignmentId_idx" ON "Break"("assignmentId");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
