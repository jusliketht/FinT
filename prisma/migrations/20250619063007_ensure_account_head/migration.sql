/*
  Warnings:

  - You are about to drop the column `balance` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `AccountCategory` table. All the data in the column will be lost.
  - You are about to drop the column `organizationId` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `AccountType` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `AccountCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_typeId_fkey";

-- DropForeignKey
ALTER TABLE "AccountCategory" DROP CONSTRAINT "AccountCategory_typeId_fkey";

-- DropIndex
DROP INDEX "Account_categoryId_idx";

-- DropIndex
DROP INDEX "Account_typeId_idx";

-- DropIndex
DROP INDEX "AccountCategory_name_typeId_key";

-- DropIndex
DROP INDEX "AccountCategory_typeId_idx";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "balance",
DROP COLUMN "categoryId",
DROP COLUMN "description",
DROP COLUMN "typeId",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AccountCategory" DROP COLUMN "typeId",
ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "organizationId",
DROP COLUMN "role",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'VIEWER';

-- DropTable
DROP TABLE "AccountType";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "AccountHead" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "address" TEXT,
    "taxNumber" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "fiscalYearStart" TIMESTAMP(3) NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialYear" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntryItem" (
    "id" TEXT NOT NULL,
    "journalEntryId" TEXT NOT NULL,
    "accountHeadId" TEXT NOT NULL,
    "description" TEXT,
    "debitAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LedgerEntry" (
    "id" TEXT NOT NULL,
    "accountHeadId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "debitAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "creditAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "balance" DECIMAL(65,30) NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountHead_code_key" ON "AccountHead"("code");

-- CreateIndex
CREATE INDEX "AccountHead_categoryId_idx" ON "AccountHead"("categoryId");

-- CreateIndex
CREATE INDEX "AccountHead_parentId_idx" ON "AccountHead"("parentId");

-- CreateIndex
CREATE INDEX "FinancialYear_isActive_idx" ON "FinancialYear"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialYear_startDate_endDate_key" ON "FinancialYear"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "JournalEntryItem_accountHeadId_idx" ON "JournalEntryItem"("accountHeadId");

-- CreateIndex
CREATE INDEX "JournalEntryItem_journalEntryId_idx" ON "JournalEntryItem"("journalEntryId");

-- CreateIndex
CREATE INDEX "LedgerEntry_accountHeadId_idx" ON "LedgerEntry"("accountHeadId");

-- CreateIndex
CREATE INDEX "LedgerEntry_date_idx" ON "LedgerEntry"("date");

-- CreateIndex
CREATE INDEX "Account_type_idx" ON "Account"("type");

-- CreateIndex
CREATE UNIQUE INDEX "AccountCategory_name_key" ON "AccountCategory"("name");

-- CreateIndex
CREATE INDEX "JournalEntry_creditAccountId_idx" ON "JournalEntry"("creditAccountId");

-- CreateIndex
CREATE INDEX "JournalEntry_date_idx" ON "JournalEntry"("date");

-- CreateIndex
CREATE INDEX "JournalEntry_debitAccountId_idx" ON "JournalEntry"("debitAccountId");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_idx" ON "JournalEntry"("userId");

-- CreateIndex
CREATE INDEX "Transaction_category_idx" ON "Transaction"("category");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_transactionType_idx" ON "Transaction"("transactionType");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- AddForeignKey
ALTER TABLE "AccountHead" ADD CONSTRAINT "AccountHead_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "AccountCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountHead" ADD CONSTRAINT "AccountHead_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AccountHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryItem" ADD CONSTRAINT "JournalEntryItem_accountHeadId_fkey" FOREIGN KEY ("accountHeadId") REFERENCES "AccountHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryItem" ADD CONSTRAINT "JournalEntryItem_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_accountHeadId_fkey" FOREIGN KEY ("accountHeadId") REFERENCES "AccountHead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
