import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateTransactionDto, UpdateTransactionDto, GetTransactionsQueryDto } from './dto';

const prisma = new PrismaClient();

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  /**
   * Create a new transaction and generate corresponding journal entries
   */
  async createTransaction(createTransactionDto: CreateTransactionDto, userId: string) {
    const {
      date,
      description,
      amount,
      category,
      transactionType,
      paymentMethod,
      reference,
      notes,
      businessId,
      accountId
    } = createTransactionDto;

    // Validate account if provided
    if (accountId) {
      const account = await prisma.account.findUnique({
        where: { id: accountId }
      });
      if (!account) {
        throw new BadRequestException('Account not found');
      }
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        description,
        amount,
        category,
        transactionType,
        paymentMethod,
        reference,
        notes,
        userId,
        businessId,
        accountId,
      },
      include: {
        Account: true,
        Business: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Generate journal entries for the transaction
    await this.generateJournalEntriesForTransaction(transaction);

    this.logger.log(`Created transaction: ${transaction.id} for user: ${userId}`);
    return transaction;
  }

  /**
   * Get transaction categories (predefined + user custom)
   */
  async getTransactionCategories(userId: string): Promise<string[]> {
    const predefinedCategories = [
      'Salary',
      'Freelance',
      'Investment Income',
      'Rental Income',
      'Other Income',
      'Food & Dining',
      'Transportation',
      'Housing',
      'Utilities',
      'Healthcare',
      'Entertainment',
      'Shopping',
      'Travel',
      'Education',
      'Insurance',
      'Taxes',
      'Other Expenses'
    ];

    // Get user's custom categories from existing transactions
    const customCategories = await prisma.transaction.findMany({
      where: { userId },
      select: { category: true },
      distinct: ['category']
    });

    const userCategories = customCategories.map(t => t.category);
    
    // Combine and remove duplicates
    const allCategories = [...new Set([...predefinedCategories, ...userCategories])];
    return allCategories.sort();
  }

  /**
   * Generate journal entries for a transaction
   */
  async generateJournalEntriesForTransaction(transaction: any): Promise<any[]> {
    try {
      // Determine accounts based on transaction type and category
      const { debitAccountId, creditAccountId } = await this.determineAccounts(transaction);

      // Create journal entry
      const journalEntry = await prisma.journalEntry.create({
        data: {
          date: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          debitAccountId,
          creditAccountId,
          userId: transaction.userId,
          businessId: transaction.businessId,
          referenceNumber: transaction.reference || `TXN-${transaction.id}`,
        },
        include: {
          debitAccount: true,
          creditAccount: true,
        }
      });

      this.logger.log(`Generated journal entry: ${journalEntry.id} for transaction: ${transaction.id}`);
      return [journalEntry];
    } catch (error) {
      this.logger.error(`Error generating journal entry for transaction: ${transaction.id}`, error);
      throw new BadRequestException('Failed to generate journal entry');
    }
  }

  /**
   * Determine appropriate accounts for transaction
   */
  private async determineAccounts(transaction: any): Promise<{ debitAccountId: string; creditAccountId: string }> {
    // Get default accounts for the business
    const defaultAccounts = await this.getDefaultAccounts(transaction.businessId, transaction.userId);

    let debitAccountId: string;
    let creditAccountId: string;

    switch (transaction.transactionType) {
      case 'income':
        // Credit income account, debit cash/bank account
        creditAccountId = await this.getIncomeAccount(transaction.category, defaultAccounts);
        debitAccountId = await this.getCashAccount(transaction.paymentMethod, defaultAccounts);
        break;

      case 'expense':
        // Debit expense account, credit cash/bank account
        debitAccountId = await this.getExpenseAccount(transaction.category, defaultAccounts);
        creditAccountId = await this.getCashAccount(transaction.paymentMethod, defaultAccounts);
        break;

      case 'transfer':
        // Transfer between accounts
        debitAccountId = await this.getCashAccount(transaction.paymentMethod, defaultAccounts);
        creditAccountId = await this.getCashAccount(transaction.paymentMethod, defaultAccounts);
        break;

      case 'adjustment':
        // Use the linked account if provided, otherwise use default accounts
        if (transaction.accountId) {
          debitAccountId = transaction.accountId;
          creditAccountId = await this.getCashAccount(transaction.paymentMethod, defaultAccounts);
        } else {
          debitAccountId = await this.getExpenseAccount(transaction.category, defaultAccounts);
          creditAccountId = await this.getCashAccount(transaction.paymentMethod, defaultAccounts);
        }
        break;

      default:
        throw new BadRequestException('Invalid transaction type');
    }

    return { debitAccountId, creditAccountId };
  }

  /**
   * Get default accounts for the business
   */
  private async getDefaultAccounts(businessId: string | null, userId: string) {
    const whereClause: any = { userId };
    if (businessId) {
      whereClause.businessId = businessId;
    }

    const accounts = await prisma.account.findMany({
      where: whereClause,
      select: { id: true, name: true, type: true, code: true }
    });

    return accounts;
  }

  /**
   * Get income account based on category
   */
  private async getIncomeAccount(category: string, accounts: any[]): Promise<string> {
    // Try to find a specific income account for this category
    const categoryAccount = accounts.find(acc => 
      acc.name.toLowerCase().includes(category.toLowerCase()) && 
      acc.type.toLowerCase().includes('income')
    );

    if (categoryAccount) {
      return categoryAccount.id;
    }

    // Fall back to general income account
    const generalIncome = accounts.find(acc => 
      acc.name.toLowerCase().includes('income') || 
      acc.name.toLowerCase().includes('revenue')
    );

    if (generalIncome) {
      return generalIncome.id;
    }

    // If no income account found, create a default one
    return await this.createDefaultAccount('Other Income', 'income', accounts[0]?.businessId);
  }

  /**
   * Get expense account based on category
   */
  private async getExpenseAccount(category: string, accounts: any[]): Promise<string> {
    // Try to find a specific expense account for this category
    const categoryAccount = accounts.find(acc => 
      acc.name.toLowerCase().includes(category.toLowerCase()) && 
      acc.type.toLowerCase().includes('expense')
    );

    if (categoryAccount) {
      return categoryAccount.id;
    }

    // Fall back to general expense account
    const generalExpense = accounts.find(acc => 
      acc.name.toLowerCase().includes('expense') || 
      acc.name.toLowerCase().includes('cost')
    );

    if (generalExpense) {
      return generalExpense.id;
    }

    // If no expense account found, create a default one
    return await this.createDefaultAccount('Other Expenses', 'expense', accounts[0]?.businessId);
  }

  /**
   * Get cash account based on payment method
   */
  private async getCashAccount(paymentMethod: string | null, accounts: any[]): Promise<string> {
    if (paymentMethod) {
      const methodAccount = accounts.find(acc => 
        acc.name.toLowerCase().includes(paymentMethod.toLowerCase())
      );

      if (methodAccount) {
        return methodAccount.id;
      }
    }

    // Fall back to cash or bank account
    const cashAccount = accounts.find(acc => 
      acc.name.toLowerCase().includes('cash') || 
      acc.name.toLowerCase().includes('bank') ||
      acc.name.toLowerCase().includes('checking')
    );

    if (cashAccount) {
      return cashAccount.id;
    }

    // If no cash account found, create a default one
    return await this.createDefaultAccount('Cash', 'asset', accounts[0]?.businessId);
  }

  /**
   * Create a default account if none exists
   */
  private async createDefaultAccount(name: string, type: string, businessId: string | null): Promise<string> {
    const account = await prisma.account.create({
      data: {
        name,
        type,
        code: `${type.toUpperCase()}-${Date.now()}`,
        userId: 'system', // This should be the current user ID
        businessId,
      }
    });

    return account.id;
  }

  /**
   * Get transactions with filters and pagination
   */
  async getTransactions(query: GetTransactionsQueryDto, userId: string) {
    const {
      category,
      transactionType,
      paymentMethod,
      businessId,
      accountId,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 20
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: any = { userId };

    if (category) whereClause.category = category;
    if (transactionType) whereClause.transactionType = transactionType;
    if (paymentMethod) whereClause.paymentMethod = paymentMethod;
    if (businessId) whereClause.businessId = businessId;
    if (accountId) whereClause.accountId = accountId;

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { reference: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          Account: true,
          Business: true,
          User: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: whereClause })
    ]);

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(id: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        Account: true,
        Business: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Update a transaction
   */
  async updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto, userId: string) {
    // Verify transaction exists and belongs to user
    await this.getTransaction(id, userId);

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateTransactionDto,
      include: {
        Account: true,
        Business: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    this.logger.log(`Updated transaction: ${id} for user: ${userId}`);
    return transaction;
  }

  /**
   * Delete a transaction
   */
  async deleteTransaction(id: string, userId: string) {
    // Verify transaction exists and belongs to user
    await this.getTransaction(id, userId);

    await prisma.transaction.delete({
      where: { id }
    });

    this.logger.log(`Deleted transaction: ${id} for user: ${userId}`);
    return { message: 'Transaction deleted successfully' };
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats(userId: string, businessId?: string) {
    const whereClause: any = { userId };
    if (businessId) {
      whereClause.businessId = businessId;
    }

    const [totalTransactions, totalIncome, totalExpenses] = await Promise.all([
      prisma.transaction.count({ where: whereClause }),
      prisma.transaction.aggregate({
        where: { ...whereClause, transactionType: 'income' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...whereClause, transactionType: 'expense' },
        _sum: { amount: true }
      })
    ]);

    return {
      totalTransactions,
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      netIncome: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0)
    };
  }
} 