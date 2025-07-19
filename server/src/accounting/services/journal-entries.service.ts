import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from '../dto';

const prisma = new PrismaClient();

@Injectable()
export class JournalEntriesService {
  async create(createJournalEntryDto: CreateJournalEntryDto, userId: string) {
    const {
      date,
      description,
      amount,
      debitAccountId,
      creditAccountId,
      gstAmount,
      tdsAmount,
      businessId,
    } = createJournalEntryDto;

    // Validate accounts exist
    const [debitAccount, creditAccount] = await Promise.all([
      prisma.accountHead.findUnique({ where: { id: debitAccountId } }),
      prisma.accountHead.findUnique({ where: { id: creditAccountId } }),
    ]);

    if (!debitAccount) {
      throw new BadRequestException('Debit account not found');
    }
    if (!creditAccount) {
      throw new BadRequestException('Credit account not found');
    }

    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: new Date(date),
        description,
        amount,
        debitAccountId,
        creditAccountId,
        userId,
        gstAmount,
        tdsAmount,
        businessId,
      },
      include: {
        debitAccount: true,
        creditAccount: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return journalEntry;
  }

  async createBatchFromTransactions(
    transactions: Array<{
      date: string;
      description: string;
      amount: number;
      type: 'credit' | 'debit';
      debitAccountId: string;
      creditAccountId: string;
      gstAmount?: number;
      tdsAmount?: number;
      businessId?: string;
    }>,
    userId: string
  ) {
    // Validate all accounts exist first
    const accountIds = new Set<string>();
    transactions.forEach(t => {
      accountIds.add(t.debitAccountId);
      accountIds.add(t.creditAccountId);
    });

    const existingAccounts = await prisma.accountHead.findMany({
      where: { id: { in: Array.from(accountIds) } },
      select: { id: true }
    });

    const existingAccountIds = new Set(existingAccounts.map(a => a.id));
    const missingAccounts = Array.from(accountIds).filter(id => !existingAccountIds.has(id));

    if (missingAccounts.length > 0) {
      throw new BadRequestException(`Accounts not found: ${missingAccounts.join(', ')}`);
    }

    // Create journal entries in a transaction
    const createdEntries = await prisma.$transaction(async (tx) => {
      const entries = [];
      
      for (const transaction of transactions) {
        const entry = await tx.journalEntry.create({
          data: {
            date: new Date(transaction.date),
            description: transaction.description,
            amount: transaction.amount,
            debitAccountId: transaction.debitAccountId,
            creditAccountId: transaction.creditAccountId,
            userId,
            gstAmount: transaction.gstAmount,
            tdsAmount: transaction.tdsAmount,
            businessId: transaction.businessId,
          },
          include: {
            debitAccount: true,
            creditAccount: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
        
        entries.push(entry);
      }
      
      return entries;
    });

    return {
      message: `Successfully created ${createdEntries.length} journal entries`,
      data: createdEntries,
      count: createdEntries.length
    };
  }

  // Validation helper methods
  private isValidGSTRate(rate: number): boolean {
    const validRates = [0, 5, 12, 18, 28];
    return validRates.includes(rate);
  }

  private isValidGSTIN(gstin: string): boolean {
    // GSTIN format: 2 digits + 10 characters + 1 digit + 1 character + 1 digit
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstin.length === 15 && gstinRegex.test(gstin);
  }

  private isValidTDSSection(section: string): boolean {
    const validSections = [
      '194A', '194B', '194BB', '194C', '194D', '194E', '194EE', '194F', '194G', '194H',
      '194I', '194IA', '194IB', '194IC', '194J', '194K', '194LA', '194LB', '194LC', '194LD',
      '194M', '194N', '194O', '194P', '194Q', '194R', '194S', '194T', '194U', '194V'
    ];
    return validSections.includes(section);
  }

  private isValidPAN(pan: string): boolean {
    // PAN format: 5 letters + 4 digits + 1 letter
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return pan.length === 10 && panRegex.test(pan);
  }

  async findAll(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [journalEntries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { userId },
        include: {
          debitAccount: true,
          creditAccount: true,
          user: {
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
      prisma.journalEntry.count({
        where: { userId }
      })
    ]);

    return {
      data: journalEntries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string, userId: string) {
    const journalEntry = await prisma.journalEntry.findFirst({
      where: { id, userId },
      include: {
        debitAccount: true,
        creditAccount: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!journalEntry) {
      throw new NotFoundException('Journal entry not found');
    }

    return journalEntry;
  }

  async update(id: string, updateJournalEntryDto: UpdateJournalEntryDto, userId: string) {
    // Check if journal entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: { id, userId }
    });

    if (!existingEntry) {
      throw new NotFoundException('Journal entry not found');
    }

    const { 
      date, 
      description, 
      debitAccountId, 
      creditAccountId, 
      amount,
      gstAmount,
      tdsAmount,
      businessId
    } = updateJournalEntryDto;

    // Validate that accounts exist if provided
    if (debitAccountId) {
      const debitAccount = await prisma.accountHead.findUnique({ where: { id: debitAccountId } });
      if (!debitAccount) {
        throw new BadRequestException('Debit account not found');
      }
    }

    if (creditAccountId) {
      const creditAccount = await prisma.accountHead.findUnique({ where: { id: creditAccountId } });
      if (!creditAccount) {
        throw new BadRequestException('Credit account not found');
      }
    }

    // Update journal entry
    const journalEntry = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(description && { description }),
        ...(debitAccountId && { debitAccountId }),
        ...(creditAccountId && { creditAccountId }),
        ...(amount && { amount }),
        ...(gstAmount && { gstAmount }),
        ...(tdsAmount && { tdsAmount }),
        ...(businessId && { businessId }),
      },
      include: {
        debitAccount: true,
        creditAccount: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return journalEntry;
  }

  async remove(id: string, userId: string) {
    // Check if journal entry exists and belongs to user
    const existingEntry = await prisma.journalEntry.findFirst({
      where: { id, userId }
    });

    if (!existingEntry) {
      throw new NotFoundException('Journal entry not found');
    }

    // Delete journal entry
    await prisma.journalEntry.delete({
      where: { id }
    });

    return { message: 'Journal entry deleted successfully' };
  }

  async getJournalEntrySummary(userId: string) {
    const summary = await prisma.journalEntry.groupBy({
      by: ['date'],
      where: { userId },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      orderBy: { date: 'desc' },
      take: 30 // Last 30 days
    });

    return summary;
  }
} 