-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "gstAmount" DOUBLE PRECISION,
ADD COLUMN     "gstRate" DOUBLE PRECISION,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "isInterState" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMsmeVendor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "placeOfSupply" TEXT,
ADD COLUMN     "tdsAmount" DOUBLE PRECISION,
ADD COLUMN     "tdsRate" DOUBLE PRECISION,
ADD COLUMN     "tdsSection" TEXT,
ADD COLUMN     "vendorName" TEXT;

-- CreateIndex
CREATE INDEX "JournalEntry_gstin_idx" ON "JournalEntry"("gstin");

-- CreateIndex
CREATE INDEX "JournalEntry_tdsSection_idx" ON "JournalEntry"("tdsSection");

-- CreateIndex
CREATE INDEX "JournalEntry_hsnCode_idx" ON "JournalEntry"("hsnCode");
