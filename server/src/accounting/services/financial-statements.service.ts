import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class FinancialStatementsService {
  async getProfitAndLoss(businessId: string, startDate: Date, endDate: Date): Promise<any> {
    const incomeCategory = await prisma.accountCategory.findFirst({ where: { name: 'Revenue' } });
    const expenseCategory = await prisma.accountCategory.findFirst({ where: { name: 'Expenses' } });

    if (!incomeCategory || !expenseCategory) {
      throw new Error('Standard Revenue or Expenses categories not found. Please ensure they are set up.');
    }

    const incomeAccounts = await prisma.accountHead.findMany({ where: { categoryId: incomeCategory.id } });
    const expenseAccounts = await prisma.accountHead.findMany({ where: { categoryId: expenseCategory.id } });

    const incomeAccountIds = incomeAccounts.map(acc => acc.id);
    const expenseAccountIds = expenseAccounts.map(acc => acc.id);

    const incomeTransactions = await prisma.journalEntry.aggregate({
      where: {
        creditAccountId: { in: incomeAccountIds },
        businessId: businessId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const expenseTransactions = await prisma.journalEntry.aggregate({
      where: {
        debitAccountId: { in: expenseAccountIds },
        businessId: businessId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const totalIncome = incomeTransactions._sum.amount || 0;
    const totalExpenses = expenseTransactions._sum.amount || 0;

    const netProfitLoss = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netProfitLoss,
      period: {
        startDate,
        endDate
      }
    };
  }

  async getBalanceSheet(businessId: string, asOfDate: Date): Promise<any> {
    const assetCategory = await prisma.accountCategory.findFirst({ where: { name: 'Assets' } });
    const liabilityCategory = await prisma.accountCategory.findFirst({ where: { name: 'Liabilities' } });
    const equityCategory = await prisma.accountCategory.findFirst({ where: { name: 'Equity' } });

    if (!assetCategory || !liabilityCategory || !equityCategory) {
      throw new Error('Standard Asset, Liability, or Equity categories not found. Please ensure they are set up.');
    }

    const assetAccounts = await prisma.accountHead.findMany({ where: { categoryId: assetCategory.id } });
    const liabilityAccounts = await prisma.accountHead.findMany({ where: { categoryId: liabilityCategory.id } });
    const equityAccounts = await prisma.accountHead.findMany({ where: { categoryId: equityCategory.id } });

    const getAccountBalance = async (accountId: string, date: Date) => {
      const debitEntries = await prisma.journalEntry.aggregate({
        where: {
          debitAccountId: accountId,
          businessId: businessId,
          date: { lte: date },
        },
        _sum: { amount: true },
      });

      const creditEntries = await prisma.journalEntry.aggregate({
        where: {
          creditAccountId: accountId,
          businessId: businessId,
          date: { lte: date },
        },
        _sum: { amount: true },
      });

      const debitTotal = debitEntries._sum.amount || 0;
      const creditTotal = creditEntries._sum.amount || 0;
      
      return debitTotal - creditTotal;
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
    const pnlUpToDate = await this.getProfitAndLoss(businessId, new Date(0), asOfDate);
    totalEquity += pnlUpToDate.netProfitLoss;

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      isBalanced: totalAssets === (totalLiabilities + totalEquity),
      asOfDate
    };
  }

  async getCashFlowStatement(businessId: string, startDate: Date, endDate: Date): Promise<any> {
    const cashAccounts = await prisma.accountHead.findMany({
      where: {
        name: { in: ['Cash', 'Bank'] },
      },
    });

    const cashAccountIds = cashAccounts.map(acc => acc.id);

    const cashMovements = await prisma.journalEntry.findMany({
      where: {
        OR: [
          { debitAccountId: { in: cashAccountIds } },
          { creditAccountId: { in: cashAccountIds } }
        ],
        businessId: businessId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
      include: {
        debitAccount: true,
        creditAccount: true,
      }
    });

    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;

    for (const movement of cashMovements) {
      const description = movement.description.toLowerCase();
      let amount = 0;
      
      // Determine if this is a cash inflow or outflow
      if (cashAccountIds.includes(movement.debitAccountId)) {
        // Cash is being debited (outflow)
        amount = -movement.amount;
      } else if (cashAccountIds.includes(movement.creditAccountId)) {
        // Cash is being credited (inflow)
        amount = movement.amount;
      }
      
      if (description.includes('sale') || description.includes('revenue')) {
        operatingActivities += amount;
      } else if (description.includes('equipment') || description.includes('investment')) {
        investingActivities += amount;
      } else if (description.includes('loan') || description.includes('equity')) {
        financingActivities += amount;
      } else {
        operatingActivities += amount;
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
} 