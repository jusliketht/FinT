import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient, JournalEntry, JournalEntryLine } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class JournalEntryService {
  private readonly logger = new Logger(JournalEntryService.name);

  async createJournalEntry(data: {
    date: Date;
    description: string;
    referenceNumber?: string;
    lines: Array<{
      accountId: string;
      description?: string;
      debit: number;
      credit: number;
    }>;
    userId: string;
    businessId?: string;
    status?: string;
  }): Promise<JournalEntry & { Lines: JournalEntryLine[] }> {
    try {
      // Validate that lines are provided
      if (!data.lines || data.lines.length === 0) {
        throw new BadRequestException('At least one journal entry line is required');
      }

      // Validate double-entry principle (total debits = total credits)
      const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0);

      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        throw new BadRequestException(
          `Double-entry principle violated. Total debits (${totalDebits}) must equal total credits (${totalCredits})`
        );
      }

      // Validate that all accounts exist and user has access
      for (const line of data.lines) {
        const account = await prisma.account.findFirst({
          where: {
            id: line.accountId,
            OR: [{ userId: data.userId }, { businessId: data.businessId }],
          },
        });

        if (!account) {
          throw new BadRequestException(
            `Account with ID ${line.accountId} not found or access denied`
          );
        }

        if (!account.isActive) {
          throw new BadRequestException(`Account ${account.name} (${account.code}) is inactive`);
        }
      }

      // Create journal entry with lines
      const journalEntry = await prisma.journalEntry.create({
        data: {
          id: this.generateId(),
          date: data.date,
          description: data.description,
          referenceNumber: data.referenceNumber,
          status: data.status || 'DRAFT',
          userId: data.userId,
          businessId: data.businessId,
          Lines: {
            create: data.lines.map(line => ({
              id: this.generateId(),
              accountId: line.accountId,
              description: line.description,
              debit: line.debit,
              credit: line.credit,
            })),
          },
        },
        include: {
          Lines: {
            include: {
              Account: true,
            },
          },
        },
      });

      this.logger.log(`Created journal entry: ${journalEntry.description} (${journalEntry.id})`);
      return journalEntry;
    } catch (error) {
      this.logger.error(`Error creating journal entry: ${error.message}`);
      throw error;
    }
  }

  async getJournalEntries(
    userId: string,
    businessId?: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      accountId?: string;
      status?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<(JournalEntry & { Lines: (JournalEntryLine & { Account: any })[] })[]> {
    try {
      const whereClause: any = {
        OR: [{ userId: userId }, { businessId: businessId }],
      };

      if (filters?.startDate || filters?.endDate) {
        whereClause.date = {};
        if (filters.startDate) whereClause.date.gte = filters.startDate;
        if (filters.endDate) whereClause.date.lte = filters.endDate;
      }

      if (filters?.status) {
        whereClause.status = filters.status;
      }

      if (filters?.accountId) {
        whereClause.Lines = {
          some: {
            accountId: filters.accountId,
          },
        };
      }

      const journalEntries = await prisma.journalEntry.findMany({
        where: whereClause,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        include: {
          Lines: {
            include: {
              Account: true,
            },
          },
        },
      });

      return journalEntries;
    } catch (error) {
      this.logger.error(`Error fetching journal entries: ${error.message}`);
      throw error;
    }
  }

  async getJournalEntry(
    id: string,
    userId: string,
    businessId?: string
  ): Promise<JournalEntry & { Lines: (JournalEntryLine & { Account: any })[] }> {
    try {
      const journalEntry = await prisma.journalEntry.findFirst({
        where: {
          id: id,
          OR: [{ userId: userId }, { businessId: businessId }],
        },
        include: {
          Lines: {
            include: {
              Account: true,
            },
          },
        },
      });

      if (!journalEntry) {
        throw new NotFoundException(`Journal entry with ID ${id} not found`);
      }

      return journalEntry;
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
        id?: string;
        accountId: string;
        description?: string;
        debit: number;
        credit: number;
      }>;
    },
    userId: string,
    businessId?: string
  ): Promise<JournalEntry & { Lines: JournalEntryLine[] }> {
    try {
      // Check if journal entry exists and user has access
      const existingEntry = await this.getJournalEntry(id, userId, businessId);

      // If status is POSTED, prevent updates
      if (existingEntry.status === 'POSTED') {
        throw new BadRequestException('Cannot update a posted journal entry');
      }

      // If lines are being updated, validate double-entry principle
      if (data.lines) {
        const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0);

        if (Math.abs(totalDebits - totalCredits) > 0.01) {
          throw new BadRequestException(
            `Double-entry principle violated. Total debits (${totalDebits}) must equal total credits (${totalCredits})`
          );
        }

        // Validate accounts
        for (const line of data.lines) {
          const account = await prisma.account.findFirst({
            where: {
              id: line.accountId,
              OR: [{ userId: userId }, { businessId: businessId }],
            },
          });

          if (!account) {
            throw new BadRequestException(
              `Account with ID ${line.accountId} not found or access denied`
            );
          }
        }
      }

      // Update journal entry
      const updatedEntry = await prisma.journalEntry.update({
        where: { id: id },
        data: {
          date: data.date,
          description: data.description,
          referenceNumber: data.referenceNumber,
          status: data.status,
        },
        include: {
          Lines: true,
        },
      });

      // Update lines if provided
      if (data.lines) {
        // Delete existing lines
        await prisma.journalEntryLine.deleteMany({
          where: { journalEntryId: id },
        });

        // Create new lines
        await prisma.journalEntryLine.createMany({
          data: data.lines.map(line => ({
            id: this.generateId(),
            journalEntryId: id,
            accountId: line.accountId,
            description: line.description,
            debit: line.debit,
            credit: line.credit,
          })),
        });

        // Fetch updated entry with lines
        return this.getJournalEntry(id, userId, businessId);
      }

      this.logger.log(`Updated journal entry: ${updatedEntry.description} (${updatedEntry.id})`);
      return updatedEntry;
    } catch (error) {
      this.logger.error(`Error updating journal entry: ${error.message}`);
      throw error;
    }
  }

  async deleteJournalEntry(id: string, userId: string, businessId?: string): Promise<void> {
    try {
      // Check if journal entry exists and user has access
      const existingEntry = await this.getJournalEntry(id, userId, businessId);

      // If status is POSTED, prevent deletion
      if (existingEntry.status === 'POSTED') {
        throw new BadRequestException('Cannot delete a posted journal entry');
      }

      // Delete journal entry (lines will be deleted automatically due to cascade)
      await prisma.journalEntry.delete({
        where: { id: id },
      });

      this.logger.log(`Deleted journal entry: ${existingEntry.description} (${existingEntry.id})`);
    } catch (error) {
      this.logger.error(`Error deleting journal entry: ${error.message}`);
      throw error;
    }
  }

  async postJournalEntry(id: string, userId: string, businessId?: string): Promise<JournalEntry> {
    try {
      // Check if journal entry exists and user has access
      const existingEntry = await this.getJournalEntry(id, userId, businessId);

      if (existingEntry.status === 'POSTED') {
        throw new BadRequestException('Journal entry is already posted');
      }

      if (existingEntry.status === 'VOID') {
        throw new BadRequestException('Cannot post a voided journal entry');
      }

      // Update status to POSTED
      const updatedEntry = await prisma.journalEntry.update({
        where: { id: id },
        data: { status: 'POSTED' },
      });

      this.logger.log(`Posted journal entry: ${updatedEntry.description} (${updatedEntry.id})`);
      return updatedEntry;
    } catch (error) {
      this.logger.error(`Error posting journal entry: ${error.message}`);
      throw error;
    }
  }

  async voidJournalEntry(id: string, userId: string, businessId?: string): Promise<JournalEntry> {
    try {
      // Check if journal entry exists and user has access
      const existingEntry = await this.getJournalEntry(id, userId, businessId);

      if (existingEntry.status === 'VOID') {
        throw new BadRequestException('Journal entry is already voided');
      }

      // Update status to VOID
      const updatedEntry = await prisma.journalEntry.update({
        where: { id: id },
        data: { status: 'VOID' },
      });

      this.logger.log(`Voided journal entry: ${updatedEntry.description} (${updatedEntry.id})`);
      return updatedEntry;
    } catch (error) {
      this.logger.error(`Error voiding journal entry: ${error.message}`);
      throw error;
    }
  }

  async getLedgerEntries(
    accountId: string,
    userId: string,
    businessId?: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<
    Array<{
      date: Date;
      description: string;
      referenceNumber?: string;
      debit: number;
      credit: number;
      balance: number;
      journalEntryId: string;
    }>
  > {
    try {
      // Validate account access
      const account = await prisma.account.findFirst({
        where: {
          id: accountId,
          OR: [{ userId: userId }, { businessId: businessId }],
        },
      });

      if (!account) {
        throw new BadRequestException(`Account with ID ${accountId} not found or access denied`);
      }

      const whereClause: any = {
        accountId: accountId,
        JournalEntry: {
          status: 'POSTED',
          OR: [{ userId: userId }, { businessId: businessId }],
        },
      };

      if (filters?.startDate || filters?.endDate) {
        whereClause.JournalEntry.date = {};
        if (filters.startDate) whereClause.JournalEntry.date.gte = filters.startDate;
        if (filters.endDate) whereClause.JournalEntry.date.lte = filters.endDate;
      }

      const ledgerEntries = await prisma.journalEntryLine.findMany({
        where: whereClause,
        orderBy: [{ JournalEntry: { date: 'asc' } }, { JournalEntry: { createdAt: 'asc' } }],
        take: filters?.limit || 100,
        skip: filters?.offset || 0,
        include: {
          JournalEntry: true,
        },
      });

      // Calculate running balance
      let runningBalance = 0;
      const ledgerWithBalance = ledgerEntries.map(entry => {
        if (account.type.toLowerCase() === 'asset' || account.type.toLowerCase() === 'expense') {
          runningBalance += entry.debit - entry.credit;
        } else {
          runningBalance += entry.credit - entry.debit;
        }

        return {
          date: entry.JournalEntry.date,
          description: entry.JournalEntry.description,
          referenceNumber: entry.JournalEntry.referenceNumber,
          debit: entry.debit,
          credit: entry.credit,
          balance: runningBalance,
          journalEntryId: entry.JournalEntry.id,
        };
      });

      return ledgerWithBalance;
    } catch (error) {
      this.logger.error(`Error fetching ledger entries: ${error.message}`);
      throw error;
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
