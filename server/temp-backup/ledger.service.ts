import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class LedgerService {
  async getAccountLedger(accountId: string, businessId: string, startDate?: Date, endDate?: Date): Promise<any[]> {
    const where: any = {
      businessId: businessId,
      OR: [
        { debitAccountId: accountId },
        { creditAccountId: accountId }
      ]
    };

    if (startDate) {
      where.date = { ...where.date, gte: startDate };
    }
    if (endDate) {
      where.date = { ...where.date, lte: endDate };
    }

    const ledgerEntries = await prisma.journalEntry.findMany({
      where,
      orderBy: { date: 'asc' },
      include: {
        debitAccount: true,
        creditAccount: true,
      },
    });

    let runningBalance = 0;
    const ledgerReport = ledgerEntries.map(entry => {
      let debit = 0;
      let credit = 0;
      
      if (entry.debitAccountId === accountId) {
        debit = entry.amount;
        runningBalance += entry.amount;
      } else if (entry.creditAccountId === accountId) {
        credit = entry.amount;
        runningBalance -= entry.amount;
      }

      return {
        date: entry.date,
        description: entry.description,
        debit: debit,
        credit: credit,
        balance: runningBalance,
        journalEntryId: entry.id,
        accountHeadName: entry.debitAccountId === accountId ? entry.debitAccount.name : entry.creditAccount.name,
      };
    });

    return ledgerReport;
  }

  async getLedgerForBusiness(businessId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const accounts = await prisma.accountHead.findMany({
      where: {
        businessId: businessId,
      },
    });

    const allLedgers = {};
    for (const account of accounts) {
      allLedgers[account.name] = await this.getAccountLedger(account.id, businessId, startDate, endDate);
    }
    return allLedgers;
  }
} 