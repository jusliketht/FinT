import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';

const prisma = new PrismaClient();

@Injectable()
export class AccountsService {
  /**
   * Create account with business context
   */
  async createAccount(createAccountDto: CreateAccountDto & { userId: string, businessId?: string }): Promise<any> {
    // Validate account code uniqueness within business
    const existingAccount = await prisma.account.findFirst({
      where: {
        code: createAccountDto.code,
        businessId: createAccountDto.businessId || null
      }
    });

    if (existingAccount) {
      throw new BadRequestException('Account code must be unique within the business');
    }

    return prisma.account.create({
      data: {
        name: createAccountDto.name,
        type: createAccountDto.type,
        code: createAccountDto.code,
        userId: createAccountDto.userId,
        businessId: createAccountDto.businessId,
      },
      include: {
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
  }

  /**
   * Get all accounts for a business
   */
  async getAccountsByBusiness(businessId: string, userId: string): Promise<any[]> {
    // Verify user has access to business
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (!userBusiness) {
      throw new ForbiddenException('Access denied to this business');
    }

    return prisma.account.findMany({
      where: { businessId },
      include: {
        Business: true,
        User: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });
  }

  /**
   * Get accounts hierarchy for a business
   */
  async getAccountsHierarchy(businessId: string, userId: string): Promise<any> {
    // Verify user has access to business
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (!userBusiness) {
      throw new ForbiddenException('Access denied to this business');
    }

    const accounts = await prisma.account.findMany({
      where: { businessId },
      orderBy: { code: 'asc' }
    });

    // Group by type
    const hierarchy = {
      assets: [],
      liabilities: [],
      equity: [],
      revenue: [],
      expense: []
    };

    for (const account of accounts) {
      const type = account.type.toLowerCase();
      if (hierarchy[type]) {
        hierarchy[type].push(account);
      }
    }

    return hierarchy;
  }

  /**
   * Get trial balance for a business
   */
  async getTrialBalance(businessId: string, userId: string, asOfDate?: Date): Promise<any> {
    // Verify user has access to business
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (!userBusiness) {
      throw new ForbiddenException('Access denied to this business');
    }

    const accounts = await prisma.account.findMany({
      where: { businessId },
      include: {
        debitEntries: {
          where: asOfDate ? {
            date: { lte: asOfDate }
          } : undefined
        },
        creditEntries: {
          where: asOfDate ? {
            date: { lte: asOfDate }
          } : undefined
        }
      }
    });

    const trialBalance = accounts.map(account => {
      const totalDebits = account.debitEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const totalCredits = account.creditEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const balance = totalDebits - totalCredits;

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        totalDebits,
        totalCredits,
        balance,
        normalBalance: this.getNormalBalance(account.type)
      };
    });

    return {
      asOfDate: asOfDate || new Date(),
      accounts: trialBalance,
      totalDebits: trialBalance.reduce((sum, account) => sum + account.totalDebits, 0),
      totalCredits: trialBalance.reduce((sum, account) => sum + account.totalCredits, 0)
    };
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: string, asOfDate?: Date): Promise<number> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        debitEntries: {
          where: asOfDate ? {
            date: { lte: asOfDate }
          } : undefined
        },
        creditEntries: {
          where: asOfDate ? {
            date: { lte: asOfDate }
          } : undefined
        }
      }
    });

    if (!account) {
      throw new NotFoundException('Account not found');
    }

    const totalDebits = account.debitEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const totalCredits = account.creditEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    return totalDebits - totalCredits;
  }

  /**
   * Search accounts
   */
  async searchAccounts(query: string, businessId: string, userId: string): Promise<any[]> {
    // Verify user has access to business
    const userBusiness = await prisma.userBusiness.findUnique({
      where: {
        userId_businessId: {
          userId,
          businessId,
        },
      },
    });

    if (!userBusiness) {
      throw new ForbiddenException('Access denied to this business');
    }

    return prisma.account.findMany({
      where: {
        businessId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { code: 'asc' }
    });
  }

  /**
   * Get normal balance for account type
   */
  private getNormalBalance(accountType: string): 'debit' | 'credit' {
    const normalBalances = {
      asset: 'debit',
      liability: 'credit',
      equity: 'credit',
      revenue: 'credit',
      expense: 'debit'
    };

    return normalBalances[accountType.toLowerCase()] || 'debit';
  }

  // Existing methods for backward compatibility
  async findAll() {
    return prisma.account.findMany({
      include: {
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
  }

  async findOne(id: string) {
    const account = await prisma.account.findUnique({
      where: { id },
      include: {
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
    
    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found`);
    }
    
    return account;
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    await this.findOne(id); // Verify account exists
    
    return prisma.account.update({
      where: { id },
      data: updateAccountDto,
      include: {
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
  }

  async remove(id: string) {
    await this.findOne(id); // Verify account exists
    
    return prisma.account.delete({
      where: { id },
    });
  }
} 