import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FinancialStatementsService {
  async getIncomeStatement(businessId: string, startDate: Date, endDate: Date): Promise<any> {
    // Get account balances for the period using journal entry lines
    const accountBalances = await this.getAccountBalances(businessId, endDate, startDate);
    
    const revenue = accountBalances.filter(a => a.type === 'REVENUE');
    const expenses = accountBalances.filter(a => a.type === 'EXPENSE');
    
    const totalRevenue = this.sumBalances(revenue);
    const totalExpenses = this.sumBalances(expenses);
    
    return {
      fromDate: startDate,
      toDate: endDate,
      revenue: this.groupAccountsByCategory(revenue),
      expenses: this.groupAccountsByCategory(expenses),
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses
    };
  }

  async getBalanceSheet(businessId: string, asOfDate: Date): Promise<any> {
    // Get account balances as of the specified date using journal entry lines
    const accountBalances = await this.getAccountBalances(businessId, asOfDate);
    
    const assets = accountBalances.filter(a => a.type === 'ASSET');
    const liabilities = accountBalances.filter(a => a.type === 'LIABILITY');
    const equity = accountBalances.filter(a => a.type === 'EQUITY');
    
    return {
      asOfDate,
      assets: this.groupAccountsByCategory(assets),
      liabilities: this.groupAccountsByCategory(liabilities),
      equity: this.groupAccountsByCategory(equity),
      totalAssets: this.sumBalances(assets),
      totalLiabilities: this.sumBalances(liabilities),
      totalEquity: this.sumBalances(equity)
    };
  }

  async getCashFlowStatement(businessId: string, startDate: Date, endDate: Date): Promise<any> {
    // Get cash account balances for the period
    const cashAccounts = await prisma.accountHead.findMany({
      where: {
        name: { contains: 'Cash' },
        businessId: businessId
      }
    });

    const cashAccountIds = cashAccounts.map(acc => acc.id);

    // Get cash movements from journal entry lines
    const cashMovements = await prisma.journalEntryLine.findMany({
      where: {
        accountId: { in: cashAccountIds },
        JournalEntry: {
          businessId: businessId,
          date: { gte: startDate, lte: endDate }
        }
      },
      include: {
        JournalEntry: {
          select: { description: true, date: true }
        }
      },
      orderBy: {
        JournalEntry: { date: 'asc' }
      }
    });

    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;

    for (const movement of cashMovements) {
      const description = movement.JournalEntry.description.toLowerCase();
      const netAmount = movement.debitAmount - movement.creditAmount;
      
      if (description.includes('sale') || description.includes('revenue')) {
        operatingActivities += netAmount;
      } else if (description.includes('equipment') || description.includes('investment')) {
        investingActivities += netAmount;
      } else if (description.includes('loan') || description.includes('equity')) {
        financingActivities += netAmount;
      } else {
        operatingActivities += netAmount;
      }
    }

    const netCashFlow = operatingActivities + investingActivities + financingActivities;

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFlow,
      period: {
        startDate,
        endDate
      }
    };
  }

  private async getAccountBalances(
    businessId: string, 
    asOfDate: Date, 
    fromDate?: Date
  ): Promise<any[]> {
    // Query to get account balances from journal entry lines
    const whereClause = fromDate ? 
      `je.date BETWEEN '${fromDate.toISOString()}' AND '${asOfDate.toISOString()}'` :
      `je.date <= '${asOfDate.toISOString()}'`;

    return prisma.$queryRaw`
      SELECT 
        a.id,
        a.code,
        a.name,
        a.type,
        COALESCE(SUM(jel."debitAmount") - SUM(jel."creditAmount"), 0) as balance
      FROM "AccountHead" a
      LEFT JOIN "JournalEntryLine" jel ON a.id = jel."accountId"
      LEFT JOIN "JournalEntry" je ON jel."journalEntryId" = je.id
      WHERE (je."businessId" = ${businessId} OR je."businessId" IS NULL)
        AND ${whereClause}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `;
  }

  private sumBalances(accounts: any[]): number {
    return accounts.reduce((sum, account) => sum + parseFloat(account.balance || 0), 0);
  }

  private groupAccountsByCategory(accounts: any[]): any[] {
    const grouped = {};
    
    accounts.forEach(account => {
      const category = account.code.substring(0, 2) + '00'; // Get category code
      if (!grouped[category]) {
        grouped[category] = {
          categoryCode: category,
          categoryName: this.getCategoryName(category),
          accounts: []
        };
      }
      grouped[category].accounts.push(account);
    });
    
    return Object.values(grouped);
  }

  async getTrialBalance(businessId: string, asOfDate: Date): Promise<any[]> {
    // Generate trial balance from journal entry lines
    const balances = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.code,
        a.name,
        a.type,
        COALESCE(SUM(jel."debitAmount"), 0) as totalDebits,
        COALESCE(SUM(jel."creditAmount"), 0) as totalCredits,
        (COALESCE(SUM(jel."debitAmount"), 0) - COALESCE(SUM(jel."creditAmount"), 0)) as balance
      FROM "AccountHead" a
      LEFT JOIN "JournalEntryLine" jel ON a.id = jel."accountId"
      LEFT JOIN "JournalEntry" je ON jel."journalEntryId" = je.id
      WHERE (je."businessId" = ${businessId} OR je."businessId" IS NULL)
        AND je.date <= ${asOfDate}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `;
    
    return balances;
  }

  private getCategoryName(categoryCode: string): string {
    const categoryMap = {
      '10': 'Current Assets',
      '12': 'Non-Current Assets',
      '21': 'Current Liabilities',
      '22': 'Non-Current Liabilities',
      '31': 'Owner\'s Equity',
      '32': 'Retained Earnings',
      '41': 'Sales Revenue',
      '42': 'Other Income',
      '51': 'Cost of Goods Sold',
      '52': 'Operating Expenses',
      '53': 'Administrative Expenses',
      '54': 'Financial Expenses'
    };
    
    return categoryMap[categoryCode] || 'Other';
  }
} 