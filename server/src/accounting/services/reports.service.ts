import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  async generateTrialBalance(
    userId: string,
    businessId?: string,
    asOfDate?: Date
  ): Promise<{
    accounts: Array<{
      id: string;
      code: string;
      name: string;
      type: string;
      debitBalance: number;
      creditBalance: number;
    }>;
    totalDebits: number;
    totalCredits: number;
    difference: number;
    asOfDate: Date;
  }> {
    try {
      // Get all accounts
      const accounts = await prisma.account.findMany({
        where: {
          OR: [
            { userId: userId },
            { businessId: businessId }
          ],
          isActive: true
        },
        orderBy: [
          { type: 'asc' },
          { code: 'asc' }
        ]
      });

      const trialBalanceAccounts = [];
      let totalDebits = 0;
      let totalCredits = 0;

      for (const account of accounts) {
        const balance = await this.getAccountBalance(account.id, userId, businessId, asOfDate);
        
        let debitBalance = 0;
        let creditBalance = 0;

        if (account.type.toLowerCase() === 'asset' || account.type.toLowerCase() === 'expense') {
          if (balance > 0) {
            debitBalance = balance;
          } else {
            creditBalance = Math.abs(balance);
          }
        } else {
          if (balance > 0) {
            creditBalance = balance;
          } else {
            debitBalance = Math.abs(balance);
          }
        }

        trialBalanceAccounts.push({
          id: account.id,
          code: account.code,
          name: account.name,
          type: account.type,
          debitBalance,
          creditBalance,
        });

        totalDebits += debitBalance;
        totalCredits += creditBalance;
      }

      const difference = Math.abs(totalDebits - totalCredits);

      return {
        accounts: trialBalanceAccounts,
        totalDebits,
        totalCredits,
        difference,
        asOfDate: asOfDate || new Date(),
      };
    } catch (error) {
      this.logger.error(`Error generating trial balance: ${error.message}`);
      throw error;
    }
  }

  async generateBalanceSheet(
    userId: string,
    businessId?: string,
    asOfDate?: Date
  ): Promise<{
    assets: Array<{
      id: string;
      code: string;
      name: string;
      balance: number;
    }>;
    liabilities: Array<{
      id: string;
      code: string;
      name: string;
      balance: number;
    }>;
    equity: Array<{
      id: string;
      code: string;
      name: string;
      balance: number;
    }>;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    asOfDate: Date;
  }> {
    try {
      const assets = await this.getAccountsByType(userId, businessId, 'Asset', asOfDate);
      const liabilities = await this.getAccountsByType(userId, businessId, 'Liability', asOfDate);
      const equity = await this.getAccountsByType(userId, businessId, 'Equity', asOfDate);

      const totalAssets = assets.reduce((sum, account) => sum + account.balance, 0);
      const totalLiabilities = liabilities.reduce((sum, account) => sum + account.balance, 0);
      const totalEquity = equity.reduce((sum, account) => sum + account.balance, 0);

      return {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        asOfDate: asOfDate || new Date(),
      };
    } catch (error) {
      this.logger.error(`Error generating balance sheet: ${error.message}`);
      throw error;
    }
  }

  async generateProfitAndLoss(
    userId: string,
    businessId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    revenue: Array<{
      id: string;
      code: string;
      name: string;
      amount: number;
    }>;
    expenses: Array<{
      id: string;
      code: string;
      name: string;
      amount: number;
    }>;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
  }> {
    try {
      const revenue = await this.getAccountsByTypeForPeriod(userId, businessId, 'Revenue', startDate, endDate);
      const expenses = await this.getAccountsByTypeForPeriod(userId, businessId, 'Expense', startDate, endDate);

      const totalRevenue = revenue.reduce((sum, account) => sum + account.amount, 0);
      const totalExpenses = expenses.reduce((sum, account) => sum + account.amount, 0);
      const netIncome = totalRevenue - totalExpenses;

      return {
        revenue,
        expenses,
        totalRevenue,
        totalExpenses,
        netIncome,
        period: {
          startDate: startDate || new Date(new Date().getFullYear(), 0, 1), // Start of current year
          endDate: endDate || new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Error generating profit and loss: ${error.message}`);
      throw error;
    }
  }

  async generateCashFlow(
    userId: string,
    businessId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    operatingActivities: Array<{
      description: string;
      amount: number;
      type: 'inflow' | 'outflow';
    }>;
    investingActivities: Array<{
      description: string;
      amount: number;
      type: 'inflow' | 'outflow';
    }>;
    financingActivities: Array<{
      description: string;
      amount: number;
      type: 'inflow' | 'outflow';
    }>;
    netOperatingCashFlow: number;
    netInvestingCashFlow: number;
    netFinancingCashFlow: number;
    netCashFlow: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
  }> {
    try {
      // Get cash and bank accounts
      const cashAccounts = await prisma.account.findMany({
        where: {
          AND: [
            {
              OR: [
                { userId: userId },
                { businessId: businessId }
              ]
            },
            {
              type: 'Asset',
              OR: [
                { name: { contains: 'Cash', mode: 'insensitive' } },
                { name: { contains: 'Bank', mode: 'insensitive' } },
                { code: { startsWith: '1000' } } // Assuming cash accounts start with 1000
              ]
            }
          ]
        }
      });

      const operatingActivities = [];
      const investingActivities = [];
      const financingActivities = [];

      // Calculate cash flows from journal entries
      const journalEntries = await prisma.journalEntry.findMany({
        where: {
          status: 'POSTED',
          OR: [
            { userId: userId },
            { businessId: businessId }
          ],
          date: {
            gte: startDate || new Date(new Date().getFullYear(), 0, 1),
            lte: endDate || new Date(),
          }
        },
        include: {
          Lines: {
            include: {
              Account: true
            }
          }
        }
      });

      // Process journal entries to categorize cash flows
      for (const entry of journalEntries) {
        for (const line of entry.Lines) {
          if (cashAccounts.some(account => account.id === line.Account.id)) {
            const amount = line.debit - line.credit;
            
            // Categorize based on account type and description
            if (line.Account.type === 'Revenue' || line.Account.type === 'Expense') {
              operatingActivities.push({
                description: entry.description,
                amount: Math.abs(amount),
                type: amount > 0 ? 'inflow' : 'outflow',
              });
            } else if (line.Account.type === 'Asset' && !cashAccounts.some(account => account.id === line.Account.id)) {
              investingActivities.push({
                description: entry.description,
                amount: Math.abs(amount),
                type: amount > 0 ? 'outflow' : 'inflow',
              });
            } else if (line.Account.type === 'Liability' || line.Account.type === 'Equity') {
              financingActivities.push({
                description: entry.description,
                amount: Math.abs(amount),
                type: amount > 0 ? 'inflow' : 'outflow',
              });
            }
          }
        }
      }

      const netOperatingCashFlow = operatingActivities.reduce((sum, activity) => 
        sum + (activity.type === 'inflow' ? activity.amount : -activity.amount), 0);
      const netInvestingCashFlow = investingActivities.reduce((sum, activity) => 
        sum + (activity.type === 'inflow' ? activity.amount : -activity.amount), 0);
      const netFinancingCashFlow = financingActivities.reduce((sum, activity) => 
        sum + (activity.type === 'inflow' ? activity.amount : -activity.amount), 0);

      const netCashFlow = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;

      return {
        operatingActivities,
        investingActivities,
        financingActivities,
        netOperatingCashFlow,
        netInvestingCashFlow,
        netFinancingCashFlow,
        netCashFlow,
        period: {
          startDate: startDate || new Date(new Date().getFullYear(), 0, 1),
          endDate: endDate || new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Error generating cash flow: ${error.message}`);
      throw error;
    }
  }

  private async getAccountBalance(
    accountId: string,
    userId: string,
    businessId?: string,
    asOfDate?: Date
  ): Promise<number> {
    const whereClause: any = {
      accountId: accountId,
      JournalEntry: {
        status: 'POSTED',
        OR: [
          { userId: userId },
          { businessId: businessId }
        ]
      }
    };

    if (asOfDate) {
      whereClause.JournalEntry.date = { lte: asOfDate };
    }

    const entries = await prisma.journalEntryLine.findMany({
      where: whereClause,
      include: {
        Account: true,
        JournalEntry: true
      }
    });

    const debitTotal = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const creditTotal = entries.reduce((sum, entry) => sum + entry.credit, 0);

    // Calculate balance based on account type
    const account = entries[0]?.Account;
    if (account) {
      switch (account.type.toLowerCase()) {
        case 'asset':
        case 'expense':
          return debitTotal - creditTotal;
        case 'liability':
        case 'equity':
        case 'revenue':
          return creditTotal - debitTotal;
        default:
          return debitTotal - creditTotal;
      }
    }

    return 0;
  }

  private async getAccountsByType(
    userId: string,
    type: string,
    businessId?: string,
    asOfDate?: Date
  ): Promise<Array<{
    id: string;
    code: string;
    name: string;
    balance: number;
  }>> {
    const accounts = await prisma.account.findMany({
      where: {
        type: type,
        OR: [
          { userId: userId },
          { businessId: businessId }
        ],
        isActive: true
      },
      orderBy: { code: 'asc' }
    });

    const accountsWithBalance = [];
    for (const account of accounts) {
      const balance = await this.getAccountBalance(account.id, userId, businessId, asOfDate);
      if (balance !== 0) {
        accountsWithBalance.push({
          id: account.id,
          code: account.code,
          name: account.name,
          balance,
        });
      }
    }

    return accountsWithBalance;
  }

  private async getAccountsByTypeForPeriod(
    userId: string,
    type: string,
    businessId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{
    id: string;
    code: string;
    name: string;
    amount: number;
  }>> {
    const accounts = await prisma.account.findMany({
      where: {
        type: type,
        OR: [
          { userId: userId },
          { businessId: businessId }
        ],
        isActive: true
      },
      orderBy: { code: 'asc' }
    });

    const accountsWithAmount = [];
    for (const account of accounts) {
      const amount = await this.getAccountBalanceForPeriod(account.id, userId, businessId, startDate, endDate);
      if (amount !== 0) {
        accountsWithAmount.push({
          id: account.id,
          code: account.code,
          name: account.name,
          amount,
        });
      }
    }

    return accountsWithAmount;
  }

  private async getAccountBalanceForPeriod(
    accountId: string,
    userId: string,
    businessId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const whereClause: any = {
      accountId: accountId,
      JournalEntry: {
        status: 'POSTED',
        OR: [
          { userId: userId },
          { businessId: businessId }
        ]
      }
    };

    if (startDate || endDate) {
      whereClause.JournalEntry.date = {};
      if (startDate) whereClause.JournalEntry.date.gte = startDate;
      if (endDate) whereClause.JournalEntry.date.lte = endDate;
    }

    const entries = await prisma.journalEntryLine.findMany({
      where: whereClause,
      include: {
        Account: true
      }
    });

    const debitTotal = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const creditTotal = entries.reduce((sum, entry) => sum + entry.credit, 0);

    const account = entries[0]?.Account;
    if (account) {
      switch (account.type.toLowerCase()) {
        case 'asset':
        case 'expense':
          return debitTotal - creditTotal;
        case 'liability':
        case 'equity':
        case 'revenue':
          return creditTotal - debitTotal;
        default:
          return debitTotal - creditTotal;
      }
    }

    return 0;
  }
} 