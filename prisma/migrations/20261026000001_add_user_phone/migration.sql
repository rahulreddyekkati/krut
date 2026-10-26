-- Phone number entered at sign-up. Null for every existing user (no backfill).
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
