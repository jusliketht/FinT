import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BankReconciliation, BankStatementLine, Transaction } from '@prisma/client';

export interface AutoReconciliationResultDto {
  totalMatches: number;
  matches: Array<{
    bankLineId: string;
    transactionId: string;
    matchScore: number;
    isManual: boolean;
  }>;
  unmatchedBankLines: BankStatementLine[];
  unmatchedTransactions: Transaction[];
  reconciliationVariance: number;
}

export interface CreateReconciliationDto {
  accountId: string;
  bankStatementId?: string;
  reconciliationDate: Date;
  statementBalance: number;
  userId: string;
  businessId?: string;
}

@Injectable()
export class BankReconciliationService {
  constructor(private prisma: PrismaService) {}

  async performAutoReconciliation(
    accountId: string, 
    bankStatementId: string
  ): Promise<AutoReconciliationResultDto> {
    const bankLines = await this.getBankStatementLines(bankStatementId);
    const transactions = await this.getUnreconciledTransactions(accountId);
    
    const matches = [];
    const unmatchedBankLines = [];
    const unmatchedTransactions = [];

    // Auto-matching algorithm
    for (const bankLine of bankLines) {
      const matchingTransaction = this.findMatchingTransaction(bankLine, transactions);
      
      if (matchingTransaction) {
        matches.push({
          bankLineId: bankLine.id,
          transactionId: matchingTransaction.id,
          matchScore: this.calculateMatchScore(bankLine, matchingTransaction),
          isManual: false
        });
        
        // Mark as matched
        await this.markAsMatched(bankLine.id, matchingTransaction.id);
      } else {
        unmatchedBankLines.push(bankLine);
      }
    }

    // Find unmatched transactions
    const matchedTransactionIds = matches.map(m => m.transactionId);
    unmatchedTransactions.push(
      ...transactions.filter(t => !matchedTransactionIds.includes(t.id))
    );

    return {
      totalMatches: matches.length,
      matches,
      unmatchedBankLines,
      unmatchedTransactions,
      reconciliationVariance: this.calculateVariance(matches)
    };
  }

  async createReconciliation(data: CreateReconciliationDto): Promise<BankReconciliation> {
    const bookBalance = await this.calculateBookBalance(data.accountId, data.reconciliationDate);
    
    return this.prisma.bankReconciliation.create({
      data: {
        ...data,
        bookBalance,
        adjustedBalance: this.calculateAdjustedBalance(bookBalance, data.statementBalance)
      },
      include: {
        ReconciliationItems: true,
        Account: true
      }
    });
  }

  async getReconciliation(id: string): Promise<BankReconciliation | null> {
    return this.prisma.bankReconciliation.findUnique({
      where: { id },
      include: {
        ReconciliationItems: {
          include: {
            Transaction: true
          }
        },
        Account: true,
        BankStatement: {
          include: {
            BankStatementLines: true
          }
        }
      }
    });
  }

  async getReconciliationsByAccount(accountId: string): Promise<BankReconciliation[]> {
    return this.prisma.bankReconciliation.findMany({
      where: { accountId },
      include: {
        ReconciliationItems: true,
        Account: true
      },
      orderBy: { reconciliationDate: 'desc' }
    });
  }

  async manualMatch(
    reconciliationId: string,
    bankLineId: string,
    transactionId: string
  ): Promise<void> {
    // Create reconciliation item
    await this.prisma.bankReconciliationItem.create({
      data: {
        reconciliationId,
        transactionId,
        statementLineId: bankLineId,
        type: 'MANUAL_MATCH',
        description: 'Manual match',
        amount: 0, // Will be calculated from transaction
        isCleared: true,
        clearingDate: new Date()
      }
    });

    // Mark bank line as matched
    await this.markAsMatched(bankLineId, transactionId);
  }

  async createOutstandingItem(
    reconciliationId: string,
    data: {
      type: string;
      description: string;
      amount: number;
      transactionId?: string;
    }
  ): Promise<any> {
    return this.prisma.bankReconciliationItem.create({
      data: {
        reconciliationId,
        transactionId: data.transactionId,
        type: data.type,
        description: data.description,
        amount: data.amount,
        isCleared: false
      }
    });
  }

  private async getBankStatementLines(bankStatementId: string): Promise<BankStatementLine[]> {
    return this.prisma.bankStatementLine.findMany({
      where: {
        bankStatementId,
        isMatched: false
      },
      orderBy: { transactionDate: 'asc' }
    });
  }

  private async getUnreconciledTransactions(accountId: string): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        accountId,
        // Add logic to find unreconciled transactions
        // This might need additional fields in the Transaction model
      },
      orderBy: { date: 'asc' }
    });
  }

  private findMatchingTransaction(
    bankLine: BankStatementLine, 
    transactions: Transaction[]
  ): Transaction | null {
    // Exact amount and date match
    let match = transactions.find(t => 
      Math.abs(t.amount - Math.abs(bankLine.amount)) < 0.01 &&
      this.isSameDate(t.date, bankLine.transactionDate)
    );

    if (match) return match;

    // Amount match within 3 days
    match = transactions.find(t => 
      Math.abs(t.amount - Math.abs(bankLine.amount)) < 0.01 &&
      this.isWithinDays(t.date, bankLine.transactionDate, 3)
    );

    if (match) return match;

    // Fuzzy description match with exact amount
    match = transactions.find(t => 
      Math.abs(t.amount - Math.abs(bankLine.amount)) < 0.01 &&
      this.calculateDescriptionSimilarity(t.description, bankLine.description) > 0.8
    );

    return match;
  }

  private calculateMatchScore(bankLine: BankStatementLine, transaction: Transaction): number {
    let score = 0;
    
    // Amount match (50% weight)
    if (Math.abs(transaction.amount - Math.abs(bankLine.amount)) < 0.01) {
      score += 0.5;
    }
    
    // Date match (30% weight)
    if (this.isSameDate(transaction.date, bankLine.transactionDate)) {
      score += 0.3;
    } else if (this.isWithinDays(transaction.date, bankLine.transactionDate, 3)) {
      score += 0.2;
    }
    
    // Description similarity (20% weight)
    score += this.calculateDescriptionSimilarity(transaction.description, bankLine.description) * 0.2;
    
    return score;
  }

  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    const words1 = desc1.toLowerCase().split(/\s+/);
    const words2 = desc2.toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    const totalWords = new Set([...words1, ...words2]).size;
    
    return totalWords > 0 ? commonWords.length / totalWords : 0;
  }

  private isSameDate(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  private isWithinDays(date1: Date, date2: Date, days: number): boolean {
    const diffTime = Math.abs(date1.getTime() - date2.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }

  private async markAsMatched(bankLineId: string, transactionId: string): Promise<void> {
    await this.prisma.bankStatementLine.update({
      where: { id: bankLineId },
      data: {
        isMatched: true,
        matchedTransactionId: transactionId
      }
    });
  }

  private async calculateBookBalance(accountId: string, asOfDate: Date): Promise<number> {
    // Calculate book balance from transactions and journal entries
    const transactions = await this.prisma.transaction.findMany({
      where: {
        accountId,
        date: { lte: asOfDate }
      }
    });

    const journalEntries = await this.prisma.journalEntryLine.findMany({
      where: {
        accountId,
        JournalEntry: {
          date: { lte: asOfDate }
        }
      },
      include: {
        JournalEntry: true
      }
    });

    let balance = 0;
    
    // Add transaction amounts
    transactions.forEach(t => {
      balance += t.amount;
    });

    // Add journal entry amounts (debits increase, credits decrease for asset accounts)
    journalEntries.forEach(line => {
      balance += line.debitAmount - line.creditAmount;
    });

    return balance;
  }

  private calculateAdjustedBalance(bookBalance: number, statementBalance: number): number {
    // Calculate adjusted balance considering outstanding items
    return bookBalance; // This would include logic for outstanding checks, deposits in transit, etc.
  }

  private calculateVariance(matches: any[]): number {
    // Calculate variance between matched amounts
    return 0; // Placeholder
  }
} 