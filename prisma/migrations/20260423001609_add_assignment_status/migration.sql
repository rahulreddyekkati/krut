-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "date" DATETIME,
    "dayOfWeek" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "clockIn" DATETIME,
    "clockOut" DATETIME,
    "breakTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "workedHours" REAL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobAssignment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "JobAssignment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_JobAssignment" ("breakTimeMinutes", "clockIn", "clockOut", "createdAt", "date", "dayOfWeek", "id", "isRecurring", "jobId", "workedHours", "workerId") SELECT "breakTimeMinutes", "clockIn", "clockOut", "createdAt", "date", "dayOfWeek", "id", "isRecurring", "jobId", "workedHours", "workerId" FROM "JobAssignment";
DROP TABLE "JobAssignment";
ALTER TABLE "new_JobAssignment" RENAME TO "JobAssignment";
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "threadId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "ChatThread" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("content", "createdAt", "id", "senderId", "threadId") SELECT "content", "createdAt", "id", "senderId", "threadId" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("createdAt", "id", "message", "read", "title", "userId") SELECT "createdAt", "id", "message", "read", "title", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE TABLE "new_OvertimeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recapId" TEXT NOT NULL,
    "minutes" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OvertimeRequest_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_OvertimeRequest" ("createdAt", "id", "minutes", "reason", "recapId", "status") SELECT "createdAt", "id", "minutes", "reason", "recapId", "status" FROM "OvertimeRequest";
DROP TABLE "OvertimeRequest";
ALTER TABLE "new_OvertimeRequest" RENAME TO "OvertimeRequest";
CREATE UNIQUE INDEX "OvertimeRequest_recapId_key" ON "OvertimeRequest"("recapId");
CREATE TABLE "new_Recap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "consumersAttended" INTEGER NOT NULL,
    "consumersSampled" INTEGER NOT NULL,
    "reimbursement" REAL NOT NULL DEFAULT 0,
    "receiptTotal" REAL NOT NULL DEFAULT 0,
    "receiptUrl" TEXT,
    "comments" TEXT,
    "rushLevel" TEXT,
    "customerFeedback" TEXT,
    "managerSignature" TEXT,
    "managerReview" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Recap_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Recap_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "JobAssignment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Recap" ("assignmentId", "comments", "consumersAttended", "consumersSampled", "createdAt", "customerFeedback", "id", "jobId", "managerReview", "managerSignature", "receiptTotal", "receiptUrl", "reimbursement", "rushLevel", "status") SELECT "assignmentId", "comments", "consumersAttended", "consumersSampled", "createdAt", "customerFeedback", "id", "jobId", "managerReview", "managerSignature", "receiptTotal", "receiptUrl", "reimbursement", "rushLevel", "status" FROM "Recap";
DROP TABLE "Recap";
ALTER TABLE "new_Recap" RENAME TO "Recap";
CREATE UNIQUE INDEX "Recap_assignmentId_key" ON "Recap"("assignmentId");
CREATE TABLE "new_RecapSKU" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recapId" TEXT NOT NULL,
    "skuName" TEXT NOT NULL,
    "beginningInventory" INTEGER NOT NULL DEFAULT 0,
    "purchased" INTEGER NOT NULL DEFAULT 0,
    "bottlesSold" INTEGER NOT NULL DEFAULT 0,
    "storePrice" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "RecapSKU_recapId_fkey" FOREIGN KEY ("recapId") REFERENCES "Recap" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RecapSKU" ("beginningInventory", "bottlesSold", "id", "purchased", "recapId", "skuName", "storePrice") SELECT "beginningInventory", "bottlesSold", "id", "purchased", "recapId", "skuName", "storePrice" FROM "RecapSKU";
DROP TABLE "RecapSKU";
ALTER TABLE "new_RecapSKU" RENAME TO "RecapSKU";
CREATE TABLE "new_ReleaseRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "date" DATETIME,
    "dayOfWeek" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReleaseRequest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReleaseRequest_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ReleaseRequest" ("createdAt", "date", "dayOfWeek", "id", "isRecurring", "jobId", "reason", "status", "updatedAt", "workerId") SELECT "createdAt", "date", "dayOfWeek", "id", "isRecurring", "jobId", "reason", "status", "updatedAt", "workerId" FROM "ReleaseRequest";
DROP TABLE "ReleaseRequest";
ALTER TABLE "new_ReleaseRequest" RENAME TO "ReleaseRequest";
CREATE TABLE "new_ShiftRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "date" DATETIME,
    "dayOfWeek" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShiftRequest_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShiftRequest_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ShiftRequest" ("createdAt", "date", "dayOfWeek", "id", "isRecurring", "jobId", "status", "updatedAt", "workerId") SELECT "createdAt", "date", "dayOfWeek", "id", "isRecurring", "jobId", "status", "updatedAt", "workerId" FROM "ShiftRequest";
DROP TABLE "ShiftRequest";
ALTER TABLE "new_ShiftRequest" RENAME TO "ShiftRequest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
