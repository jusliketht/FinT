# Cursor Prompt: Fix Backend Compilation Errors

## Goal
Resolve all TypeScript compilation errors in the FinT backend (NestJS) to ensure the server starts successfully and all new functionalities are correctly integrated.

## Problem Analysis

The current compilation errors indicate several issues:
1.  **Missing `PrismaService` Injection**: Many services (e.g., `TaxCalculationService`, `InventoryService`, `PeriodClosingService`, `BankReconciliationService`, `FinancialStatementService`, `JournalEntryService`) are attempting to use `this.prisma` without `PrismaService` being properly injected in their constructors.
2.  **Missing Type Definitions/Imports**: New models (e.g., `TaxRate`, `TaxTransaction`, `BankReconciliation`, `BankReconciliationItem`, `BankStatementLine`, `AccountingPeriod`, `JournalEntryLine`, `InventoryItem`, `InventoryLevel`, `InventoryMovement`, `Location`) are not being recognized, suggesting missing imports or issues with Prisma client generation.
3.  **Duplicate Property Names**: `TaxCalculationService` has `OR` property defined twice in `getApplicableTaxRate` method.
4.  **Incorrect `request.user.id` usage**: In `pdf-statement.controller.ts`, `request.user.id` is used without `request` being properly typed as `Request` from Express, and `id` property might not exist directly on `request.user` without a DTO.
5.  **Missing Constructor Arguments**: `PdfStatementService` is instantiated without its required `accountMappingService` argument in `test-pdf-parsing.ts`.

## Tasks for Cursor

### Task Group 1: Resolve `PrismaService` Injection and Missing Type Issues

**Action:** For each service that uses `this.prisma` but has a compilation error related to it, ensure `PrismaService` is correctly injected in the constructor and imported.

**Example Fix (apply to all affected services like `TaxCalculationService`, `InventoryService`, `PeriodClosingService`, `BankReconciliationService`, `FinancialStatementService`, `JournalEntryService`, etc.):**

**File:** `server/src/accounting/services/tax-calculation.service.ts` (and similar for others)

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Ensure this import path is correct
import { TaxRate, TaxTransaction } from '@prisma/client'; // Ensure these are imported from Prisma Client
// ... other imports

@Injectable()
export class TaxCalculationService {
  constructor(private prisma: PrismaService) {} // Add PrismaService injection

  // ... rest of the service methods
}
```

**Action:** For all new models (e.g., `TaxRate`, `TaxTransaction`, `BankReconciliation`, `BankReconciliationItem`, `BankStatementLine`, `AccountingPeriod`, `JournalEntryLine`, `InventoryItem`, `InventoryLevel`, `InventoryMovement`, `Location`), ensure they are correctly imported from `@prisma/client` in the relevant service and controller files where they are used as types.

**Action:** Run `npx prisma generate` in the `server` directory to regenerate the Prisma client after schema changes. This ensures all new models are available as types.

### Task Group 2: Fix Duplicate Property Name in `TaxCalculationService`

**Action:** In `server/src/accounting/services/tax-calculation.service.ts`, modify the `getApplicableTaxRate` method to correctly use `OR` for filtering, ensuring there are no duplicate property names in the `where` clause.

**File:** `server/src/accounting/services/tax-calculation.service.ts`

```typescript
// ... existing code

  private async getApplicableTaxRate(
    taxType: string,
    businessId?: string
  ): Promise<TaxRate | null> {
    return this.prisma.taxRate.findFirst({
      where: {
        type: taxType,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        effectiveTo: { 
          // Combine effectiveTo conditions correctly
          OR: [
            { equals: null },
            { gte: new Date() }
          ]
        },
        // Use a single OR for businessId filtering
        OR: [
          { businessId: businessId },
          { businessId: null } // Global tax rates
        ]
      },
      orderBy: [
        { businessId: 'desc' }, // Prefer business-specific rates
        { effectiveFrom: 'desc' }
      ]
    });
  }

// ... rest of the service
```

### Task Group 3: Correct `request.user.id` Usage in Controllers

**Action:** In `server/src/pdf-statement/pdf-statement.controller.ts` and any other controllers where `request.user.id` is used, ensure `request` is typed as `Request` from `express` and that the `User` object attached to `request.user` has an `id` property. If `id` is not directly on `request.user`, adjust to access it from a DTO or interface.

**File:** `server/src/pdf-statement/pdf-statement.controller.ts`

```typescript
import { Controller, Post, UseGuards, Req, Body, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Adjust path if necessary
import { PdfStatementService } from './pdf-statement.service';
import { Request } from 'express'; // Import Request from express

interface AuthenticatedRequest extends Request {
  user: { id: string; email: string; /* ... other user properties */ }; // Define user type
}

@Controller('pdf-statement')
export class PdfStatementController {
  constructor(private readonly pdfStatementService: PdfStatementService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('password') password?: string,
    @Body('businessId') businessId?: string,
    @Req() req: AuthenticatedRequest // Use the custom interface
  ) {
    // ... existing logic
    const userId = req.user.id; // Access userId correctly
    // ...
  }

  // ... other methods
}
```

### Task Group 4: Fix Missing Constructor Argument in `test-pdf-parsing.ts`

**Action:** In `server/src/pdf-statement/test-pdf-parsing.ts`, provide the required `AccountMappingService` argument when instantiating `PdfStatementService`.

**File:** `server/src/pdf-statement/test-pdf-parsing.ts`

```typescript
import { PdfStatementService } from './pdf-statement.service';
import { AccountMappingService } from '../accounting/services/account-mapping.service'; // Import the service
import { PrismaService } from '../prisma/prisma.service'; // Import PrismaService if needed by AccountMappingService

// Instantiate PrismaService and AccountMappingService if they are dependencies
const prismaService = new PrismaService();
const accountMappingService = new AccountMappingService(prismaService); // Pass required dependencies

const service = new PdfStatementService(accountMappingService); // Provide the argument

// ... rest of the test file
```

## Execution Steps for Cursor

1.  **Review and Apply Changes**: Go through each specified file and apply the suggested code modifications.
2.  **Regenerate Prisma Client**: After making schema-related changes or adding new models, navigate to the `server` directory and run `npx prisma generate`.
3.  **Install Dependencies**: Ensure all new dependencies are installed by running `npm install` in the `server` directory.
4.  **Attempt to Start Server**: Run `npm run start:dev` in the `server` directory to verify that all compilation errors are resolved and the server starts successfully.
5.  **Iterate**: If new errors appear, analyze them and apply further fixes until the server starts without compilation issues.

This prompt provides clear, actionable steps to resolve the current backend compilation errors. Focus on systematic application of these fixes.
