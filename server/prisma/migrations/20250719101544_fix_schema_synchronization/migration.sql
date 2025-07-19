/*
  Warnings:

  - You are about to drop the column `name` on the `CreditCard` table. All the data in the column will be lost.
  - The primary key for the `UserBusiness` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[referenceNumber]` on the table `JournalEntry` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,businessId]` on the table `UserBusiness` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cardName` to the `CreditCard` table without a default value. This is not possible if the table is not empty.
  - Made the column `bankName` on table `CreditCard` required. This step will fail if there are existing NULL values in that column.
  - Made the column `creditLimit` on table `CreditCard` required. This step will fail if there are existing NULL values in that column.
  - The required column `id` was added to the `UserBusiness` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "CreditCard" DROP COLUMN "name",
ADD COLUMN     "businessId" TEXT,
ADD COLUMN     "cardName" TEXT NOT NULL,
ADD COLUMN     "outstandingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "statementDate" TIMESTAMP(3),
ALTER COLUMN "bankName" SET NOT NULL,
ALTER COLUMN "creditLimit" SET NOT NULL,
ALTER COLUMN "creditLimit" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "CreditCardTransaction" ADD COLUMN     "merchant" TEXT,
ADD COLUMN     "reference" TEXT;

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "referenceNumber" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "accountId" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "reference" TEXT;

-- AlterTable
ALTER TABLE "UserBusiness" DROP CONSTRAINT "UserBusiness_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'VIEWER',
ADD CONSTRAINT "UserBusiness_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "CreditCard_bankName_idx" ON "CreditCard"("bankName");

-- CreateIndex
CREATE INDEX "CreditCard_businessId_idx" ON "CreditCard"("businessId");

-- CreateIndex
CREATE INDEX "CreditCardTransaction_creditCardId_idx" ON "CreditCardTransaction"("creditCardId");

-- CreateIndex
CREATE INDEX "CreditCardTransaction_userId_idx" ON "CreditCardTransaction"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalEntry_referenceNumber_key" ON "JournalEntry"("referenceNumber");

-- CreateIndex
CREATE INDEX "Transaction_paymentMethod_idx" ON "Transaction"("paymentMethod");

-- CreateIndex
CREATE INDEX "Transaction_accountId_idx" ON "Transaction"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBusiness_userId_businessId_key" ON "UserBusiness"("userId", "businessId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditCard" ADD CONSTRAINT "CreditCard_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
