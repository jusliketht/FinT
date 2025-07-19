import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, AccountHead } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class AccountHeadsService {
  /**
   * Create standard chart of accounts for a business
   */
  async createStandardChartOfAccounts(businessId?: string): Promise<AccountHead[]> {
    const standardAccounts = [
      // Assets
      { code: '1000', name: 'Cash', categoryId: 'assets', type: 'asset' },
      { code: '1100', name: 'Accounts Receivable', categoryId: 'assets', type: 'asset' },
      { code: '1200', name: 'Inventory', categoryId: 'assets', type: 'asset' },
      { code: '1500', name: 'Equipment', categoryId: 'assets', type: 'asset' },
      
      // Liabilities
      { code: '2000', name: 'Accounts Payable', categoryId: 'liabilities', type: 'liability' },
      { code: '2100', name: 'Short-term Loans', categoryId: 'liabilities', type: 'liability' },
      { code: '2500', name: 'Long-term Debt', categoryId: 'liabilities', type: 'liability' },
      
      // Equity
      { code: '3000', name: 'Owner\'s Equity', categoryId: 'equity', type: 'equity' },
      { code: '3100', name: 'Retained Earnings', categoryId: 'equity', type: 'equity' },
      
      // Income
      { code: '4000', name: 'Sales Revenue', categoryId: 'income', type: 'income' },
      { code: '4100', name: 'Service Revenue', categoryId: 'income', type: 'income' },
      { code: '4900', name: 'Other Income', categoryId: 'income', type: 'income' },
      
      // Expenses
      { code: '5000', name: 'Cost of Goods Sold', categoryId: 'expenses', type: 'expense' },
      { code: '6000', name: 'Operating Expenses', categoryId: 'expenses', type: 'expense' },
      { code: '6100', name: 'Rent Expense', categoryId: 'expenses', type: 'expense' },
      { code: '6200', name: 'Utilities Expense', categoryId: 'expenses', type: 'expense' },
      { code: '6300', name: 'Office Supplies', categoryId: 'expenses', type: 'expense' },
      { code: '6400', name: 'Professional Services', categoryId: 'expenses', type: 'expense' },
    ];

    // Get category IDs
    const categories = await prisma.accountCategory.findMany();
    const categoryMap = new Map(categories.map(c => [c.name.toLowerCase(), c.id]));

    // Create account heads
    const accountHeads = [];
    for (const account of standardAccounts) {
      const categoryId = categoryMap.get(account.categoryId);
      if (categoryId) {
        try {
          const accountHead = await prisma.accountHead.create({
            data: {
              code: account.code,
              name: account.name,
              type: account.type,
              categoryId: categoryId,
              businessId: businessId,
              isCustom: false
            }
          });
          accountHeads.push(accountHead);
        } catch (error) {
          // Skip if account head already exists
          console.log(`Account head ${account.code} already exists`);
        }
      }
    }

    return accountHeads;
  }

  /**
   * Get accounts by category
   */
  async getAccountsByCategory(categoryId: string, businessId?: string): Promise<AccountHead[]> {
    return prisma.accountHead.findMany({
      where: {
        categoryId,
        businessId: businessId || null
      },
      include: {
        category: true,
        parent: true,
        children: true
      },
      orderBy: { code: 'asc' }
    });
  }

  /**
   * Create new account head
   */
  async createAccountHead(createAccountHeadDto: any): Promise<AccountHead> {
    // Validate account code uniqueness
    const existingAccount = await prisma.accountHead.findFirst({
      where: {
        code: createAccountHeadDto.code,
        businessId: createAccountHeadDto.businessId || null
      }
    });

    if (existingAccount) {
      throw new BadRequestException('Account code must be unique');
    }

    // Validate parent account if specified
    if (createAccountHeadDto.parentId) {
      const parentAccount = await prisma.accountHead.findUnique({
        where: { id: createAccountHeadDto.parentId }
      });

      if (!parentAccount) {
        throw new NotFoundException('Parent account not found');
      }
    }

    return prisma.accountHead.create({
      data: createAccountHeadDto,
      include: {
        category: true,
        parent: true,
        children: true
      }
    });
  }

  /**
   * Update account head
   */
  async updateAccountHead(id: string, updateAccountHeadDto: any): Promise<AccountHead> {
    const accountHead = await prisma.accountHead.findUnique({
      where: { id }
    });

    if (!accountHead) {
      throw new NotFoundException(`Account head with ID ${id} not found`);
    }

    // Check code uniqueness if code is being updated
    if (updateAccountHeadDto.code && updateAccountHeadDto.code !== accountHead.code) {
      const existingAccount = await prisma.accountHead.findFirst({
        where: {
          code: updateAccountHeadDto.code,
          businessId: accountHead.businessId,
          id: { not: id }
        }
      });

      if (existingAccount) {
        throw new BadRequestException('Account code must be unique');
      }
    }

    return prisma.accountHead.update({
      where: { id },
      data: updateAccountHeadDto,
      include: {
        category: true,
        parent: true,
        children: true
      }
    });
  }

  /**
   * Delete account head
   */
  async deleteAccountHead(id: string): Promise<void> {
    const accountHead = await prisma.accountHead.findUnique({
      where: { id },
      include: {
        children: true,
        debitJournalEntries: true,
        creditJournalEntries: true
      }
    });

    if (!accountHead) {
      throw new NotFoundException(`Account head with ID ${id} not found`);
    }

    // Check if account has children
    if (accountHead.children.length > 0) {
      throw new BadRequestException('Cannot delete account with child accounts');
    }

    // Check if account has journal entries
    if (accountHead.debitJournalEntries.length > 0 || accountHead.creditJournalEntries.length > 0) {
      throw new BadRequestException('Cannot delete account with journal entries');
    }

    await prisma.accountHead.delete({
      where: { id }
    });
  }

  /**
   * Get account hierarchy
   */
  async getAccountHierarchy(businessId?: string): Promise<any> {
    const accounts = await prisma.accountHead.findMany({
      where: {
        businessId: businessId || null
      },
      include: {
        category: true,
        parent: true,
        children: true
      },
      orderBy: { code: 'asc' }
    });

    // Group by category
    const hierarchy = {};
    for (const account of accounts) {
      const categoryName = account.category.name;
      if (!hierarchy[categoryName]) {
        hierarchy[categoryName] = [];
      }
      hierarchy[categoryName].push(account);
    }

    return hierarchy;
  }

  /**
   * Get account by ID
   */
  async getAccountHeadById(id: string): Promise<AccountHead> {
    const accountHead = await prisma.accountHead.findUnique({
      where: { id },
      include: {
        category: true,
        parent: true,
        children: true
      }
    });

    if (!accountHead) {
      throw new NotFoundException(`Account head with ID ${id} not found`);
    }

    return accountHead;
  }

  /**
   * Get all account heads
   */
  async getAllAccountHeads(businessId?: string): Promise<AccountHead[]> {
    return prisma.accountHead.findMany({
      where: {
        businessId: businessId || null
      },
      include: {
        category: true,
        parent: true,
        children: true
      },
      orderBy: { code: 'asc' }
    });
  }
} 