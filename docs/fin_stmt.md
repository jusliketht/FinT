# Detailed Prompt for Cursor: Financial Statements Generation System

## Objective
Implement a robust financial statements generation system for the FinT accounting application. This system will enable users to generate key financial reports such as Ledgers, Trial Balance, Profit & Loss Statement, Balance Sheet, and Cash Flow Statement, providing comprehensive insights into their business's financial health.

## Current State Analysis
The existing codebase has:
- Journal Entry and Journal Entry Item models
- Account and AccountHead models
- Transaction model
- Basic `getTrialBalance` placeholder in `AccountsService`
- Multi-business support (from previous phase)

## Implementation Requirements

### 1. Core Financial Reporting Services

#### A. Ledger Service
Create `server/src/accounting/services/ledger.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JournalEntryItem, AccountHead, JournalEntry } from '@prisma/client';

@Injectable()
export class LedgerService {
  constructor(private prisma: PrismaService) {}

  async getAccountLedger(accountId: string, businessId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    // Fetch all journal entry items related to the account within the specified date range and business
    // Calculate running balance for each entry
    // Return a structured ledger report
    const where: any = {
      accountHeadId: accountId,
      JournalEntry: {
        businessId: businessId,
      },
    };

    if (startDate) {
      where.JournalEntry.date = { ...where.JournalEntry.date, gte: startDate };
    }
    if (endDate) {
      where.JournalEntry.date = { ...where.JournalEntry.date, lte: endDate };
    }

    const ledgerEntries = await this.prisma.journalEntryItem.findMany({
      where,
      orderBy: { JournalEntry: { date: 'asc' } },
      include: {
        JournalEntry: true,
        AccountHead: true,
      },
    });

    let runningBalance = 0; // Initial balance, potentially from previous period
    const ledgerReport = ledgerEntries.map(entry => {
      const debit = entry.debitAmount.toNumber();
      const credit = entry.creditAmount.toNumber();
      runningBalance += (debit - credit); // Adjust based on account type (e.g., asset/expense increase with debit)

      return {
        date: entry.JournalEntry.date,
        description: entry.JournalEntry.description,
        debit: debit,
        credit: credit,
        balance: runningBalance,
        journalEntryId: entry.journalEntryId,
        accountHeadName: entry.AccountHead.name,
      };
    });

    return ledgerReport;
  }

  async getLedgerForBusiness(businessId: string, startDate?: Date, endDate?: Date): Promise<any> {
    // Get ledgers for all accounts within a business
    // This might involve iterating through all accounts and calling getAccountLedger
    const accounts = await this.prisma.accountHead.findMany({
      where: {
        // Assuming accounts are linked to businesses or are standard for all businesses
        // This might need adjustment based on how accounts are scoped to businesses
      },
    });

    const allLedgers = {};
    for (const account of accounts) {
      allLedgers[account.name] = await this.getAccountLedger(account.id, businessId, startDate, endDate);
    }
    return allLedgers;
  }
}
```

#### B. Trial Balance Service
Enhance `server/src/accounting/services/accounts.service.ts` or create `trial-balance.service.ts`:

```typescript
// In accounts.service.ts or new trial-balance.service.ts
async getTrialBalance(businessId: string, asOfDate?: Date): Promise<any> {
  // Calculate the closing balance for each account head as of the asOfDate
  // Sum up all debit balances and credit balances
  // Ensure total debits equal total credits

  const journalEntryItems = await this.prisma.journalEntryItem.findMany({
    where: {
      JournalEntry: {
        businessId: businessId,
        date: { lte: asOfDate || new Date() },
      },
    },
    include: {
      AccountHead: true,
    },
  });

  const accountBalances = new Map<string, { debit: number, credit: number, name: string, code: string }>();

  for (const item of journalEntryItems) {
    const accountId = item.accountHeadId;
    if (!accountBalances.has(accountId)) {
      accountBalances.set(accountId, { debit: 0, credit: 0, name: item.AccountHead.name, code: item.AccountHead.code });
    }
    const balance = accountBalances.get(accountId);
    balance.debit += item.debitAmount.toNumber();
    balance.credit += item.creditAmount.toNumber();
  }

  const trialBalance = Array.from(accountBalances.values()).map(acc => {
    const netBalance = acc.debit - acc.credit;
    return {
      accountName: acc.name,
      accountCode: acc.code,
      debit: netBalance > 0 ? netBalance : 0,
      credit: netBalance < 0 ? Math.abs(netBalance) : 0,
    };
  });

  const totalDebits = trialBalance.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredits = trialBalance.reduce((sum, acc) => sum + acc.credit, 0);

  return {
    report: trialBalance,
    totalDebits,
    totalCredits,
    isBalanced: totalDebits === totalCredits,
  };
}
```

#### C. Financial Statements Service
Create `server/src/accounting/services/financial-statements.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AccountHead, AccountCategory } from '@prisma/client';

@Injectable()
export class FinancialStatementsService {
  constructor(private prisma: PrismaService) {}

  async getProfitAndLoss(businessId: string, startDate: Date, endDate: Date): Promise<any> {
    // Calculate total income and total expenses for the period
    // Net Profit/Loss = Total Income - Total Expenses
    const incomeCategory = await this.prisma.accountCategory.findFirst({ where: { name: 'Income' } });
    const expenseCategory = await this.prisma.accountCategory.findFirst({ where: { name: 'Expenses' } });

    if (!incomeCategory || !expenseCategory) {
      throw new Error('Standard Income or Expense categories not found. Please ensure they are set up.');
    }

    const incomeAccounts = await this.prisma.accountHead.findMany({ where: { categoryId: incomeCategory.id } });
    const expenseAccounts = await this.prisma.accountHead.findMany({ where: { categoryId: expenseCategory.id } });

    const incomeAccountIds = incomeAccounts.map(acc => acc.id);
    const expenseAccountIds = expenseAccounts.map(acc => acc.id);

    const incomeTransactions = await this.prisma.journalEntryItem.aggregate({
      where: {
        accountHeadId: { in: incomeAccountIds },
        JournalEntry: {
          businessId: businessId,
          date: { gte: startDate, lte: endDate },
        },
      },
      _sum: { creditAmount: true, debitAmount: true }, // Income increases with credit
    });

    const expenseTransactions = await this.prisma.journalEntryItem.aggregate({
      where: {
        accountHeadId: { in: expenseAccountIds },
        JournalEntry: {
          businessId: businessId,
          date: { gte: startDate, lte: endDate },
        },
      },
      _sum: { debitAmount: true, creditAmount: true }, // Expenses increase with debit
    });

    const totalIncome = (incomeTransactions._sum.creditAmount || 0) - (incomeTransactions._sum.debitAmount || 0);
    const totalExpenses = (expenseTransactions._sum.debitAmount || 0) - (expenseTransactions._sum.creditAmount || 0);

    const netProfitLoss = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netProfitLoss,
    };
  }

  async getBalanceSheet(businessId: string, asOfDate: Date): Promise<any> {
    // Calculate balances for Asset, Liability, and Equity accounts as of asOfDate
    // Assets = Liabilities + Equity
    const assetCategory = await this.prisma.accountCategory.findFirst({ where: { name: 'Assets' } });
    const liabilityCategory = await this.prisma.accountCategory.findFirst({ where: { name: 'Liabilities' } });
    const equityCategory = await this.prisma.accountCategory.findFirst({ where: { name: 'Equity' } });

    if (!assetCategory || !liabilityCategory || !equityCategory) {
      throw new Error('Standard Asset, Liability, or Equity categories not found. Please ensure they are set up.');
    }

    const assetAccounts = await this.prisma.accountHead.findMany({ where: { categoryId: assetCategory.id } });
    const liabilityAccounts = await this.prisma.accountHead.findMany({ where: { categoryId: liabilityCategory.id } });
    const equityAccounts = await this.prisma.accountHead.findMany({ where: { categoryId: equityCategory.id } });

    const getAccountBalance = async (accountId: string, date: Date) => {
      const items = await this.prisma.journalEntryItem.findMany({
        where: {
          accountHeadId: accountId,
          JournalEntry: {
            businessId: businessId,
            date: { lte: date },
          },
        },
      });
      return items.reduce((sum, item) => sum + (item.debitAmount.toNumber() - item.creditAmount.toNumber()), 0);
    };

    let totalAssets = 0;
    for (const acc of assetAccounts) {
      totalAssets += await getAccountBalance(acc.id, asOfDate);
    }

    let totalLiabilities = 0;
    for (const acc of liabilityAccounts) {
      totalLiabilities += await getAccountBalance(acc.id, asOfDate);
    }

    let totalEquity = 0;
    for (const acc of equityAccounts) {
      totalEquity += await getAccountBalance(acc.id, asOfDate);
    }

    // Retained Earnings from P&L for the period up to asOfDate
    const pnlUpToDate = await this.getProfitAndLoss(businessId, new Date(0), asOfDate); // From beginning of time to asOfDate
    totalEquity += pnlUpToDate.netProfitLoss; // Add net profit/loss to equity

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced: totalAssets === (totalLiabilities + totalEquity),
    };
  }

  async getCashFlowStatement(businessId: string, startDate: Date, endDate: Date): Promise<any> {
    // This is a complex report and typically requires direct cash account analysis
    // and categorization of cash inflows/outflows into Operating, Investing, and Financing activities.
    // A simplified approach might involve:
    // 1. Identify cash accounts (e.g., 'Cash', 'Bank')
    // 2. Aggregate cash movements from journal entries related to these accounts
    // 3. Categorize based on associated accounts or transaction descriptions

    // For a basic implementation, we can sum cash inflows and outflows.
    // A more robust solution would require detailed mapping of transactions to cash flow categories.

    const cashAccounts = await this.prisma.accountHead.findMany({
      where: {
        name: { in: ['Cash', 'Bank'] }, // Example: identify cash accounts by name
        // Or by a specific 'cash' type/category if added to AccountHead model
      },
    });

    const cashAccountIds = cashAccounts.map(acc => acc.id);

    const cashMovements = await this.prisma.journalEntryItem.findMany({
      where: {
        accountHeadId: { in: cashAccountIds },
        JournalEntry: {
          businessId: businessId,
          date: { gte: startDate, lte: endDate },
        },
      },
      orderBy: { JournalEntry: { date: 'asc' } },
    });

    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;

    // This categorization logic is highly simplified and would need significant refinement
    // based on actual transaction details and accounting principles.
    for (const movement of cashMovements) {
      const amount = movement.debitAmount.toNumber() - movement.creditAmount.toNumber();
      // Example: simple categorization based on description or associated accounts
      if (movement.JournalEntry.description.toLowerCase().includes('sale') || movement.JournalEntry.description.toLowerCase().includes('revenue')) {
        operatingActivities += amount;
      } else if (movement.JournalEntry.description.toLowerCase().includes('equipment') || movement.JournalEntry.description.toLowerCase().includes('investment')) {
        investingActivities += amount;
      } else if (movement.JournalEntry.description.toLowerCase().includes('loan') || movement.JournalEntry.description.toLowerCase().includes('equity')) {
        financingActivities += amount;
      } else {
        operatingActivities += amount; // Default to operating
      }
    }

    const netCashFlow = operatingActivities + investingActivities + financingActivities;

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFlow,
    };
  }
}
```

### 2. Controllers and DTOs

#### A. Financial Reports Controller
Create `server/src/accounting/controllers/financial-reports.controller.ts`:

```typescript
import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { LedgerService } from '../services/ledger.service';
import { AccountsService } from '../services/accounts.service'; // For Trial Balance
import { FinancialStatementsService } from '../services/financial-statements.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GetReportQueryDto } from '../dto/get-report-query.dto';

@ApiTags('financial-reports')
@ApiBearerAuth()
@Controller('financial-reports')
@UseGuards(JwtAuthGuard)
export class FinancialReportsController {
  constructor(
    private readonly ledgerService: LedgerService,
    private readonly accountsService: AccountsService,
    private readonly financialStatementsService: FinancialStatementsService,
  ) {}

  @Get('ledger/:accountId')
  @ApiOperation({ summary: 'Get ledger for a specific account' })
  @ApiResponse({ status: 200, description: 'Return account ledger' })
  async getAccountLedger(
    @Param('accountId') accountId: string,
    @Query() query: GetReportQueryDto,
    @Request() req,
  ) {
    // Ensure user has access to the business associated with the account
    // For now, assuming businessId is passed in query or derived from user's active business
    const businessId = query.businessId || req.user.activeBusinessId; // Example
    return this.ledgerService.getAccountLedger(accountId, businessId, query.startDate, query.endDate);
  }

  @Get('trial-balance')
  @ApiOperation({ summary: 'Get trial balance' })
  @ApiResponse({ status: 200, description: 'Return trial balance' })
  async getTrialBalance(@Query() query: GetReportQueryDto, @Request() req) {
    const businessId = query.businessId || req.user.activeBusinessId; // Example
    return this.accountsService.getTrialBalance(businessId, query.asOfDate);
  }

  @Get('profit-and-loss')
  @ApiOperation({ summary: 'Get Profit & Loss Statement' })
  @ApiResponse({ status: 200, description: 'Return Profit & Loss Statement' })
  async getProfitAndLoss(@Query() query: GetReportQueryDto, @Request() req) {
    const businessId = query.businessId || req.user.activeBusinessId; // Example
    return this.financialStatementsService.getProfitAndLoss(businessId, query.startDate, query.endDate);
  }

  @Get('balance-sheet')
  @ApiOperation({ summary: 'Get Balance Sheet' })
  @ApiResponse({ status: 200, description: 'Return Balance Sheet' })
  async getBalanceSheet(@Query() query: GetReportQueryDto, @Request() req) {
    const businessId = query.businessId || req.user.activeBusinessId; // Example
    return this.financialStatementsService.getBalanceSheet(businessId, query.asOfDate);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get Cash Flow Statement' })
  @ApiResponse({ status: 200, description: 'Return Cash Flow Statement' })
  async getCashFlowStatement(@Query() query: GetReportQueryDto, @Request() req) {
    const businessId = query.businessId || req.user.activeBusinessId; // Example
    return this.financialStatementsService.getCashFlowStatement(businessId, query.startDate, query.endDate);
  }
}
```

#### B. Report Query DTO
Create `server/src/accounting/dto/get-report-query.dto.ts`:

```typescript
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetReportQueryDto {
  @IsOptional()
  @IsString()
  businessId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsDateString()
  asOfDate?: Date;
}
```

### 3. Frontend Implementation

#### A. Financial Reports Navigation
Update `client/src/components/layout/Sidebar.jsx` to include navigation links for financial reports:

```jsx
// Example addition to Sidebar
<Link to="/reports/ledger">Ledger</Link>
<Link to="/reports/trial-balance">Trial Balance</Link>
<Link to="/reports/profit-and-loss">Profit & Loss</Link>
<Link to="/reports/balance-sheet">Balance Sheet</Link>
<Link to="/reports/cash-flow">Cash Flow</Link>
```

#### B. Report Pages
Create React pages for each financial report:

1.  **LedgerPage** (`client/src/pages/reports/LedgerPage.jsx`):
    -   Account selector dropdown
    -   Date range picker
    -   Display ledger entries in a table
    -   Running balance calculation

2.  **TrialBalancePage** (`client/src/pages/reports/TrialBalancePage.jsx`):
    -   As-of-date picker
    -   Display accounts with debit/credit balances
    -   Total debits and credits, and balance check

3.  **ProfitAndLossPage** (`client/src/pages/reports/ProfitAndLossPage.jsx`):
    -   Date range picker
    -   Display total income, total expenses, and net profit/loss
    -   Breakdown by income/expense accounts

4.  **BalanceSheetPage** (`client/src/pages/reports/BalanceSheetPage.jsx`):
    -   As-of-date picker
    -   Display assets, liabilities, and equity sections
    -   Total assets, total liabilities, total equity, and balance check

5.  **CashFlowPage** (`client/src/pages/reports/CashFlowPage.jsx`):
    -   Date range picker
    -   Display cash flow from operating, investing, and financing activities
    -   Net cash flow

#### C. Report Components
Create reusable React components for displaying report data (e.g., `ReportTable.jsx`, `DateRangePicker.jsx`).

### 4. Integration Points

#### A. Business Context Integration
-   Ensure all financial reports are generated within the context of the currently selected business.
-   Pass `businessId` to backend API calls for reports.

#### B. Data Consistency
-   Ensure that journal entries and account balances are accurately reflected in the financial statements.
-   Handle edge cases like missing data or incomplete periods gracefully.

### 5. Testing Requirements

#### A. Unit Tests
-   Test `LedgerService` for accurate running balance calculations.
-   Test `AccountsService.getTrialBalance` for correct debit/credit sums and balance check.
-   Test `FinancialStatementsService` methods for P&L, Balance Sheet, and Cash Flow calculations.

#### B. Integration Tests
-   Test API endpoints for financial reports.
-   Verify frontend display of reports with sample data.
-   Ensure business context filtering works correctly for all reports.

### 6. Performance Considerations

#### A. Database Queries
-   Optimize Prisma queries for large datasets (e.g., using pagination for ledgers).
-   Ensure proper indexing on `JournalEntryItem` and `JournalEntry` tables for date and account IDs.

#### B. Frontend Rendering
-   Implement pagination or virtualization for large ledger reports.
-   Optimize data fetching to prevent UI freezes.

## Implementation Priority

1.  **Phase 1**: Implement `LedgerService` and its API endpoint.
2.  **Phase 2**: Enhance `AccountsService.getTrialBalance` and its API endpoint.
3.  **Phase 3**: Implement `FinancialStatementsService` for P&L and Balance Sheet, and their API endpoints.
4.  **Phase 4**: Implement `FinancialStatementsService` for Cash Flow Statement and its API endpoint.
5.  **Phase 5**: Develop frontend pages and components for all financial reports.
6.  **Phase 6**: Integrate reports with business context and navigation.

This implementation will provide a comprehensive suite of financial reporting tools, crucial for the FinT application's core accounting functionality.
