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
      debitAccountId, 
      creditAccountId, 
      amount,
      // GST fields
      gstRate,
      gstAmount,
      gstin,
      hsnCode,
      placeOfSupply,
      isInterState,
      // TDS fields
      tdsSection,
      tdsRate,
      tdsAmount,
      panNumber,
      // Additional fields
      isMsmeVendor,
      invoiceNumber,
      vendorName
    } = createJournalEntryDto;

    // Validate that accounts exist
    const [debitAccount, creditAccount] = await Promise.all([
      prisma.account.findUnique({ where: { id: debitAccountId } }),
      prisma.account.findUnique({ where: { id: creditAccountId } })
    ]);

    if (!debitAccount) {
      throw new BadRequestException('Debit account not found');
    }

    if (!creditAccount) {
      throw new BadRequestException('Credit account not found');
    }

    // Validate GST fields if provided
    if (gstRate && !this.isValidGSTRate(gstRate)) {
      throw new BadRequestException('Invalid GST rate. Must be 0, 5, 12, 18, or 28');
    }

    if (gstin && !this.isValidGSTIN(gstin)) {
      throw new BadRequestException('Invalid GSTIN format. Must be 15 characters');
    }

    // Validate TDS fields if provided
    if (tdsSection && !this.isValidTDSSection(tdsSection)) {
      throw new BadRequestException('Invalid TDS section');
    }

    if (panNumber && !this.isValidPAN(panNumber)) {
      throw new BadRequestException('Invalid PAN format. Must be 10 characters');
    }

    // Auto-calculate GST amount if rate is provided but amount is not
    let finalGstAmount = gstAmount;
    if (gstRate && !gstAmount) {
      finalGstAmount = (amount * gstRate) / 100;
    }

    // Auto-calculate TDS amount if rate is provided but amount is not
    let finalTdsAmount = tdsAmount;
    if (tdsRate && !tdsAmount) {
      finalTdsAmount = (amount * tdsRate) / 100;
    }

    // Create journal entry
    const journalEntry = await prisma.journalEntry.create({
      data: {
        date: new Date(date),
        description,
        amount,
        debitAccountId,
        creditAccountId,
        userId,
        // GST fields
        gstRate,
        gstAmount: finalGstAmount,
        gstin,
        hsnCode,
        placeOfSupply,
        isInterState: isInterState || false,
        // TDS fields
        tdsSection,
        tdsRate,
        tdsAmount: finalTdsAmount,
        panNumber,
        // Additional fields
        isMsmeVendor: isMsmeVendor || false,
        invoiceNumber,
        vendorName,
      },
      include: {
        debitAccount: true,
        creditAccount: true,
        User: {
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
      // GST fields
      gstRate?: number;
      gstAmount?: number;
      gstin?: string;
      hsnCode?: string;
      placeOfSupply?: string;
      isInterState?: boolean;
      // TDS fields
      tdsSection?: string;
      tdsRate?: number;
      tdsAmount?: number;
      panNumber?: string;
      // Additional fields
      isMsmeVendor?: boolean;
      invoiceNumber?: string;
      vendorName?: string;
    }>,
    userId: string
  ) {
    // Validate all accounts exist first
    const accountIds = new Set<string>();
    transactions.forEach(t => {
      accountIds.add(t.debitAccountId);
      accountIds.add(t.creditAccountId);
    });

    const existingAccounts = await prisma.account.findMany({
      where: { id: { in: Array.from(accountIds) } },
      select: { id: true }
    });

    const existingAccountIds = new Set(existingAccounts.map(a => a.id));
    const missingAccounts = Array.from(accountIds).filter(id => !existingAccountIds.has(id));

    if (missingAccounts.length > 0) {
      throw new BadRequestException(`Accounts not found: ${missingAccounts.join(', ')}`);
    }

    // Validate GST and TDS fields for all transactions
    for (const transaction of transactions) {
      if (transaction.gstRate && !this.isValidGSTRate(transaction.gstRate)) {
        throw new BadRequestException(`Invalid GST rate in transaction: ${transaction.description}`);
      }
      if (transaction.gstin && !this.isValidGSTIN(transaction.gstin)) {
        throw new BadRequestException(`Invalid GSTIN in transaction: ${transaction.description}`);
      }
      if (transaction.tdsSection && !this.isValidTDSSection(transaction.tdsSection)) {
        throw new BadRequestException(`Invalid TDS section in transaction: ${transaction.description}`);
      }
      if (transaction.panNumber && !this.isValidPAN(transaction.panNumber)) {
        throw new BadRequestException(`Invalid PAN in transaction: ${transaction.description}`);
      }
    }

    // Create journal entries in a transaction
    const createdEntries = await prisma.$transaction(async (tx) => {
      const entries = [];
      
      for (const transaction of transactions) {
        // Auto-calculate GST amount if rate is provided but amount is not
        let finalGstAmount = transaction.gstAmount;
        if (transaction.gstRate && !transaction.gstAmount) {
          finalGstAmount = (transaction.amount * transaction.gstRate) / 100;
        }

        // Auto-calculate TDS amount if rate is provided but amount is not
        let finalTdsAmount = transaction.tdsAmount;
        if (transaction.tdsRate && !transaction.tdsAmount) {
          finalTdsAmount = (transaction.amount * transaction.tdsRate) / 100;
        }

        const entry = await tx.journalEntry.create({
          data: {
            date: new Date(transaction.date),
            description: transaction.description,
            amount: transaction.amount,
            debitAccountId: transaction.debitAccountId,
            creditAccountId: transaction.creditAccountId,
            userId,
            // GST fields
            gstRate: transaction.gstRate,
            gstAmount: finalGstAmount,
            gstin: transaction.gstin,
            hsnCode: transaction.hsnCode,
            placeOfSupply: transaction.placeOfSupply,
            isInterState: transaction.isInterState || false,
            // TDS fields
            tdsSection: transaction.tdsSection,
            tdsRate: transaction.tdsRate,
            tdsAmount: finalTdsAmount,
            panNumber: transaction.panNumber,
            // Additional fields
            isMsmeVendor: transaction.isMsmeVendor || false,
            invoiceNumber: transaction.invoiceNumber,
            vendorName: transaction.vendorName,
          },
          include: {
            debitAccount: true,
            creditAccount: true,
            User: {
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
        User: {
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
      // GST fields
      gstRate,
      gstAmount,
      gstin,
      hsnCode,
      placeOfSupply,
      isInterState,
      // TDS fields
      tdsSection,
      tdsRate,
      tdsAmount,
      panNumber,
      // Additional fields
      isMsmeVendor,
      invoiceNumber,
      vendorName
    } = updateJournalEntryDto;

    // Validate that accounts exist if provided
    if (debitAccountId) {
      const debitAccount = await prisma.account.findUnique({ where: { id: debitAccountId } });
      if (!debitAccount) {
        throw new BadRequestException('Debit account not found');
      }
    }

    if (creditAccountId) {
      const creditAccount = await prisma.account.findUnique({ where: { id: creditAccountId } });
      if (!creditAccount) {
        throw new BadRequestException('Credit account not found');
      }
    }

    // Validate GST and TDS fields if provided
    if (gstRate && !this.isValidGSTRate(gstRate)) {
      throw new BadRequestException('Invalid GST rate. Must be 0, 5, 12, 18, or 28');
    }

    if (gstin && !this.isValidGSTIN(gstin)) {
      throw new BadRequestException('Invalid GSTIN format. Must be 15 characters');
    }

    if (tdsSection && !this.isValidTDSSection(tdsSection)) {
      throw new BadRequestException('Invalid TDS section');
    }

    if (panNumber && !this.isValidPAN(panNumber)) {
      throw new BadRequestException('Invalid PAN format. Must be 10 characters');
    }

    // Auto-calculate GST and TDS amounts if rates are provided
    let finalGstAmount = gstAmount;
    if (gstRate && !gstAmount && amount) {
      finalGstAmount = (amount * gstRate) / 100;
    }

    let finalTdsAmount = tdsAmount;
    if (tdsRate && !tdsAmount && amount) {
      finalTdsAmount = (amount * tdsRate) / 100;
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
        // GST fields
        ...(gstRate && { gstRate }),
        ...(finalGstAmount && { gstAmount: finalGstAmount }),
        ...(gstin && { gstin }),
        ...(hsnCode && { hsnCode }),
        ...(placeOfSupply && { placeOfSupply }),
        ...(typeof isInterState === 'boolean' && { isInterState }),
        // TDS fields
        ...(tdsSection && { tdsSection }),
        ...(tdsRate && { tdsRate }),
        ...(finalTdsAmount && { tdsAmount: finalTdsAmount }),
        ...(panNumber && { panNumber }),
        // Additional fields
        ...(typeof isMsmeVendor === 'boolean' && { isMsmeVendor }),
        ...(invoiceNumber && { invoiceNumber }),
        ...(vendorName && { vendorName }),
      },
      include: {
        debitAccount: true,
        creditAccount: true,
        User: {
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