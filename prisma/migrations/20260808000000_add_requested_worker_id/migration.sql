-- Admin-targeted invite: when set on an AVAILABLE JobAssignment, only this
-- worker should see/claim it via Open Shifts. Null means open to the whole
-- market (today's existing behavior for organically-released shifts).
ALTER TABLE "JobAssignment" ADD COLUMN "requestedWorkerId" TEXT;
