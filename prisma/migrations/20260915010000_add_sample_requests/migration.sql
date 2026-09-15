-- CreateTable
CREATE TABLE "SampleRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerId" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "storeAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SampleRequest_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SampleRequest_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "JobAssignment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SampleRequestItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sampleRequestId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    CONSTRAINT "SampleRequestItem_sampleRequestId_fkey" FOREIGN KEY ("sampleRequestId") REFERENCES "SampleRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SampleRequestItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SampleRequest_workerId_idx" ON "SampleRequest"("workerId");

-- CreateIndex
CREATE INDEX "SampleRequest_assignmentId_idx" ON "SampleRequest"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "SampleRequestItem_sampleRequestId_inventoryItemId_key" ON "SampleRequestItem"("sampleRequestId", "inventoryItemId");
