-- CreateTable
CREATE TABLE "PayrollPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workerId" TEXT NOT NULL,
    "periodStart" TEXT NOT NULL,
    "periodEnd" TEXT NOT NULL,
    "paidAt" DATETIME NOT NULL,
    "amountPaid" REAL NOT NULL,
    "hoursPaid" REAL NOT NULL,
    "markedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PayrollPayment_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PayrollPayment_markedById_fkey" FOREIGN KEY ("markedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PayrollPayment_workerId_periodStart_periodEnd_key" ON "PayrollPayment"("workerId", "periodStart", "periodEnd");

