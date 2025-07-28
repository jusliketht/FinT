import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  GetTransactionsQueryDto,
  TransactionType,
} from './dto';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  async createTransaction(createTransactionDto: CreateTransactionDto, userId: string) {
    // Placeholder implementation
    const transaction = {
      id: `trans_${Date.now()}`,
      amount: createTransactionDto.amount,
      description: createTransactionDto.description,
      category: createTransactionDto.category,
      transactionType: createTransactionDto.transactionType,
      date: createTransactionDto.date,
      paymentMethod: createTransactionDto.paymentMethod || 'CASH',
      reference: createTransactionDto.reference,
      businessId: createTransactionDto.businessId || null, // Allow null for personal transactions
      accountId: createTransactionDto.accountId,
      thirdPartyId: createTransactionDto.thirdPartyId,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate journal entries only if businessId is provided
    if (createTransactionDto.businessId) {
      await this.generateJournalEntriesForTransaction(transaction);
    }

    return transaction;
  }

  async getTransactionCategories(userId: string, businessId?: string): Promise<string[]> {
    // Placeholder implementation - can be customized based on context
    const personalCategories = [
      'Salary',
      'Freelance',
      'Investment',
      'Rental Income',
      'Food & Dining',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Healthcare',
      'Utilities',
      'Rent',
      'Insurance',
      'Education',
      'Travel',
      'Other',
    ];

    const businessCategories = [
      'Service Revenue',
      'Product Sales',
      'Consulting Fees',
      'Office Supplies',
      'Employee Salaries',
      'Marketing',
      'Professional Services',
      'Equipment',
      'Software Licenses',
      'Travel Expenses',
      'Business Insurance',
      'Legal Fees',
      'Accounting Fees',
      'Other',
    ];

    return businessId ? businessCategories : personalCategories;
  }

  async generateJournalEntriesForTransaction(transaction: any): Promise<any[]> {
    try {
      // Only generate journal entries for business transactions
      if (!transaction.businessId) {
        return [];
      }

      // Placeholder implementation
      const journalEntry = {
        id: `je_${Date.now()}`,
        date: transaction.date,
        description: transaction.description,
        referenceNumber: transaction.reference || `TXN-${transaction.id}`,
        userId: transaction.userId,
        businessId: transaction.businessId,
        createdAt: new Date(),
        updatedAt: new Date(),
        debitAccount: {
          id: 'account_1',
          name: 'Cash Account',
          code: '1001',
        },
        creditAccount: {
          id: 'account_2',
          name: 'Income Account',
          code: '4001',
        },
      };

      this.logger.log(
        `Generated journal entry: ${journalEntry.id} for transaction: ${transaction.id}`
      );
      return [journalEntry];
    } catch (error) {
      this.logger.error(`Error generating journal entry for transaction: ${transaction.id}`, error);
      throw new BadRequestException('Failed to generate journal entry');
    }
  }

  async getTransactions(query: GetTransactionsQueryDto, userId: string) {
    // Placeholder implementation
    const transactions = [
      {
        id: 'trans_1',
        amount: 1000,
        description: 'Salary payment',
        category: 'Salary',
        transactionType: TransactionType.INCOME,
        date: new Date(),
        paymentMethod: 'BANK_TRANSFER',
        reference: 'SAL-001',
        businessId: query.businessId || null, // Can be null for personal transactions
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'trans_2',
        amount: 500,
        description: 'Grocery shopping',
        category: 'Food & Dining',
        transactionType: TransactionType.EXPENSE,
        date: new Date(),
        paymentMethod: 'CASH',
        reference: 'EXP-001',
        businessId: query.businessId || null, // Can be null for personal transactions
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Filter by businessId if provided
    const filteredTransactions = query.businessId
      ? transactions.filter(t => t.businessId === query.businessId)
      : transactions.filter(t => !t.businessId); // Personal transactions

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    return {
      transactions: filteredTransactions.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: filteredTransactions.length,
        pages: Math.ceil(filteredTransactions.length / limit),
      },
    };
  }

  async getTransaction(id: string, userId: string) {
    // Placeholder implementation
    const transaction = {
      id,
      amount: 1000,
      description: 'Sample transaction',
      category: 'Salary',
      transactionType: TransactionType.INCOME,
      date: new Date(),
      paymentMethod: 'BANK_TRANSFER',
      reference: 'SAL-001',
      businessId: null, // Can be null for personal transactions
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async updateTransaction(id: string, updateTransactionDto: UpdateTransactionDto, userId: string) {
    // Placeholder implementation
    const transaction = {
      id,
      amount: 1000,
      description: 'Sample transaction',
      category: 'Salary',
      transactionType: TransactionType.INCOME,
      date: new Date(),
      paymentMethod: 'BANK_TRANSFER',
      reference: 'SAL-001',
      businessId: null, // Can be null for personal transactions
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return {
      ...transaction,
      ...updateTransactionDto,
      updatedAt: new Date(),
    };
  }

  async deleteTransaction(id: string, userId: string) {
    // Placeholder implementation
    const transaction = {
      id,
      amount: 1000,
      description: 'Sample transaction',
      category: 'Salary',
      transactionType: TransactionType.INCOME,
      date: new Date(),
      paymentMethod: 'BANK_TRANSFER',
      reference: 'SAL-001',
      businessId: null, // Can be null for personal transactions
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return { id, deleted: true };
  }

  async getTransactionStats(userId: string, businessId?: string) {
    // Placeholder implementation
    const isPersonal = !businessId;

    return {
      total: 100,
      income: isPersonal ? 50000 : 100000,
      expense: isPersonal ? 30000 : 60000,
      net: isPersonal ? 20000 : 40000,
      byCategory: isPersonal
        ? {
            Salary: 40000,
            'Food & Dining': 8000,
            Transportation: 5000,
            Entertainment: 3000,
          }
        : {
            'Service Revenue': 80000,
            'Office Supplies': 15000,
            'Employee Salaries': 25000,
            Marketing: 10000,
          },
      byMonth: [
        { month: 'Jan', income: isPersonal ? 5000 : 10000, expense: isPersonal ? 3000 : 6000 },
        { month: 'Feb', income: isPersonal ? 5000 : 10000, expense: isPersonal ? 3500 : 7000 },
        { month: 'Mar', income: isPersonal ? 5000 : 10000, expense: isPersonal ? 2800 : 5600 },
      ],
      context: isPersonal ? 'Personal' : 'Business',
    };
  }
}
