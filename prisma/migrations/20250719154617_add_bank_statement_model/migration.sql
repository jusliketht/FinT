-- CreateTable
CREATE TABLE "BankStatement" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "bankType" TEXT NOT NULL,
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BankStatement_userId_idx" ON "BankStatement"("userId");

-- CreateIndex
CREATE INDEX "BankStatement_businessId_idx" ON "BankStatement"("businessId");

-- CreateIndex
CREATE INDEX "BankStatement_bankType_idx" ON "BankStatement"("bankType");

-- CreateIndex
CREATE INDEX "BankStatement_status_idx" ON "BankStatement"("status");

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
