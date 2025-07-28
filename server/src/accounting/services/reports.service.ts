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
          OR: [{ userId: userId }, { businessId: businessId }],
        },
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
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
      const assets = await this.getAccountsByType(userId, 'asset', businessId, asOfDate);
      const liabilities = await this.getAccountsByType(userId, 'liability', businessId, asOfDate);
      const equity = await this.getAccountsByType(userId, 'equity', businessId, asOfDate);

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
      const revenue = await this.getAccountsByTypeForPeriod(
        userId,
        'revenue',
        businessId,
        startDate,
        endDate
      );
      const expenses = await this.getAccountsByTypeForPeriod(
        userId,
        'expense',
        businessId,
        startDate,
        endDate
      );

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
          startDate: startDate || new Date(0),
          endDate: endDate || new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Error generating profit and loss: ${error.message}`);
      throw error;
    }
  }

  async generateGeneralLedger(
    userId: string,
    businessId?: string,
    accountId?: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 20,
    search?: string
  ): Promise<{
    entries: Array<{
      id: string;
      date: Date;
      description: string;
      reference: string;
      debitAmount: number;
      creditAmount: number;
      balance: number;
      accountId: string;
      accountCode: string;
      accountName: string;
    }>;
    total: number;
    totalPages: number;
    currentPage: number;
    runningBalance: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
  }> {
    try {
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {
        OR: [{ userId: userId }, { businessId: businessId }],
      };

      if (accountId) {
        where.accountId = accountId;
      }

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = startDate;
        if (endDate) where.date.lte = endDate;
      }

      if (search) {
        where.OR = [
          { description: { contains: search, mode: 'insensitive' } },
          { reference: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Get transactions with pagination
      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: {
            Account: {
              select: {
                id: true,
                code: true,
                name: true,
                type: true,
              },
            },
          },
          orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: limit,
        }),
        prisma.transaction.count({ where }),
      ]);

      // Calculate running balance
      let runningBalance = 0;
      const entries = transactions.map(transaction => {
        let debitAmount = 0;
        let creditAmount = 0;

        if (transaction.type === 'income') {
          creditAmount = transaction.amount;
          runningBalance += transaction.amount;
        } else if (transaction.type === 'expense') {
          debitAmount = transaction.amount;
          runningBalance -= transaction.amount;
        } else if (transaction.type === 'transfer') {
          // For transfers, we need to check if it's a debit or credit based on account type
          const accountType = transaction.Account?.type?.toLowerCase();
          if (accountType === 'asset' || accountType === 'expense') {
            debitAmount = transaction.amount;
            runningBalance -= transaction.amount;
          } else {
            creditAmount = transaction.amount;
            runningBalance += transaction.amount;
          }
        }

        return {
          id: transaction.id,
          date: transaction.date,
          description: transaction.description,
          reference: transaction.reference || '',
          debitAmount,
          creditAmount,
          balance: runningBalance,
          accountId: transaction.accountId,
          accountCode: transaction.Account?.code || '',
          accountName: transaction.Account?.name || '',
        };
      });

      const totalPages = Math.ceil(total / limit);

      return {
        entries,
        total,
        totalPages,
        currentPage: page,
        runningBalance,
        period: {
          startDate: startDate || new Date(0),
          endDate: endDate || new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Error generating general ledger: ${error.message}`);
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
      // This is a simplified cash flow implementation
      // In a real application, you would categorize transactions based on business rules
      const transactions = await prisma.transaction.findMany({
        where: {
          OR: [{ userId: userId }, { businessId: businessId }],
          date: {
            gte: startDate || new Date(0),
            lte: endDate || new Date(),
          },
        },
        orderBy: { date: 'asc' },
      });

      const operatingActivities = [];
      const investingActivities = [];
      const financingActivities = [];

      let netOperatingCashFlow = 0;
      const netInvestingCashFlow = 0;
      const netFinancingCashFlow = 0;

      for (const transaction of transactions) {
        // Simplified categorization - in practice, you'd use account types and categories
        if (transaction.type === 'income') {
          operatingActivities.push({
            description: transaction.description,
            amount: transaction.amount,
            type: 'inflow' as const,
          });
          netOperatingCashFlow += transaction.amount;
        } else if (transaction.type === 'expense') {
          operatingActivities.push({
            description: transaction.description,
            amount: transaction.amount,
            type: 'outflow' as const,
          });
          netOperatingCashFlow -= transaction.amount;
        }
      }

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
          startDate: startDate || new Date(0),
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
    try {
      // Get balance from transactions
      const where: any = {
        accountId: accountId,
        OR: [{ userId: userId }, { businessId: businessId }],
      };

      if (asOfDate) {
        where.date = { lte: asOfDate };
      }

      const transactions = await prisma.transaction.findMany({
        where,
        select: { amount: true, type: true },
      });

      let balance = 0;
      for (const transaction of transactions) {
        if (transaction.type === 'income') {
          balance += transaction.amount;
        } else if (transaction.type === 'expense') {
          balance -= transaction.amount;
        } else if (transaction.type === 'transfer') {
          // For transfers, we need to determine debit/credit based on account type
          // This is simplified - in practice, you'd check the account type
          balance -= transaction.amount;
        }
      }

      return balance;
    } catch (error) {
      this.logger.error(`Error getting account balance: ${error.message}`);
      return 0;
    }
  }

  private async getAccountsByType(
    userId: string,
    type: string,
    businessId?: string,
    asOfDate?: Date
  ): Promise<
    Array<{
      id: string;
      code: string;
      name: string;
      balance: number;
    }>
  > {
    try {
      const accounts = await prisma.account.findMany({
        where: {
          type: type,
          OR: [{ userId: userId }, { businessId: businessId }],
        },
        orderBy: { code: 'asc' },
      });

      const accountsWithBalance = [];
      for (const account of accounts) {
        const balance = await this.getAccountBalance(account.id, userId, businessId, asOfDate);
        accountsWithBalance.push({
          id: account.id,
          code: account.code,
          name: account.name,
          balance,
        });
      }

      return accountsWithBalance;
    } catch (error) {
      this.logger.error(`Error getting accounts by type: ${error.message}`);
      return [];
    }
  }

  private async getAccountsByTypeForPeriod(
    userId: string,
    type: string,
    businessId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Array<{
      id: string;
      code: string;
      name: string;
      amount: number;
    }>
  > {
    try {
      const accounts = await prisma.account.findMany({
        where: {
          type: type,
          OR: [{ userId: userId }, { businessId: businessId }],
        },
        orderBy: { code: 'asc' },
      });

      const accountsWithAmount = [];
      for (const account of accounts) {
        const amount = await this.getAccountBalanceForPeriod(
          account.id,
          userId,
          businessId,
          startDate,
          endDate
        );
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
    } catch (error) {
      this.logger.error(`Error getting accounts by type for period: ${error.message}`);
      return [];
    }
  }

  private async getAccountBalanceForPeriod(
    accountId: string,
    userId: string,
    businessId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    try {
      const where: any = {
        accountId: accountId,
        OR: [{ userId: userId }, { businessId: businessId }],
      };

      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = startDate;
        if (endDate) where.date.lte = endDate;
      }

      const transactions = await prisma.transaction.findMany({
        where,
        select: { amount: true, type: true },
      });

      let balance = 0;
      for (const transaction of transactions) {
        if (transaction.type === 'income') {
          balance += transaction.amount;
        } else if (transaction.type === 'expense') {
          balance -= transaction.amount;
        } else if (transaction.type === 'transfer') {
          balance -= transaction.amount;
        }
      }

      return balance;
    } catch (error) {
      this.logger.error(`Error getting account balance for period: ${error.message}`);
      return 0;
    }
  }
}
