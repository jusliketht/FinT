/*
  Warnings:

  - You are about to drop the column `taxNumber` on the `Business` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[registrationNumber]` on the table `Business` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Business` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserBusiness" DROP CONSTRAINT "UserBusiness_businessId_fkey";

-- DropForeignKey
ALTER TABLE "UserBusiness" DROP CONSTRAINT "UserBusiness_userId_fkey";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "businessId" TEXT;

-- AlterTable
ALTER TABLE "Business" DROP COLUMN "taxNumber",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "fiscalYearEnd" TIMESTAMP(3),
ADD COLUMN     "fiscalYearStart" TIMESTAMP(3),
ADD COLUMN     "incorporationDate" TIMESTAMP(3),
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "taxId" TEXT;

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "businessId" TEXT,
ADD COLUMN     "gstAmount" DOUBLE PRECISION,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "isInterState" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMsmeVendor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "placeOfSupply" TEXT,
ADD COLUMN     "tdsAmount" DOUBLE PRECISION,
ADD COLUMN     "tdsSection" TEXT,
ADD COLUMN     "vendorName" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "businessId" TEXT;

-- CreateIndex
CREATE INDEX "Account_businessId_idx" ON "Account"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Business_registrationNumber_key" ON "Business"("registrationNumber");

-- CreateIndex
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");

-- CreateIndex
CREATE INDEX "JournalEntry_businessId_idx" ON "JournalEntry"("businessId");

-- CreateIndex
CREATE INDEX "JournalEntry_gstin_idx" ON "JournalEntry"("gstin");

-- CreateIndex
CREATE INDEX "Transaction_businessId_idx" ON "Transaction"("businessId");

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBusiness" ADD CONSTRAINT "UserBusiness_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBusiness" ADD CONSTRAINT "UserBusiness_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
