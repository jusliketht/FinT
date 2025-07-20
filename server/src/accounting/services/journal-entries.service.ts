import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateJournalEntryDto, UpdateJournalEntryDto, JournalEntryLineDto } from '../dto';

const prisma = new PrismaClient();

@Injectable()
export class JournalEntriesService {
  async create(createJournalEntryDto: CreateJournalEntryDto, userId: string) {
    const {
      date,
      description,
      reference,
      lines,
      businessId,
      isAdjusting,
    } = createJournalEntryDto;

    // Validate double-entry rules
    const totalDebits = lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
    const totalCredits = lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException('Debits must equal credits in double-entry system');
    }

    // Validate all accounts exist
    const accountIds = lines.map(line => line.accountId);
    const existingAccounts = await prisma.accountHead.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, name: true }
    });

    const existingAccountIds = new Set(existingAccounts.map(a => a.id));
    const missingAccounts = accountIds.filter(id => !existingAccountIds.has(id));

    if (missingAccounts.length > 0) {
      throw new BadRequestException(`Accounts not found: ${missingAccounts.join(', ')}`);
    }

    // Create journal entry with lines in a transaction
    const journalEntry = await prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          date: new Date(date),
          description,
          reference,
          totalAmount: totalDebits,
          userId,
          businessId,
          isAdjusting: isAdjusting || false,
          JournalEntryLines: {
            create: lines.map(line => ({
              accountId: line.accountId,
              debitAmount: line.debitAmount || 0,
              creditAmount: line.creditAmount || 0,
              description: line.description,
            }))
          }
        },
        include: {
          JournalEntryLines: {
            include: { Account: true }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return entry;
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
    // Convert old format to new double-entry format
    const journalEntries = transactions.map(transaction => {
      const lines: JournalEntryLineDto[] = [];
      
      if (transaction.type === 'debit') {
        lines.push(
          { accountId: transaction.debitAccountId, debitAmount: transaction.amount, creditAmount: 0 },
          { accountId: transaction.creditAccountId, debitAmount: 0, creditAmount: transaction.amount }
        );
      } else {
        lines.push(
          { accountId: transaction.creditAccountId, debitAmount: transaction.amount, creditAmount: 0 },
          { accountId: transaction.debitAccountId, debitAmount: 0, creditAmount: transaction.amount }
        );
      }

      return {
        date: transaction.date,
        description: transaction.description,
        lines,
        businessId: transaction.businessId,
      };
    });

    // Create journal entries using the new create method
    const createdEntries = [];
    for (const entryData of journalEntries) {
      const entry = await this.create(entryData, userId);
      createdEntries.push(entry);
    }

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
          JournalEntryLines: {
            include: { Account: true }
          },
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
        JournalEntryLines: {
          include: { Account: true }
        },
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
      reference,
      lines,
      businessId,
      isAdjusting
    } = updateJournalEntryDto;

    // If lines are provided, validate double-entry rules
    if (lines && lines.length > 0) {
      const totalDebits = lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
      const totalCredits = lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
      
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new BadRequestException('Debits must equal credits in double-entry system');
      }
    }

    // Update journal entry
    const journalEntry = await prisma.journalEntry.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(description && { description }),
        ...(reference && { reference }),
        ...(businessId && { businessId }),
        ...(isAdjusting !== undefined && { isAdjusting }),
        ...(lines && { totalAmount: lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0) }),
      },
      include: {
        JournalEntryLines: {
          include: { Account: true }
        },
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
        totalAmount: true
      },
      _count: {
        id: true
      },
      orderBy: { date: 'desc' },
      take: 30 // Last 30 days
    });

    return summary;
  }

  async getTrialBalance(businessId: string, asOfDate: Date): Promise<any[]> {
    // Generate trial balance from journal entry lines
    const balances = await prisma.$queryRaw`
      SELECT 
        a.id,
        a.code,
        a.name,
        a.type,
        COALESCE(SUM(jel."debitAmount"), 0) as totalDebits,
        COALESCE(SUM(jel."creditAmount"), 0) as totalCredits,
        (COALESCE(SUM(jel."debitAmount"), 0) - COALESCE(SUM(jel."creditAmount"), 0)) as balance
      FROM "AccountHead" a
      LEFT JOIN "JournalEntryLine" jel ON a.id = jel."accountId"
      LEFT JOIN "JournalEntry" je ON jel."journalEntryId" = je.id
      WHERE (je."businessId" = ${businessId} OR je."businessId" IS NULL)
        AND je.date <= ${asOfDate}
      GROUP BY a.id, a.code, a.name, a.type
      ORDER BY a.code
    `;
    
    return balances;
  }
} 