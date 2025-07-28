import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, Account } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ChartOfAccountsService {
  private readonly logger = new Logger(ChartOfAccountsService.name);

  async createAccount(data: {
    code: string;
    name: string;
    type: string;
    description?: string;
    userId: string;
    businessId?: string;
  }): Promise<Account> {
    try {
      // Check if account code already exists
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
        include: {
          User: true,
          Business: true,
        },
      });

      return accounts;
    } catch (error) {
      this.logger.error(`Error fetching accounts: ${error.message}`);
      throw error;
    }
  }

  async getAccount(id: string, userId: string, businessId?: string): Promise<Account> {
    try {
      const account = await prisma.account.findFirst({
        where: {
          id: id,
          OR: [{ userId: userId }, { businessId: businessId }],
        },
        include: {
          User: true,
          Business: true,
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

  async updateAccount(
    id: string,
    data: Partial<Account>,
    userId: string,
    businessId?: string
  ): Promise<Account> {
    try {
      // Check if account exists and user has access
      const existingAccount = await this.getAccount(id, userId, businessId);

      // Check if code is being changed and if it conflicts with existing accounts
      if (data.code && data.code !== existingAccount.code) {
        const conflictingAccount = await prisma.account.findFirst({
          where: {
            code: data.code,
            id: { not: id },
            OR: [{ userId: userId }, { businessId: businessId }],
          },
        });

        if (conflictingAccount) {
          throw new BadRequestException(`Account with code ${data.code} already exists`);
        }
      }

      const updatedAccount = await prisma.account.update({
        where: { id: id },
        data: {
          code: data.code,
          name: data.name,
          type: data.type,
          description: data.description,
          isActive: data.isActive,
        },
        include: {
          User: true,
          Business: true,
        },
      });

      this.logger.log(`Updated account: ${updatedAccount.name} (${updatedAccount.code})`);
      return updatedAccount;
    } catch (error) {
      this.logger.error(`Error updating account: ${error.message}`);
      throw error;
    }
  }

  async deleteAccount(id: string, userId: string, businessId?: string): Promise<void> {
    try {
      // Check if account exists and user has access
      const existingAccount = await this.getAccount(id, userId, businessId);

      // Check if account has any transactions
      const transactionCount = await prisma.transaction.count({
        where: { accountId: id },
      });

      if (transactionCount > 0) {
        throw new BadRequestException(
          `Cannot delete account with existing transactions. Account has ${transactionCount} transaction(s).`
        );
      }

      // Check if account has any journal entry lines
      const journalEntryCount = await prisma.journalEntryLine.count({
        where: { accountId: id },
      });

      if (journalEntryCount > 0) {
        throw new BadRequestException(
          `Cannot delete account with existing journal entries. Account has ${journalEntryCount} journal entry line(s).`
        );
      }

      await prisma.account.delete({
        where: { id: id },
      });

      this.logger.log(`Deleted account: ${existingAccount.name} (${existingAccount.code})`);
    } catch (error) {
      this.logger.error(`Error deleting account: ${error.message}`);
      throw error;
    }
  }

  async getAccountBalance(
    id: string,
    userId: string,
    businessId?: string,
    asOfDate?: Date
  ): Promise<{
    account: Account;
    balance: number;
    debitTotal: number;
    creditTotal: number;
  }> {
    try {
      const account = await this.getAccount(id, userId, businessId);

      const whereClause: any = {
        accountId: id,
      };

      if (asOfDate) {
        whereClause.JournalEntry = {
          date: {
            lte: asOfDate,
          },
        };
      }

      const journalEntries = await prisma.journalEntryLine.findMany({
        where: whereClause,
        include: {
          JournalEntry: true,
        },
      });

      const debitTotal = journalEntries.reduce((sum, entry) => sum + entry.debit, 0);
      const creditTotal = journalEntries.reduce((sum, entry) => sum + entry.credit, 0);

      // Calculate balance based on account type
      let balance = 0;
      switch (account.type) {
        case 'asset':
        case 'expense':
          balance = debitTotal - creditTotal;
          break;
        case 'liability':
        case 'equity':
        case 'revenue':
          balance = creditTotal - debitTotal;
          break;
        default:
          balance = debitTotal - creditTotal;
      }

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

  async getAccountTypes(): Promise<string[]> {
    return ['asset', 'liability', 'equity', 'revenue', 'expense'];
  }

  async getAccountsByType(userId: string, businessId?: string, type?: string): Promise<Account[]> {
    try {
      const whereClause: any = {};

      if (businessId) {
        whereClause.businessId = businessId;
      } else {
        whereClause.OR = [{ userId: userId }, { businessId: businessId }];
      }

      if (type) {
        whereClause.type = type;
      }

      const accounts = await prisma.account.findMany({
        where: whereClause,
        orderBy: [{ type: 'asc' }, { code: 'asc' }],
        include: {
          User: true,
          Business: true,
        },
      });

      return accounts;
    } catch (error) {
      this.logger.error(`Error fetching accounts by type: ${error.message}`);
      throw error;
    }
  }

  async seedStandardAccounts(userId: string, businessId?: string): Promise<Account[]> {
    try {
      const standardAccounts = [
        // Assets
        { code: '1000', name: 'Cash', type: 'asset', description: 'Cash on hand and in bank' },
        {
          code: '1100',
          name: 'Accounts Receivable',
          type: 'asset',
          description: 'Amounts owed by customers',
        },
        { code: '1200', name: 'Inventory', type: 'asset', description: 'Goods held for sale' },
        {
          code: '1300',
          name: 'Prepaid Expenses',
          type: 'asset',
          description: 'Expenses paid in advance',
        },
        { code: '1400', name: 'Fixed Assets', type: 'asset', description: 'Long-term assets' },
        {
          code: '1500',
          name: 'Accumulated Depreciation',
          type: 'asset',
          description: 'Depreciation on fixed assets',
        },

        // Liabilities
        {
          code: '2000',
          name: 'Accounts Payable',
          type: 'liability',
          description: 'Amounts owed to suppliers',
        },
        {
          code: '2100',
          name: 'Accrued Expenses',
          type: 'liability',
          description: 'Expenses incurred but not paid',
        },
        {
          code: '2200',
          name: 'Short-term Loans',
          type: 'liability',
          description: 'Short-term borrowings',
        },
        {
          code: '2300',
          name: 'Long-term Loans',
          type: 'liability',
          description: 'Long-term borrowings',
        },

        // Equity
        {
          code: '3000',
          name: "Owner's Equity",
          type: 'equity',
          description: "Owner's investment in the business",
        },
        {
          code: '3100',
          name: 'Retained Earnings',
          type: 'equity',
          description: 'Accumulated profits',
        },

        // Revenue
        { code: '4000', name: 'Sales Revenue', type: 'revenue', description: 'Revenue from sales' },
        {
          code: '4100',
          name: 'Service Revenue',
          type: 'revenue',
          description: 'Revenue from services',
        },
        {
          code: '4200',
          name: 'Other Income',
          type: 'revenue',
          description: 'Other sources of income',
        },

        // Expenses
        {
          code: '5000',
          name: 'Cost of Goods Sold',
          type: 'expense',
          description: 'Direct costs of goods sold',
        },
        {
          code: '5100',
          name: 'Operating Expenses',
          type: 'expense',
          description: 'General operating expenses',
        },
        {
          code: '5200',
          name: 'Salaries and Wages',
          type: 'expense',
          description: 'Employee compensation',
        },
        { code: '5300', name: 'Rent Expense', type: 'expense', description: 'Rental costs' },
        { code: '5400', name: 'Utilities', type: 'expense', description: 'Utility expenses' },
        {
          code: '5500',
          name: 'Depreciation',
          type: 'expense',
          description: 'Depreciation expense',
        },
      ];

      const createdAccounts: Account[] = [];

      for (const accountData of standardAccounts) {
        try {
          const account = await this.createAccount({
            ...accountData,
            userId,
            businessId,
          });
          createdAccounts.push(account);
        } catch (error) {
          // Skip if account already exists
          if (error instanceof BadRequestException && error.message.includes('already exists')) {
            this.logger.log(`Account ${accountData.code} already exists, skipping...`);
            continue;
          }
          throw error;
        }
      }

      this.logger.log(`Seeded ${createdAccounts.length} standard accounts`);
      return createdAccounts;
    } catch (error) {
      this.logger.error(`Error seeding standard accounts: ${error.message}`);
      throw error;
    }
  }
}
