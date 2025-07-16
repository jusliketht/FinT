/*
  Warnings:

  - You are about to drop the column `businessId` on the `CreditCard` table. All the data in the column will be lost.
  - You are about to drop the column `cardName` on the `CreditCard` table. All the data in the column will be lost.
  - You are about to drop the column `outstandingAmount` on the `CreditCard` table. All the data in the column will be lost.
  - You are about to drop the column `statementDate` on the `CreditCard` table. All the data in the column will be lost.
  - The `dueDate` column on the `CreditCard` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `merchant` on the `CreditCardTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `CreditCardTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `gstRate` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `gstin` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `hsnCode` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `invoiceNumber` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `isInterState` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `isMsmeVendor` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `panNumber` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `placeOfSupply` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `tdsRate` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `tdsSection` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `vendorName` on the `JournalEntry` table. All the data in the column will be lost.
  - The primary key for the `UserBusiness` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserBusiness` table. All the data in the column will be lost.
  - You are about to drop the `CompanySettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinancialYear` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JournalEntryItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LedgerEntry` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `AccountHead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `CreditCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CreditCard" DROP CONSTRAINT "CreditCard_businessId_fkey";

-- DropForeignKey
ALTER TABLE "CreditCardTransaction" DROP CONSTRAINT "CreditCardTransaction_creditCardId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_creditAccountId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_debitAccountId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntryItem" DROP CONSTRAINT "JournalEntryItem_accountHeadId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntryItem" DROP CONSTRAINT "JournalEntryItem_journalEntryId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_accountHeadId_fkey";

-- DropForeignKey
ALTER TABLE "UserBusiness" DROP CONSTRAINT "UserBusiness_businessId_fkey";

-- DropForeignKey
ALTER TABLE "UserBusiness" DROP CONSTRAINT "UserBusiness_userId_fkey";

-- DropIndex
DROP INDEX "AccountHead_parentId_idx";

-- DropIndex
DROP INDEX "Business_registrationNumber_key";

-- DropIndex
DROP INDEX "CreditCard_bankName_idx";

-- DropIndex
DROP INDEX "CreditCard_businessId_idx";

-- DropIndex
DROP INDEX "CreditCardTransaction_creditCardId_idx";

-- DropIndex
DROP INDEX "CreditCardTransaction_userId_idx";

-- DropIndex
DROP INDEX "JournalEntry_gstin_idx";

-- DropIndex
DROP INDEX "UserBusiness_userId_businessId_key";

-- AlterTable
ALTER TABLE "AccountHead" ADD COLUMN     "businessId" TEXT,
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CreditCard" DROP COLUMN "businessId",
DROP COLUMN "cardName",
DROP COLUMN "outstandingAmount",
DROP COLUMN "statementDate",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "bankName" DROP NOT NULL,
ALTER COLUMN "creditLimit" DROP NOT NULL,
ALTER COLUMN "creditLimit" DROP DEFAULT,
DROP COLUMN "dueDate",
ADD COLUMN     "dueDate" INTEGER;

-- AlterTable
ALTER TABLE "CreditCardTransaction" DROP COLUMN "merchant",
DROP COLUMN "reference";

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "gstRate",
DROP COLUMN "gstin",
DROP COLUMN "hsnCode",
DROP COLUMN "invoiceNumber",
DROP COLUMN "isInterState",
DROP COLUMN "isMsmeVendor",
DROP COLUMN "panNumber",
DROP COLUMN "placeOfSupply",
DROP COLUMN "tdsRate",
DROP COLUMN "tdsSection",
DROP COLUMN "vendorName",
ADD COLUMN     "reference" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "isThirdParty" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "thirdPartyId" TEXT,
ADD COLUMN     "thirdPartyName" TEXT,
ADD COLUMN     "thirdPartyType" TEXT;

-- AlterTable
ALTER TABLE "UserBusiness" DROP CONSTRAINT "UserBusiness_pkey",
DROP COLUMN "id",
ALTER COLUMN "role" DROP DEFAULT,
ADD CONSTRAINT "UserBusiness_pkey" PRIMARY KEY ("userId", "businessId");

-- DropTable
DROP TABLE "CompanySettings";

-- DropTable
DROP TABLE "FinancialYear";

-- DropTable
DROP TABLE "JournalEntryItem";

-- DropTable
DROP TABLE "LedgerEntry";

-- CreateTable
CREATE TABLE "ThirdParty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "businessId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdParty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ThirdParty_userId_idx" ON "ThirdParty"("userId");

-- CreateIndex
CREATE INDEX "ThirdParty_businessId_idx" ON "ThirdParty"("businessId");

-- CreateIndex
CREATE INDEX "ThirdParty_type_idx" ON "ThirdParty"("type");

-- CreateIndex
CREATE INDEX "ThirdParty_isActive_idx" ON "ThirdParty"("isActive");

-- CreateIndex
CREATE INDEX "AccountHead_code_idx" ON "AccountHead"("code");

-- CreateIndex
CREATE INDEX "AccountHead_businessId_idx" ON "AccountHead"("businessId");

-- CreateIndex
CREATE INDEX "AccountHead_type_idx" ON "AccountHead"("type");

-- CreateIndex
CREATE INDEX "Transaction_isThirdParty_idx" ON "Transaction"("isThirdParty");

-- CreateIndex
CREATE INDEX "Transaction_thirdPartyType_idx" ON "Transaction"("thirdPartyType");

-- AddForeignKey
ALTER TABLE "AccountHead" ADD CONSTRAINT "AccountHead_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThirdParty" ADD CONSTRAINT "ThirdParty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThirdParty" ADD CONSTRAINT "ThirdParty_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBusiness" ADD CONSTRAINT "UserBusiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBusiness" ADD CONSTRAINT "UserBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_debitAccountId_fkey" FOREIGN KEY ("debitAccountId") REFERENCES "AccountHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_creditAccountId_fkey" FOREIGN KEY ("creditAccountId") REFERENCES "AccountHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_thirdPartyId_fkey" FOREIGN KEY ("thirdPartyId") REFERENCES "ThirdParty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCardTransaction" ADD CONSTRAINT "CreditCardTransaction_creditCardId_fkey" FOREIGN KEY ("creditCardId") REFERENCES "CreditCard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
