import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JournalEntryService } from './journal-entries.service';
import { AccountingPeriod, JournalEntry } from '@prisma/client';

export interface CreateAdjustingEntryDto {
  date: Date;
  description: string;
  lines: Array<{
    accountId: string;
    debitAmount: number;
    creditAmount: number;
    description?: string;
  }>;
  businessId?: string;
  userId: string;
}

@Injectable()
export class PeriodClosingService {
  constructor(
    private prisma: PrismaService,
    private journalEntryService: JournalEntryService
  ) {}

  async closePeriod(
    businessId: string, 
    periodEndDate: Date,
    userId: string,
    adjustingEntries?: CreateAdjustingEntryDto[]
  ): Promise<AccountingPeriod> {
    // Create accounting period
    const period = await this.prisma.accountingPeriod.create({
      data: {
        businessId,
        periodName: this.generatePeriodName(periodEndDate),
        startDate: this.calculatePeriodStart(periodEndDate),
        endDate: periodEndDate,
        status: 'OPEN'
      }
    });

    // Process adjusting entries
    if (adjustingEntries?.length) {
      for (const entry of adjustingEntries) {
        await this.journalEntryService.createJournalEntry({
          ...entry,
          isAdjusting: true,
          accountingPeriodId: period.id
        });
      }
    }

    // Create closing entries
    await this.createClosingEntries(businessId, period.id, periodEndDate, userId);

    // Mark period as closed
    return this.prisma.accountingPeriod.update({
      where: { id: period.id },
      data: { 
        status: 'CLOSED',
        closedAt: new Date(),
        closedBy: userId
      }
    });
  }

  async createAdjustingEntry(data: CreateAdjustingEntryDto): Promise<JournalEntry> {
    return this.journalEntryService.createJournalEntry({
      ...data,
      isAdjusting: true,
      description: `Adjusting Entry: ${data.description}`
    });
  }

  async getAccountingPeriods(businessId: string): Promise<AccountingPeriod[]> {
    return this.prisma.accountingPeriod.findMany({
      where: { businessId },
      include: {
        AdjustingEntries: true,
        ClosedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { endDate: 'desc' }
    });
  }

  async getAccountingPeriod(id: string): Promise<AccountingPeriod | null> {
    return this.prisma.accountingPeriod.findUnique({
      where: { id },
      include: {
        AdjustingEntries: {
          include: {
            JournalEntryLines: {
              include: {
                Account: true
              }
            }
          }
        },
        ClosedBy: {
          select: { name: true, email: true }
        }
      }
    });
  }

  // Common adjusting entries
  async createDepreciationEntry(
    assetAccountId: string,
    depreciationExpenseAccountId: string,
    accumulatedDepreciationAccountId: string,
    amount: number,
    date: Date,
    businessId: string,
    userId: string
  ): Promise<JournalEntry> {
    return this.createAdjustingEntry({
      date,
      description: 'Monthly depreciation expense',
      businessId,
      userId,
      lines: [
        {
          accountId: depreciationExpenseAccountId,
          debitAmount: amount,
          creditAmount: 0,
          description: 'Depreciation expense'
        },
        {
          accountId: accumulatedDepreciationAccountId,
          debitAmount: 0,
          creditAmount: amount,
          description: 'Accumulated depreciation'
        }
      ]
    });
  }

  async createAccrualEntry(
    expenseAccountId: string,
    payableAccountId: string,
    amount: number,
    date: Date,
    description: string,
    businessId: string,
    userId: string
  ): Promise<JournalEntry> {
    return this.createAdjustingEntry({
      date,
      description: `Accrued ${description}`,
      businessId,
      userId,
      lines: [
        {
          accountId: expenseAccountId,
          debitAmount: amount,
          creditAmount: 0,
          description: `Accrued ${description}`
        },
        {
          accountId: payableAccountId,
          debitAmount: 0,
          creditAmount: amount,
          description: `Accrued ${description} payable`
        }
      ]
    });
  }

  async createPrepaidExpenseEntry(
    prepaidAccountId: string,
    expenseAccountId: string,
    amount: number,
    date: Date,
    description: string,
    businessId: string,
    userId: string
  ): Promise<JournalEntry> {
    return this.createAdjustingEntry({
      date,
      description: `Prepaid expense adjustment: ${description}`,
      businessId,
      userId,
      lines: [
        {
          accountId: expenseAccountId,
          debitAmount: amount,
          creditAmount: 0,
          description: `Expense for ${description}`
        },
        {
          accountId: prepaidAccountId,
          debitAmount: 0,
          creditAmount: amount,
          description: `Reduction in prepaid ${description}`
        }
      ]
    });
  }

  async createUnearnedRevenueEntry(
    unearnedRevenueAccountId: string,
    revenueAccountId: string,
    amount: number,
    date: Date,
    description: string,
    businessId: string,
    userId: string
  ): Promise<JournalEntry> {
    return this.createAdjustingEntry({
      date,
      description: `Unearned revenue adjustment: ${description}`,
      businessId,
      userId,
      lines: [
        {
          accountId: unearnedRevenueAccountId,
          debitAmount: amount,
          creditAmount: 0,
          description: `Reduction in unearned revenue for ${description}`
        },
        {
          accountId: revenueAccountId,
          debitAmount: 0,
          creditAmount: amount,
          description: `Revenue earned for ${description}`
        }
      ]
    });
  }

  private async createClosingEntries(
    businessId: string, 
    periodId: string, 
    periodEndDate: Date,
    userId: string
  ): Promise<void> {
    // Get revenue and expense account balances
    const revenueAccounts = await this.getAccountBalancesByType(businessId, 'REVENUE', periodEndDate);
    const expenseAccounts = await this.getAccountBalancesByType(businessId, 'EXPENSE', periodEndDate);

    // Calculate net income
    const totalRevenue = revenueAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenseAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const netIncome = totalRevenue - totalExpenses;

    // Close revenue accounts
    if (totalRevenue > 0) {
      const revenueClosingLines = revenueAccounts.map(acc => ({
        accountId: acc.id,
        debitAmount: acc.balance,
        creditAmount: 0,
        description: 'Closing revenue accounts'
      }));

      const incomeSummaryAccountId = await this.getIncomeSummaryAccountId(businessId);
      if (incomeSummaryAccountId) {
        revenueClosingLines.push({
          accountId: incomeSummaryAccountId,
          debitAmount: 0,
          creditAmount: totalRevenue,
          description: 'Closing revenue accounts'
        });

        await this.journalEntryService.createJournalEntry({
          date: periodEndDate,
          description: 'Close revenue accounts',
          businessId,
          userId,
          lines: revenueClosingLines,
          isClosing: true,
          accountingPeriodId: periodId
        });
      }
    }

    // Close expense accounts
    if (totalExpenses > 0) {
      const expenseClosingLines = expenseAccounts.map(acc => ({
        accountId: acc.id,
        debitAmount: 0,
        creditAmount: acc.balance,
        description: 'Closing expense accounts'
      }));

      const incomeSummaryAccountId = await this.getIncomeSummaryAccountId(businessId);
      if (incomeSummaryAccountId) {
        expenseClosingLines.push({
          accountId: incomeSummaryAccountId,
          debitAmount: totalExpenses,
          creditAmount: 0,
          description: 'Closing expense accounts'
        });

        await this.journalEntryService.createJournalEntry({
          date: periodEndDate,
          description: 'Close expense accounts',
          businessId,
          userId,
          lines: expenseClosingLines,
          isClosing: true,
          accountingPeriodId: periodId
        });
      }
    }

    // Close income summary to retained earnings
    if (netIncome !== 0) {
      const incomeSummaryAccountId = await this.getIncomeSummaryAccountId(businessId);
      const retainedEarningsAccountId = await this.getRetainedEarningsAccountId(businessId);
      
      if (incomeSummaryAccountId && retainedEarningsAccountId) {
        await this.journalEntryService.createJournalEntry({
          date: periodEndDate,
          description: 'Close income summary to retained earnings',
          businessId,
          userId,
          lines: [
            {
              accountId: incomeSummaryAccountId,
              debitAmount: netIncome > 0 ? netIncome : 0,
              creditAmount: netIncome < 0 ? Math.abs(netIncome) : 0,
              description: 'Close income summary'
            },
            {
              accountId: retainedEarningsAccountId,
              debitAmount: netIncome < 0 ? Math.abs(netIncome) : 0,
              creditAmount: netIncome > 0 ? netIncome : 0,
              description: 'Transfer to retained earnings'
            }
          ],
          isClosing: true,
          accountingPeriodId: periodId
        });
      }
    }
  }

  private generatePeriodName(endDate: Date): string {
    const month = endDate.toLocaleString('default', { month: 'long' });
    const year = endDate.getFullYear();
    return `${month} ${year}`;
  }

  private calculatePeriodStart(endDate: Date): Date {
    // For monthly periods, start from the first day of the month
    const startDate = new Date(endDate);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    return startDate;
  }

  private async getAccountBalancesByType(
    businessId: string, 
    type: string, 
    asOfDate: Date
  ): Promise<Array<{ id: string; balance: number }>> {
    // This would need to be implemented based on your account structure
    // For now, returning empty array as placeholder
    return [];
  }

  private async getIncomeSummaryAccountId(businessId: string): Promise<string | null> {
    // Find or create income summary account
    const account = await this.prisma.accountHead.findFirst({
      where: {
        businessId,
        name: { contains: 'Income Summary', mode: 'insensitive' }
      }
    });
    return account?.id || null;
  }

  private async getRetainedEarningsAccountId(businessId: string): Promise<string | null> {
    // Find or create retained earnings account
    const account = await this.prisma.accountHead.findFirst({
      where: {
        businessId,
        name: { contains: 'Retained Earnings', mode: 'insensitive' }
      }
    });
    return account?.id || null;
  }
} 