/*
  Warnings:

  - You are about to drop the column `balanceAmount` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `billDate` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `BillItem` table. All the data in the column will be lost.
  - You are about to drop the column `balanceAmount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `terms` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `InvoiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `isAdjusting` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `isReversed` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `reference` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `reversalEntryId` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `JournalEntry` table. All the data in the column will be lost.
  - You are about to drop the column `creditAmount` on the `JournalEntryLine` table. All the data in the column will be lost.
  - You are about to drop the column `debitAmount` on the `JournalEntryLine` table. All the data in the column will be lost.
  - You are about to drop the column `isThirdParty` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `thirdPartyName` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `thirdPartyType` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `transactionType` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `resetToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetTokenExpiry` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AccountCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountHead` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BillPayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditCardTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Customer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvoicePayment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MappingRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reconciliation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReconciliationStatementLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThirdParty` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Vendor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[billNumber]` on the table `Bill` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vendorName` to the `Bill` table without a default value. This is not possible if the table is not empty.
  - Made the column `businessId` on table `Bill` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `totalPrice` to the `BillItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Made the column `businessId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `totalPrice` to the `InvoiceItem` table without a default value. This is not possible if the table is not empty.
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
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Bill" DROP CONSTRAINT "Bill_vendorId_fkey";

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
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_customerId_fkey";

-- DropForeignKey
ALTER TABLE "InvoicePayment" DROP CONSTRAINT "InvoicePayment_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "InvoicePayment" DROP CONSTRAINT "InvoicePayment_userId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntry" DROP CONSTRAINT "JournalEntry_reversalEntryId_fkey";

-- DropForeignKey
ALTER TABLE "JournalEntryLine" DROP CONSTRAINT "JournalEntryLine_accountId_fkey";

-- DropForeignKey
ALTER TABLE "MappingRule" DROP CONSTRAINT "MappingRule_accountId_fkey";

-- DropForeignKey
ALTER TABLE "MappingRule" DROP CONSTRAINT "MappingRule_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reconciliation" DROP CONSTRAINT "Reconciliation_accountId_fkey";

-- DropForeignKey
ALTER TABLE "Reconciliation" DROP CONSTRAINT "Reconciliation_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Reconciliation" DROP CONSTRAINT "Reconciliation_userId_fkey";

-- DropForeignKey
ALTER TABLE "ReconciliationStatementLine" DROP CONSTRAINT "ReconciliationStatementLine_reconciliationId_fkey";

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
DROP INDEX "Bill_vendorId_idx";

-- DropIndex
DROP INDEX "Invoice_customerId_idx";

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
ALTER TABLE "Bill" DROP COLUMN "balanceAmount",
DROP COLUMN "billDate",
DROP COLUMN "discountAmount",
DROP COLUMN "paidAmount",
ADD COLUMN     "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "vendorAddress" TEXT,
ADD COLUMN     "vendorEmail" TEXT,
ADD COLUMN     "vendorName" TEXT NOT NULL,
ADD COLUMN     "vendorPhone" TEXT,
ALTER COLUMN "vendorId" DROP NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'DRAFT',
ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "businessId" SET NOT NULL;

-- AlterTable
ALTER TABLE "BillItem" DROP COLUMN "amount",
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "balanceAmount",
DROP COLUMN "discountAmount",
DROP COLUMN "paidAmount",
DROP COLUMN "terms",
ADD COLUMN     "customerAddress" TEXT,
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT,
ALTER COLUMN "customerId" DROP NOT NULL,
ALTER COLUMN "issueDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "subtotal" SET DEFAULT 0,
ALTER COLUMN "totalAmount" SET DEFAULT 0,
ALTER COLUMN "businessId" SET NOT NULL;

-- AlterTable
ALTER TABLE "InvoiceItem" DROP COLUMN "amount",
ADD COLUMN     "totalPrice" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "JournalEntry" DROP COLUMN "isAdjusting",
DROP COLUMN "isReversed",
DROP COLUMN "reference",
DROP COLUMN "reversalEntryId",
DROP COLUMN "totalAmount",
ADD COLUMN     "billId" TEXT,
ADD COLUMN     "invoiceId" TEXT,
ADD COLUMN     "referenceNumber" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "JournalEntryLine" DROP COLUMN "creditAmount",
DROP COLUMN "debitAmount",
ADD COLUMN     "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "debit" DOUBLE PRECISION NOT NULL DEFAULT 0;

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
DROP COLUMN "role",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "gstRegistrationNumber" TEXT,
ADD COLUMN     "pan" TEXT;

-- DropTable
DROP TABLE "AccountCategory";

-- DropTable
DROP TABLE "AccountHead";

-- DropTable
DROP TABLE "BillPayment";

-- DropTable
DROP TABLE "CreditCard";

-- DropTable
DROP TABLE "CreditCardTransaction";

-- DropTable
DROP TABLE "Customer";

-- DropTable
DROP TABLE "InvoicePayment";

-- DropTable
DROP TABLE "MappingRule";

-- DropTable
DROP TABLE "Reconciliation";

-- DropTable
DROP TABLE "ReconciliationStatementLine";

-- DropTable
DROP TABLE "ThirdParty";

-- DropTable
DROP TABLE "Vendor";

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'EACH',
    "costMethod" TEXT NOT NULL DEFAULT 'FIFO',
    "reorderLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reorderQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryLevel" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unitCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "movementType" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION,
    "totalValue" DOUBLE PRECISION,
    "referenceId" TEXT,
    "description" TEXT,
    "movementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'WAREHOUSE',
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL,
    "poNumber" TEXT NOT NULL,
    "vendorId" TEXT,
    "vendorName" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitCost" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "receivedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL,
    "soNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "customerName" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "businessId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL,
    "salesOrderId" TEXT NOT NULL,
    "inventoryItemId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "shippedQuantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InventoryItem_sku_key" ON "InventoryItem"("sku");

-- CreateIndex
CREATE INDEX "InventoryItem_businessId_idx" ON "InventoryItem"("businessId");

-- CreateIndex
CREATE INDEX "InventoryItem_sku_idx" ON "InventoryItem"("sku");

-- CreateIndex
CREATE INDEX "InventoryItem_category_idx" ON "InventoryItem"("category");

-- CreateIndex
CREATE INDEX "InventoryLevel_inventoryItemId_idx" ON "InventoryLevel"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryLevel_locationId_idx" ON "InventoryLevel"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryLevel_inventoryItemId_locationId_key" ON "InventoryLevel"("inventoryItemId", "locationId");

-- CreateIndex
CREATE INDEX "InventoryMovement_inventoryItemId_idx" ON "InventoryMovement"("inventoryItemId");

-- CreateIndex
CREATE INDEX "InventoryMovement_locationId_idx" ON "InventoryMovement"("locationId");

-- CreateIndex
CREATE INDEX "InventoryMovement_movementType_idx" ON "InventoryMovement"("movementType");

-- CreateIndex
CREATE INDEX "InventoryMovement_movementDate_idx" ON "InventoryMovement"("movementDate");

-- CreateIndex
CREATE INDEX "InventoryMovement_businessId_idx" ON "InventoryMovement"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE INDEX "Location_businessId_idx" ON "Location"("businessId");

-- CreateIndex
CREATE INDEX "Location_code_idx" ON "Location"("code");

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
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- CreateIndex
CREATE INDEX "Bill_issueDate_idx" ON "Bill"("issueDate");

-- CreateIndex
CREATE INDEX "Invoice_issueDate_idx" ON "Invoice"("issueDate");

-- CreateIndex
CREATE INDEX "JournalEntry_status_idx" ON "JournalEntry"("status");

-- CreateIndex
CREATE INDEX "JournalEntry_invoiceId_idx" ON "JournalEntry"("invoiceId");

-- CreateIndex
CREATE INDEX "JournalEntry_billId_idx" ON "JournalEntry"("billId");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_pan_idx" ON "User"("pan");

-- CreateIndex
CREATE INDEX "User_gstRegistrationNumber_idx" ON "User"("gstRegistrationNumber");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntryLine" ADD CONSTRAINT "JournalEntryLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLevel" ADD CONSTRAINT "InventoryLevel_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryLevel" ADD CONSTRAINT "InventoryLevel_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_inventoryItemId_fkey" FOREIGN KEY ("inventoryItemId") REFERENCES "InventoryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
