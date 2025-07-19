import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ReconciliationMatch {
  statementItem: any;
  ledgerItem: any;
  matchType: 'exact' | 'fuzzy' | 'none';
  confidence: 'high' | 'medium' | 'low';
  needsReview?: boolean;
  needsCreation?: boolean;
}

export interface ReconciliationResult {
  bankStatement: any[];
  ledgerEntries: any[];
  matchedItems: ReconciliationMatch[];
  unmatchedItems: ReconciliationMatch[];
  adjustments: ReconciliationMatch[];
  summary: {
    totalItems: number;
    matchedItems: number;
    unmatchedItems: number;
    adjustedItems: number;
    bankBalance: number;
    ledgerBalance: number;
    difference: number;
  };
}

@Injectable()
export class ReconciliationService {
  private readonly logger = new Logger(ReconciliationService.name);

  /**
   * Perform auto-matching between bank statement transactions and ledger entries
   */
  async performAutoMatching(
    statementTransactions: any[],
    accountId: string,
    userId: string,
    businessId?: string
  ): Promise<ReconciliationResult> {
    try {
      // Fetch ledger entries for the specified account
      const ledgerEntries = await this.getLedgerEntries(accountId, userId, businessId);
      
      const matchedItems: ReconciliationMatch[] = [];
      const unmatchedItems: ReconciliationMatch[] = [];
      const adjustments: ReconciliationMatch[] = [];

      // Track used ledger entries to avoid double-matching
      const usedLedgerEntries = new Set<string>();

      statementTransactions.forEach(stmtItem => {
        // Find exact matches by amount and date
        const exactMatch = ledgerEntries.find(ledgerItem => 
          !usedLedgerEntries.has(ledgerItem.id) &&
          Math.abs(ledgerItem.amount - stmtItem.amount) < 1 && // ₹1 tolerance
          Math.abs(new Date(ledgerItem.date).getTime() - new Date(stmtItem.date).getTime()) < 3 * 24 * 60 * 60 * 1000 // 3 days
        );

        if (exactMatch) {
          usedLedgerEntries.add(exactMatch.id);
          matchedItems.push({
            statementItem: stmtItem,
            ledgerItem: exactMatch,
            matchType: 'exact',
            confidence: 'high',
          });
        } else {
          // Find fuzzy matches
          const fuzzyMatch = ledgerEntries.find(ledgerItem => 
            !usedLedgerEntries.has(ledgerItem.id) &&
            Math.abs(ledgerItem.amount - stmtItem.amount) < 10 && // ₹10 tolerance
            Math.abs(new Date(ledgerItem.date).getTime() - new Date(stmtItem.date).getTime()) < 7 * 24 * 60 * 60 * 1000 // 7 days
          );

          if (fuzzyMatch) {
            usedLedgerEntries.add(fuzzyMatch.id);
            adjustments.push({
              statementItem: stmtItem,
              ledgerItem: fuzzyMatch,
              matchType: 'fuzzy',
              confidence: 'medium',
              needsReview: true,
            });
          } else {
            unmatchedItems.push({
              statementItem: stmtItem,
              ledgerItem: null,
              matchType: 'none',
              confidence: 'low',
              needsCreation: true,
            });
          }
        }
      });

      // Calculate summary statistics
      const summary = this.calculateReconciliationStats(
        statementTransactions,
        ledgerEntries,
        matchedItems,
        unmatchedItems,
        adjustments
      );

      return {
        bankStatement: statementTransactions,
        ledgerEntries,
        matchedItems,
        unmatchedItems,
        adjustments,
        summary,
      };
    } catch (error) {
      this.logger.error('Error performing auto-matching:', error);
      throw new BadRequestException('Failed to perform reconciliation matching');
    }
  }

  /**
   * Get ledger entries for a specific account
   */
  private async getLedgerEntries(accountId: string, userId: string, businessId?: string) {
    const whereClause: any = {
      userId,
      OR: [
        { debitAccountId: accountId },
        { creditAccountId: accountId }
      ]
    };

    if (businessId) {
      whereClause.businessId = businessId;
    }

    const journalEntries = await prisma.journalEntry.findMany({
      where: whereClause,
      include: {
        debitAccount: true,
        creditAccount: true,
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Transform journal entries to ledger format
    return journalEntries.map(entry => ({
      id: entry.id,
      date: entry.date,
      description: entry.description,
      amount: entry.amount,
      type: entry.debitAccountId === accountId ? 'debit' : 'credit',
      referenceNumber: entry.referenceNumber || null,
      account: entry.debitAccountId === accountId ? entry.debitAccount : entry.creditAccount,
    }));
  }

  /**
   * Calculate reconciliation statistics
   */
  private calculateReconciliationStats(
    statementTransactions: any[],
    ledgerEntries: any[],
    matchedItems: ReconciliationMatch[],
    unmatchedItems: ReconciliationMatch[],
    adjustments: ReconciliationMatch[]
  ) {
    const totalItems = statementTransactions.length;
    const matchedItemsCount = matchedItems.length;
    const unmatchedItemsCount = unmatchedItems.length;
    const adjustedItemsCount = adjustments.length;

    const bankBalance = statementTransactions.reduce((sum, item) => sum + (item.amount || 0), 0);
    const ledgerBalance = ledgerEntries.reduce((sum, item) => sum + (item.amount || 0), 0);
    const difference = bankBalance - ledgerBalance;

    return {
      totalItems,
      matchedItems: matchedItemsCount,
      unmatchedItems: unmatchedItemsCount,
      adjustedItems: adjustedItemsCount,
      bankBalance,
      ledgerBalance,
      difference,
    };
  }

  /**
   * Create reconciliation record
   */
  async createReconciliation(
    accountId: string,
    statementDate: Date,
    closingBalance: number,
    userId: string,
    businessId?: string
  ) {
    return await prisma.reconciliation.create({
      data: {
        accountId,
        statementDate,
        closingBalance,
        userId,
        businessId,
        isLocked: false,
      }
    });
  }

  /**
   * Lock reconciliation period
   */
  async lockReconciliation(reconciliationId: string, userId: string) {
    const reconciliation = await prisma.reconciliation.findFirst({
      where: { id: reconciliationId, userId }
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return await prisma.reconciliation.update({
      where: { id: reconciliationId },
      data: { isLocked: true }
    });
  }

  /**
   * Get reconciliation history
   */
  async getReconciliationHistory(accountId: string, userId: string, businessId?: string) {
    const whereClause: any = {
      accountId,
      userId
    };

    if (businessId) {
      whereClause.businessId = businessId;
    }

    return await prisma.reconciliation.findMany({
      where: whereClause,
      orderBy: {
        statementDate: 'desc'
      },
      include: {
        account: true
      }
    });
  }

  /**
   * Generate reconciliation report
   */
  async generateReconciliationReport(
    reconciliationId: string,
    userId: string
  ) {
    const reconciliation = await prisma.reconciliation.findFirst({
      where: { id: reconciliationId, userId },
      include: {
        account: true,
        statementLines: true
      }
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation not found');
    }

    return {
      reconciliation,
      report: {
        openingBalance: 0, // TODO: Calculate from previous reconciliation
        depositsInTransit: 0, // TODO: Calculate from unmatched credits
        outstandingChecks: 0, // TODO: Calculate from unmatched debits
        adjustedBalance: reconciliation.closingBalance,
        bankStatementBalance: reconciliation.closingBalance,
        difference: 0,
      }
    };
  }
} 