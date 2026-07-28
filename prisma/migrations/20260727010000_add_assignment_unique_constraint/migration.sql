-- Prevents two near-simultaneous rollover calls from both materializing the same
-- dated shift for the same worker+job (confirmed to have happened in production).
-- NULL dates (true recurring templates) are exempt under standard SQL NULL semantics.
CREATE UNIQUE INDEX "JobAssignment_workerId_jobId_date_key" ON "JobAssignment"("workerId", "jobId", "date");
