/*
  Warnings:

  - You are about to drop the column `amount` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `creditAccountId` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `debitAccountId` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `gstAmount` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `referenceNumber` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `tdsAmount` on the `JournalEntry` table. All the data in the column will be lost.
  - Added the required column `totalAmount` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_creditAccountId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_debitAccountId_fkey";

-- DropIndex
DROP INDEX "JournalEntry_creditAccountId_idx";

-- DropIndex
DROP INDEX "JournalEntry_debitAccountId_idx";

-- DropIndex
DROP INDEX "JournalEntry_referenceNumber_key";

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "amount",
DROP COLUMN "creditAccountId",
DROP COLUMN "debitAccountId",
DROP COLUMN "gstAmount",
DROP COLUMN "referenceNumber",
DROP COLUMN "tdsAmount",
ADD COLUMN     "isAdjusting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isReversed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reversalEntryId" TEXT,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "JournalEntryLine" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "debitAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntryLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "JournalEntryLine_journalEntryId_idx" ON "JournalEntryLine"("journalEntryId");

-- CreateIndex
CREATE INDEX "JournalEntryLine_accountId_idx" ON "JournalEntryLine"("accountId");

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "AccountHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_reversalEntryId_fkey" FOREIGN KEY ("reversalEntryId") REFERENCES "JournalEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
