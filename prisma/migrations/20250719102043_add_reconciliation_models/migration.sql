-- CreateTable
CREATE TABLE "Reconciliation" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "statementDate" TIMESTAMP(3) NOT NULL,
    "closingBalance" DOUBLE PRECISION NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReconciliationStatementLine" (
    "id" TEXT NOT NULL,
    "reconciliationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "transactionId" TEXT,
    "isMatched" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReconciliationStatementLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Reconciliation_accountId_idx" ON "Reconciliation"("accountId");

-- CreateIndex
CREATE INDEX "Reconciliation_statementDate_idx" ON "Reconciliation"("statementDate");

-- CreateIndex
CREATE INDEX "Reconciliation_userId_idx" ON "Reconciliation"("userId");

-- CreateIndex
CREATE INDEX "Reconciliation_businessId_idx" ON "Reconciliation"("businessId");

-- CreateIndex
CREATE INDEX "ReconciliationStatementLine_reconciliationId_idx" ON "ReconciliationStatementLine"("reconciliationId");

-- CreateIndex
CREATE INDEX "ReconciliationStatementLine_transactionId_idx" ON "ReconciliationStatementLine"("transactionId");

-- AddForeignKey
ALTER TABLE "Reconciliation" ADD CONSTRAINT "Reconciliation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reconciliation" ADD CONSTRAINT "Reconciliation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reconciliation" ADD CONSTRAINT "Reconciliation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReconciliationStatementLine" ADD CONSTRAINT "ReconciliationStatementLine_reconciliationId_fkey" FOREIGN KEY ("reconciliationId") REFERENCES "Reconciliation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
