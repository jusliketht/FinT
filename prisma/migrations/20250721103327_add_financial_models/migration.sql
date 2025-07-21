/*
  Warnings:

  - You are about to drop the column `averageCost` on the `InventoryLevel` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `InventoryLevel` table. All the data in the column will be lost.
  - You are about to drop the column `quantityAvailable` on the `InventoryLevel` table. All the data in the column will be lost.
  - You are about to drop the column `quantityOnHand` on the `InventoryLevel` table. All the data in the column will be lost.
  - You are about to drop the column `quantityReserved` on the `InventoryLevel` table. All the data in the column will be lost.
  - You are about to drop the column `itemId` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `referenceType` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `totalCost` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `InventoryMovement` table. All the data in the column will be lost.
  - You are about to drop the column `accountingPeriodId` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `isAdjusting` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `isClosing` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `isReversed` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `reversalEntryId` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `creditAmount` on the `JournalEntryLine` table. All the data in the column will be lost.
  - You are about to drop the column `debitAmount` on the `JournalEntryLine` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantityOrdered` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantityReceived` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `SalesOrder` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SalesOrder` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `SalesOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantityOrdered` on the `SalesOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantityShipped` on the `SalesOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `SalesOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `isThirdParty` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `thirdPartyName` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `thirdPartyType` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionType` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AccountCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountHead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountingPeriod` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BankReconciliation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BankReconciliationItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BankStatement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BankStatementLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Bill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BillItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BillPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditCardTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvoiceItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvoicePayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MappingRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reconciliation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReconciliationStatementLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaxTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThirdParty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[inventoryItemId,locationId]` on the table `InventoryLevel` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[poNumber]` on the table `PurchaseOrder` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[soNumber]` on the table `SalesOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `inventoryItemId` to the `InventoryLevel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InventoryLevel` table without a default value. This is not possible if the table is not empty.
  - Made the column `locationId` on table `InventoryLevel` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `inventoryItemId` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `InventoryMovement` table without a default value. This is not possible if the table is not empty.
  - Made the column `locationId` on table `InventoryMovement` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `poNumber` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorName` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalCost` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitCost` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `inventoryItemId` on table `PurchaseOrderItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `customerName` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `soNumber` to the `SalesOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `SalesOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `SalesOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SalesOrderItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `inventoryItemId` on table `SalesOrderItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `accountId` on table `Transaction` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "AccountHead" DROP CONSTRAINT "AccountHead_businessId_fkey";

-- DropForeignKey
ALTER TABLE "AccountHead" DROP CONSTRAINT "AccountHead_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "AccountHead" DROP CONSTRAINT "AccountHead_parentId_fkey";

-- DropForeignKey
ALTER TABLE "AccountingPeriod" DROP CONSTRAINT "AccountingPeriod_businessId_fkey";

-- DropForeignKey
ALTER TABLE "AccountingPeriod" DROP CONSTRAINT "AccountingPeriod_closedBy_fkey";

-- DropForeignKey
ALTER TABLE "BankReconciliation" DROP CONSTRAINT "BankReconciliation_accountId_fkey";

-- DropForeignKey
ALTER TABLE "BankReconciliation" DROP CONSTRAINT "BankReconciliation_bankStatementId_fkey";

-- DropForeignKey
ALTER TABLE "BankReconciliation" DROP CONSTRAINT "BankReconciliation_businessId_fkey";

-- DropForeignKey
ALTER TABLE "BankReconciliation" DROP CONSTRAINT "BankReconciliation_userId_fkey";

-- DropForeignKey
ALTER TABLE "BankReconciliationItem" DROP CONSTRAINT "BankReconciliationItem_reconciliationId_fkey";

-- DropForeignKey
ALTER TABLE "BankReconciliationItem" DROP CONSTRAINT "BankReconciliationItem_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "BankStatement" DROP CONSTRAINT "BankStatement_businessId_fkey";

-- DropForeignKey
ALTER TABLE "BankStatement" DROP CONSTRAINT "BankStatement_userId_fkey";

-- DropForeignKey
ALTER TABLE "BankStatementLine" DROP CONSTRAINT "BankStatementLine_bankStatementId_fkey";

-- DropForeignKey
ALTER TABLE "BankStatementLine" DROP CONSTRAINT "BankStatementLine_matchedTransactionId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_userId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "BillItem" DROP CONSTRAINT "BillItem_billId_fkey";

-- DropForeignKey
ALTER TABLE "BillItem" DROP CONSTRAINT "BillItem_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "BillPayment" DROP CONSTRAINT "BillPayment_billId_fkey";

-- DropForeignKey
ALTER TABLE "BillPayment" DROP CONSTRAINT "BillPayment_userId_fkey";

-- DropForeignKey
ALTER TABLE "CreditCard" DROP CONSTRAINT "CreditCard_businessId_fkey";

-- DropForeignKey
ALTER TABLE "CreditCard" DROP CONSTRAINT "CreditCard_userId_fkey";

-- DropForeignKey
ALTER TABLE "CreditCardTransaction" DROP CONSTRAINT "CreditCardTransaction_creditCardId_fkey";

-- DropForeignKey
ALTER TABLE "CreditCardTransaction" DROP CONSTRAINT "CreditCardTransaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Customer" DROP CONSTRAINT "Customer_userId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryLevel" DROP CONSTRAINT "InventoryLevel_itemId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryLevel" DROP CONSTRAINT "InventoryLevel_locationId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_itemId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_locationId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_userId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_userId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "InvoicePayment" DROP CONSTRAINT "InvoicePayment_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "InvoicePayment" DROP CONSTRAINT "InvoicePayment_userId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_accountingPeriodId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_reversalEntryId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntryLine" DROP CONSTRAINT "JournalEntryLine_accountId_fkey";

-- DropForeignKey
ALTER TABLE "MappingRule" DROP CONSTRAINT "MappingRule_accountId_fkey";

-- DropForeignKey
ALTER TABLE "MappingRule" DROP CONSTRAINT "MappingRule_userId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Reconciliation" DROP CONSTRAINT "Reconciliation_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Reconciliation" DROP CONSTRAINT "Reconciliation_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Reconciliation" DROP CONSTRAINT "Reconciliation_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReconciliationStatementLine" DROP CONSTRAINT "ReconciliationStatementLine_reconciliationId_fkey";

-- DropForeignKey
ALTER TABLE "SalesOrder" DROP CONSTRAINT "SalesOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "SalesOrderItem" DROP CONSTRAINT "SalesOrderItem_inventoryItemId_fkey";

-- DropForeignKey
ALTER TABLE "SalesOrderItem" DROP CONSTRAINT "SalesOrderItem_salesOrderId_fkey";

-- DropForeignKey
ALTER TABLE "TaxRate" DROP CONSTRAINT "TaxRate_businessId_fkey";

-- DropForeignKey
ALTER TABLE "TaxTransaction" DROP CONSTRAINT "TaxTransaction_taxRateId_fkey";

-- DropForeignKey
ALTER TABLE "TaxTransaction" DROP CONSTRAINT "TaxTransaction_transactionId_fkey";

-- DropForeignKey
ALTER TABLE "ThirdParty" DROP CONSTRAINT "ThirdParty_businessId_fkey";

-- DropForeignKey
ALTER TABLE "ThirdParty" DROP CONSTRAINT "ThirdParty_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_thirdPartyId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- DropIndex
DROP INDEX "Account_code_key";

-- DropIndex
DROP INDEX "InventoryLevel_itemId_idx";

-- DropIndex
DROP INDEX "InventoryLevel_itemId_locationId_key";

-- DropIndex
DROP INDEX "InventoryMovement_itemId_idx";

-- DropIndex
DROP INDEX "JournalEntry_accountingPeriodId_idx";

-- DropIndex
DROP INDEX "PurchaseOrder_orderNumber_key";

-- DropIndex
DROP INDEX "SalesOrder_orderNumber_key";

-- DropIndex
DROP INDEX "Transaction_accountId_idx";

-- DropIndex
DROP INDEX "Transaction_isThirdParty_idx";

-- DropIndex
DROP INDEX "Transaction_paymentMethod_idx";

-- DropIndex
DROP INDEX "Transaction_thirdPartyType_idx";

-- DropIndex
DROP INDEX "Transaction_transactionType_idx";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InventoryLevel" DROP COLUMN "averageCost",
DROP COLUMN "itemId",
DROP COLUMN "quantityAvailable",
DROP COLUMN "quantityOnHand",
DROP COLUMN "quantityReserved",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "inventoryItemId" TEXT NOT NULL,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "locationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "InventoryMovement" DROP COLUMN "itemId",
DROP COLUMN "referenceType",
DROP COLUMN "totalCost",
DROP COLUMN "userId",
ADD COLUMN     "inventoryItemId" TEXT NOT NULL,
ADD COLUMN     "totalValue" DOUBLE PRECISION,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "locationId" SET NOT NULL;

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "accountingPeriodId",
DROP COLUMN "isAdjusting",
DROP COLUMN "isClosing",
DROP COLUMN "isReversed",
DROP COLUMN "reference",
DROP COLUMN "reversalEntryId",
DROP COLUMN "totalAmount",
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "JournalEntryLine" DROP COLUMN "creditAmount",
DROP COLUMN "debitAmount",
ADD COLUMN     "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "debit" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "orderNumber",
DROP COLUMN "supplierId",
DROP COLUMN "userId",
ADD COLUMN     "expectedDate" TIMESTAMP(3),
ADD COLUMN     "poNumber" TEXT NOT NULL,
ADD COLUMN     "vendorId" TEXT,
ADD COLUMN     "vendorName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "description",
DROP COLUMN "quantityOrdered",
DROP COLUMN "quantityReceived",
DROP COLUMN "totalAmount",
DROP COLUMN "unitPrice",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "receivedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unitCost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "inventoryItemId" SET NOT NULL;

-- AlterTable
ALTER TABLE "SalesOrder" DROP COLUMN "orderNumber",
DROP COLUMN "userId",
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "expectedDate" TIMESTAMP(3),
ADD COLUMN     "soNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SalesOrderItem" DROP COLUMN "description",
DROP COLUMN "quantityOrdered",
DROP COLUMN "quantityShipped",
DROP COLUMN "totalAmount",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "shippedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "inventoryItemId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isThirdParty",
DROP COLUMN "thirdPartyName",
DROP COLUMN "thirdPartyType",
DROP COLUMN "transactionType",
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "accountId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetToken",
DROP COLUMN "resetTokenExpiry",
DROP COLUMN "role";

-- DropTable
DROP TABLE "AccountCategory";

-- DropTable
DROP TABLE "AccountHead";

-- DropTable
DROP TABLE "AccountingPeriod";

-- DropTable
DROP TABLE "BankReconciliation";

-- DropTable
DROP TABLE "BankReconciliationItem";

-- DropTable
DROP TABLE "BankStatement";

-- DropTable
DROP TABLE "BankStatementLine";

-- DropTable
DROP TABLE "Bill";

-- DropTable
DROP TABLE "BillItem";

-- DropTable
DROP TABLE "BillPayment";

-- DropTable
DROP TABLE "CreditCard";

-- DropTable
DROP TABLE "CreditCardTransaction";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "InvoiceItem";

-- DropTable
DROP TABLE "InvoicePayment";

-- DropTable
DROP TABLE "MappingRule";

-- DropTable
DROP TABLE "Reconciliation";

-- DropTable
DROP TABLE "ReconciliationStatementLine";

-- DropTable
DROP TABLE "TaxRate";

-- DropTable
DROP TABLE "TaxTransaction";

-- DropTable
DROP TABLE "ThirdParty";

-- DropTable
DROP TABLE "Vendor";

-- CreateIndex
CREATE INDEX "InventoryLevel_inventoryItemId_idx" ON "InventoryLevel"("inventoryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLevel_inventoryItemId_locationId_key" ON "InventoryLevel"("inventoryItemId", "locationId");

-- CreateIndex
CREATE INDEX "InventoryMovement_inventoryItemId_idx" ON "InventoryMovement"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryMovement_locationId_idx" ON "InventoryMovement"("locationId");

-- CreateIndex
CREATE INDEX "JournalEntry_status_idx" ON "JournalEntry"("status");

-- CreateIndex
CREATE INDEX "Location_type_idx" ON "Location"("type");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_poNumber_key" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_businessId_idx" ON "PurchaseOrder"("businessId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_poNumber_idx" ON "PurchaseOrder"("poNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrder_orderDate_idx" ON "PurchaseOrder"("orderDate");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_purchaseOrderId_idx" ON "PurchaseOrderItem"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_inventoryItemId_idx" ON "PurchaseOrderItem"("inventoryItemId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_soNumber_key" ON "SalesOrder"("soNumber");

-- CreateIndex
CREATE INDEX "SalesOrder_businessId_idx" ON "SalesOrder"("businessId");

-- CreateIndex
CREATE INDEX "SalesOrder_soNumber_idx" ON "SalesOrder"("soNumber");

-- CreateIndex
CREATE INDEX "SalesOrder_status_idx" ON "SalesOrder"("status");

-- CreateIndex
CREATE INDEX "SalesOrder_orderDate_idx" ON "SalesOrder"("orderDate");

-- CreateIndex
CREATE INDEX "SalesOrderItem_salesOrderId_idx" ON "SalesOrderItem"("salesOrderId");

-- CreateIndex
CREATE INDEX "SalesOrderItem_inventoryItemId_idx" ON "SalesOrderItem"("inventoryItemId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLevel" ADD CONSTRAINT "InventoryLevel_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLevel" ADD CONSTRAINT "InventoryLevel_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
