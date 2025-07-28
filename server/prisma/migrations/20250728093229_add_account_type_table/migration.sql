-- CreateTable
CREATE TABLE "AccountType" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountType_value_key" ON "AccountType"("value");

-- CreateIndex
CREATE INDEX "AccountType_value_idx" ON "AccountType"("value");

-- CreateIndex
CREATE INDEX "AccountType_isActive_idx" ON "AccountType"("isActive");
