import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClient, JournalEntry, JournalEntryLine } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class JournalEntriesService {
  private readonly logger = new Logger(JournalEntriesService.name);

  async createJournalEntry(data: {
    date: Date;
    description: string;
    referenceNumber?: string;
    userId: string;
    businessId?: string;
    lines: Array<{
      accountId: string;
      description?: string;
      debit: number;
      credit: number;
    }>;
  }): Promise<JournalEntry & { Lines: JournalEntryLine[] }> {
    try {
      // Validate that debits equal credits
      const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new BadRequestException('Total debits must equal total credits');
      }

      // Validate that at least two lines exist
      if (data.lines.length < 2) {
        throw new BadRequestException('Journal entry must have at least two lines');
      }

      // Create journal entry with lines
      const journalEntry = await prisma.journalEntry.create({
        data: {
          date: data.date,
          description: data.description,
          referenceNumber: data.referenceNumber,
          status: 'DRAFT',
          userId: data.userId,
          businessId: data.businessId,
          Lines: {
            create: data.lines.map(line => ({
              accountId: line.accountId,
              description: line.description,
              debit: line.debit,
              credit: line.credit,
            }))
          }
        },
        include: {
          Lines: true
        }
      });

      this.logger.log(`Created journal entry: ${journalEntry.id} with ${data.lines.length} lines`);
      return journalEntry;
    } catch (error) {
      this.logger.error(`Error creating journal entry: ${error.message}`);
      throw error;
    }
  }

  async getJournalEntries(
    userId: string,
    businessId?: string,
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{
    entries: (JournalEntry & { Lines: JournalEntryLine[] })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const whereClause: any = {
        userId: userId
      };

      if (businessId) {
        whereClause.businessId = businessId;
      } else {
        whereClause.businessId = null; // Personal entries only
      }

      if (status) {
        whereClause.status = status;
      }

      const [entries, total] = await Promise.all([
        prisma.journalEntry.findMany({
          where: whereClause,
          include: {
            Lines: {
              include: {
                Account: true
              }
            }
          },
          orderBy: {
            date: 'desc'
          },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.journalEntry.count({
          where: whereClause
        })
      ]);

      return {
        entries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      this.logger.error(`Error fetching journal entries: ${error.message}`);
      throw error;
    }
  }

  async getJournalEntry(id: string, userId: string): Promise<JournalEntry & { Lines: JournalEntryLine[] }> {
    try {
      const entry = await prisma.journalEntry.findFirst({
        where: {
          id: id,
          userId: userId
        },
        include: {
          Lines: {
            include: {
              Account: true
            }
          }
        }
      });

      if (!entry) {
        throw new NotFoundException(`Journal entry with ID ${id} not found`);
      }

      return entry;
    } catch (error) {
      this.logger.error(`Error fetching journal entry: ${error.message}`);
      throw error;
    }
  }

  async updateJournalEntry(
    id: string,
    data: {
      date?: Date;
      description?: string;
      referenceNumber?: string;
      status?: string;
      lines?: Array<{
        accountId: string;
        description?: string;
        debit: number;
        credit: number;
      }>;
    },
    userId: string
  ): Promise<JournalEntry & { Lines: JournalEntryLine[] }> {
    try {
      // Verify entry exists and user has access
      await this.getJournalEntry(id, userId);

      // If lines are provided, validate them
      if (data.lines) {
        const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0);

        if (Math.abs(totalDebits - totalCredits) > 0.01) {
          throw new BadRequestException('Total debits must equal total credits');
        }

        if (data.lines.length < 2) {
          throw new BadRequestException('Journal entry must have at least two lines');
        }
      }

      // Update entry
      const updatedEntry = await prisma.journalEntry.update({
        where: { id },
        data: {
          date: data.date,
          description: data.description,
          referenceNumber: data.referenceNumber,
          status: data.status,
        },
        include: {
          Lines: {
            include: {
              Account: true
            }
          }
        }
      });

      // If lines are provided, replace them
      if (data.lines) {
        // Delete existing lines
        await prisma.journalEntryLine.deleteMany({
          where: { journalEntryId: id }
        });

        // Create new lines
        await prisma.journalEntryLine.createMany({
          data: data.lines.map(line => ({
            journalEntryId: id,
            accountId: line.accountId,
            description: line.description,
            debit: line.debit,
            credit: line.credit,
          }))
        });

        // Fetch updated entry with new lines
        return this.getJournalEntry(id, userId);
      }

      this.logger.log(`Updated journal entry: ${id}`);
      return updatedEntry;
    } catch (error) {
      this.logger.error(`Error updating journal entry: ${error.message}`);
      throw error;
    }
  }

  async deleteJournalEntry(id: string, userId: string): Promise<void> {
    try {
      // Verify entry exists and user has access
      await this.getJournalEntry(id, userId);

      // Check if entry is posted (cannot delete posted entries)
      const entry = await prisma.journalEntry.findUnique({
        where: { id }
      });

      if (entry?.status === 'POSTED') {
        throw new BadRequestException('Cannot delete posted journal entries');
      }

      // Delete entry (lines will be deleted automatically due to cascade)
      await prisma.journalEntry.delete({
        where: { id }
      });

      this.logger.log(`Deleted journal entry: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting journal entry: ${error.message}`);
      throw error;
    }
  }

  async postJournalEntry(id: string, userId: string): Promise<JournalEntry> {
    try {
      // Verify entry exists and user has access
      const entry = await this.getJournalEntry(id, userId);

      if (entry.status === 'POSTED') {
        throw new BadRequestException('Journal entry is already posted');
      }

      if (entry.status === 'VOID') {
        throw new BadRequestException('Cannot post voided journal entry');
      }

      // Update status to posted
      const postedEntry = await prisma.journalEntry.update({
        where: { id },
        data: { status: 'POSTED' }
      });

      this.logger.log(`Posted journal entry: ${id}`);
      return postedEntry;
    } catch (error) {
      this.logger.error(`Error posting journal entry: ${error.message}`);
      throw error;
    }
  }

  async voidJournalEntry(id: string, userId: string): Promise<JournalEntry> {
    try {
      // Verify entry exists and user has access
      const entry = await this.getJournalEntry(id, userId);

      if (entry.status === 'VOID') {
        throw new BadRequestException('Journal entry is already voided');
      }

      // Update status to void
      const voidedEntry = await prisma.journalEntry.update({
        where: { id },
        data: { status: 'VOID' }
      });

      this.logger.log(`Voided journal entry: ${id}`);
      return voidedEntry;
    } catch (error) {
      this.logger.error(`Error voiding journal entry: ${error.message}`);
      throw error;
    }
  }

  async getJournalEntryStats(userId: string, businessId?: string): Promise<{
    total: number;
    draft: number;
    posted: number;
    void: number;
    totalDebits: number;
    totalCredits: number;
  }> {
    try {
      const whereClause: any = {
        userId: userId
      };

      if (businessId) {
        whereClause.businessId = businessId;
      } else {
        whereClause.businessId = null; // Personal entries only
      }

      const [entries, lines] = await Promise.all([
        prisma.journalEntry.findMany({
          where: whereClause,
          select: { status: true }
        }),
        prisma.journalEntryLine.findMany({
          where: {
            JournalEntry: whereClause
          },
          select: { debit: true, credit: true }
        })
      ]);

      const stats = {
        total: entries.length,
        draft: entries.filter(e => e.status === 'DRAFT').length,
        posted: entries.filter(e => e.status === 'POSTED').length,
        void: entries.filter(e => e.status === 'VOID').length,
        totalDebits: lines.reduce((sum, line) => sum + line.debit, 0),
        totalCredits: lines.reduce((sum, line) => sum + line.credit, 0)
      };

      return stats;
    } catch (error) {
      this.logger.error(`Error fetching journal entry stats: ${error.message}`);
      throw error;
    }
  }
} 