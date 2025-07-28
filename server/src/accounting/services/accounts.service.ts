import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, Account } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  async createAccount(data: {
    code: string;
    name: string;
    type: string;
    description?: string;
    userId: string;
    businessId?: string;
  }): Promise<Account> {
    try {
      // Validate that either userId or businessId is provided, but not both
      if (!data.userId && !data.businessId) {
        throw new BadRequestException('Either userId or businessId must be provided');
      }

      // Check if account code already exists for the same context
      const existingAccount = await prisma.account.findFirst({
        where: {
          code: data.code,
          OR: [{ userId: data.userId }, { businessId: data.businessId }],
        },
      });

      if (existingAccount) {
        throw new BadRequestException(`Account with code ${data.code} already exists`);
      }

      const account = await prisma.account.create({
        data: {
          code: data.code,
          name: data.name,
          type: data.type,
          description: data.description,
          userId: data.userId,
          businessId: data.businessId,
        },
      });

      this.logger.log(`Created account: ${account.name} (${account.code})`);
      return account;
    } catch (error) {
      this.logger.error(`Error creating account: ${error.message}`);
      throw error;
    }
  }

  async getAccounts(
    userId: string,
    businessId?: string,
    includePersonal: boolean = false
  ): Promise<Account[]> {
    try {
      const whereClause: any = {};

      if (businessId) {
        // Business context - get business accounts
        whereClause.businessId = businessId;
      } else if (includePersonal) {
        // Personal context - get personal accounts
        whereClause.userId = userId;
      } else {
        // Default - get accounts for current context
        whereClause.OR = [{ userId: userId }, { businessId: businessId }];
      }

      const accounts = await prisma.account.findMany({
        where: whereClause,
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
      });

      return accounts;
    } catch (error) {
      this.logger.error(`Error fetching accounts: ${error.message}`);
      throw error;
    }
  }

  async getAccount(id: string, userId: string): Promise<Account> {
    try {
      const account = await prisma.account.findFirst({
        where: {
          id: id,
          OR: [
            { userId: userId },
            {
              businessId: {
                not: null,
              },
              Business: {
                Users: {
                  some: {
                    userId: userId,
                  },
                },
              },
            },
          ],
        },
      });

      if (!account) {
        throw new NotFoundException(`Account with ID ${id} not found`);
      }

      return account;
    } catch (error) {
      this.logger.error(`Error fetching account: ${error.message}`);
      throw error;
    }
  }

  async updateAccount(id: string, data: Partial<Account>, userId: string): Promise<Account> {
    try {
      // Verify account exists and user has access
      await this.getAccount(id, userId);

      const account = await prisma.account.update({
        where: { id },
        data: {
          code: data.code,
          name: data.name,
          type: data.type,
          description: data.description,
          isActive: data.isActive,
        },
      });

      this.logger.log(`Updated account: ${account.name} (${account.code})`);
      return account;
    } catch (error) {
      this.logger.error(`Error updating account: ${error.message}`);
      throw error;
    }
  }

  async deleteAccount(id: string, userId: string): Promise<void> {
    try {
      // Verify account exists and user has access
      await this.getAccount(id, userId);

      // Check if account has transactions
      const transactionCount = await prisma.transaction.count({
        where: { accountId: id },
      });

      if (transactionCount > 0) {
        throw new BadRequestException('Cannot delete account with existing transactions');
      }

      await prisma.account.delete({
        where: { id },
      });

      this.logger.log(`Deleted account: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting account: ${error.message}`);
      throw error;
    }
  }

  async getAccountBalance(
    id: string,
    userId: string
  ): Promise<{
    account: Account;
    balance: number;
    debitTotal: number;
    creditTotal: number;
  }> {
    try {
      const account = await this.getAccount(id, userId);

      // Calculate balance from transactions
      const transactions = await prisma.transaction.findMany({
        where: { accountId: id },
      });

      let debitTotal = 0;
      let creditTotal = 0;

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          creditTotal += transaction.amount;
        } else if (transaction.type === 'expense') {
          debitTotal += transaction.amount;
        } else if (transaction.type === 'transfer') {
          // For transfers, determine debit/credit based on account type
          if (['asset', 'expense'].includes(account.type.toLowerCase())) {
            debitTotal += transaction.amount;
          } else {
            creditTotal += transaction.amount;
          }
        }
      });

      const balance = creditTotal - debitTotal;

      return {
        account,
        balance,
        debitTotal,
        creditTotal,
      };
    } catch (error) {
      this.logger.error(`Error calculating account balance: ${error.message}`);
      throw error;
    }
  }

  async seedPersonalAccounts(userId: string): Promise<Account[]> {
    try {
      const personalAccounts = [
        // Assets
        { code: '1000', name: 'Cash', type: 'asset', description: 'Personal cash on hand' },
        { code: '1100', name: 'Bank Account', type: 'asset', description: 'Personal bank account' },
        {
          code: '1200',
          name: 'Savings Account',
          type: 'asset',
          description: 'Personal savings account',
        },
        {
          code: '1300',
          name: 'Credit Card',
          type: 'liability',
          description: 'Personal credit card',
        },

        // Income
        { code: '4000', name: 'Salary', type: 'revenue', description: 'Personal salary income' },
        {
          code: '4100',
          name: 'Freelance Income',
          type: 'revenue',
          description: 'Freelance work income',
        },
        {
          code: '4200',
          name: 'Investment Income',
          type: 'revenue',
          description: 'Investment returns',
        },
        {
          code: '4300',
          name: 'Other Income',
          type: 'revenue',
          description: 'Other personal income',
        },

        // Expenses
        {
          code: '5000',
          name: 'Food & Dining',
          type: 'expense',
          description: 'Food and dining expenses',
        },
        {
          code: '5100',
          name: 'Transportation',
          type: 'expense',
          description: 'Transportation costs',
        },
        {
          code: '5200',
          name: 'Entertainment',
          type: 'expense',
          description: 'Entertainment expenses',
        },
        { code: '5300', name: 'Shopping', type: 'expense', description: 'Shopping expenses' },
        { code: '5400', name: 'Healthcare', type: 'expense', description: 'Healthcare expenses' },
        { code: '5500', name: 'Utilities', type: 'expense', description: 'Utility bills' },
        { code: '5600', name: 'Rent', type: 'expense', description: 'Rent payments' },
        { code: '5700', name: 'Insurance', type: 'expense', description: 'Insurance premiums' },
        { code: '5800', name: 'Education', type: 'expense', description: 'Education expenses' },
        {
          code: '5900',
          name: 'Other Expenses',
          type: 'expense',
          description: 'Other personal expenses',
        },
      ];

      const createdAccounts = [];

      for (const accountData of personalAccounts) {
        try {
          const account = await this.createAccount({
            ...accountData,
            userId: userId,
            businessId: null,
          });
          createdAccounts.push(account);
        } catch (error) {
          // Skip if account already exists
          if (error.message.includes('already exists')) {
            this.logger.warn(`Account ${accountData.code} already exists for user ${userId}`);
            continue;
          }
          throw error;
        }
      }

      this.logger.log(`Seeded ${createdAccounts.length} personal accounts for user ${userId}`);
      return createdAccounts;
    } catch (error) {
      this.logger.error(`Error seeding personal accounts: ${error.message}`);
      throw error;
    }
  }

  async getAccountTypes(): Promise<string[]> {
    return ['asset', 'liability', 'equity', 'revenue', 'expense'];
  }

  async getAccountsByType(userId: string, businessId?: string, type?: string): Promise<Account[]> {
    try {
      const whereClause: any = {};

      if (businessId) {
        whereClause.businessId = businessId;
      } else {
        whereClause.userId = userId;
      }

      if (type) {
        whereClause.type = type;
      }

      const accounts = await prisma.account.findMany({
        where: whereClause,
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
      });

      return accounts;
    } catch (error) {
      this.logger.error(`Error fetching accounts by type: ${error.message}`);
      throw error;
    }
  }
}
