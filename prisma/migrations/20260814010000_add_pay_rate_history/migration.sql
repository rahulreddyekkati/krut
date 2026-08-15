-- Effective-dated pay rate history. Each row records the hourly wage that took effect
-- on effectiveFrom (a UTC-midnight calendar marker, same convention as
-- JobAssignment.date -- compared only against another marker, never a real-time
-- boundary). Payroll calculations resolve the rate in effect on each shift's own date
-- instead of applying today's flat User.hourlyWage to every shift in a report,
-- regardless of when a later rate change happened. No backfill needed: a worker with
-- zero rows here resolves to the existing User.hourlyWage for every date, identical to
-- pre-migration behavior -- see apps/web/src/lib/payRate.ts.
CREATE TABLE "PayRateHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerId" TEXT NOT NULL,
    "hourlyWage" REAL NOT NULL,
    "effectiveFrom" DATETIME NOT NULL,
    "changedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PayRateHistory_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PayRateHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "PayRateHistory_workerId_effectiveFrom_key" ON "PayRateHistory"("workerId", "effectiveFrom");
