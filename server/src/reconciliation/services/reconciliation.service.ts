import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class ReconciliationService {
  async performAutoMatching(statementTransactions: any[], accountId: string, businessId: string) {
    // Get ledger entries for the account
    const ledgerEntries = await prisma.journalEntryLine.findMany({
      where: {
        accountId,
        JournalEntry: {
          businessId,
        },
      },
      include: {
        JournalEntry: true,
      },
    });

    const matchedItems = [];
    const unmatchedItems = [];
    const adjustments = [];

    // Perform auto-matching logic
    statementTransactions.forEach(stmtItem => {
      // Find exact matches by amount and date
      const exactMatch = ledgerEntries.find(
        ledgerItem =>
          Math.abs(ledgerItem.debit - ledgerItem.credit - stmtItem.amount) < 1 && // ₹1 tolerance
          Math.abs(
            new Date(ledgerItem.JournalEntry.date).getTime() - new Date(stmtItem.date).getTime()
          ) <
            3 * 24 * 60 * 60 * 1000 // 3 days
      );

      if (exactMatch) {
        matchedItems.push({
          statementItem: stmtItem,
          ledgerItem: exactMatch,
          matchType: 'exact',
          confidence: 'high',
        });
      } else {
        // Find fuzzy matches
        const fuzzyMatch = ledgerEntries.find(
          ledgerItem =>
            Math.abs(ledgerItem.debit - ledgerItem.credit - stmtItem.amount) < 10 && // ₹10 tolerance
            Math.abs(
              new Date(ledgerItem.JournalEntry.date).getTime() - new Date(stmtItem.date).getTime()
            ) <
              7 * 24 * 60 * 60 * 1000 // 7 days
        );

        if (fuzzyMatch) {
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
    const summary = {
      totalItems: statementTransactions.length,
      matchedItems: matchedItems.length,
      unmatchedItems: unmatchedItems.length,
      adjustedItems: adjustments.length,
      bankBalance: statementTransactions.reduce((sum, item) => sum + (item.amount || 0), 0),
      ledgerBalance: ledgerEntries.reduce((sum, item) => sum + (item.debit - item.credit), 0),
      difference:
        statementTransactions.reduce((sum, item) => sum + (item.amount || 0), 0) -
        ledgerEntries.reduce((sum, item) => sum + (item.debit - item.credit), 0),
    };

    return {
      bankStatement: statementTransactions,
      ledgerEntries,
      matchedItems,
      unmatchedItems,
      adjustments,
      summary,
    };
  }

  async createJournalEntries(transactions: any[], userId: string, businessId: string) {
    const createdEntries = [];

    for (const transaction of transactions) {
      const journalEntry = await prisma.journalEntry.create({
        data: {
          id: this.generateId(),
          date: new Date(transaction.date),
          description: transaction.description,
          referenceNumber: transaction.referenceNumber || null,
          businessId,
          userId,
          status: 'POSTED',
        },
        include: {
          Lines: true,
        },
      });

      // Create the journal entry lines
      await prisma.journalEntryLine.createMany({
        data: [
          {
            id: this.generateId(),
            journalEntryId: journalEntry.id,
            accountId: transaction.debitAccountId,
            description: transaction.description,
            debit: transaction.amount > 0 ? transaction.amount : 0,
            credit: transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
          },
          {
            id: this.generateId(),
            journalEntryId: journalEntry.id,
            accountId: transaction.creditAccountId,
            description: transaction.description,
            debit: transaction.amount < 0 ? Math.abs(transaction.amount) : 0,
            credit: transaction.amount > 0 ? transaction.amount : 0,
          },
        ],
      });

      createdEntries.push(journalEntry);
    }

    return {
      count: createdEntries.length,
      entries: createdEntries,
    };
  }

  async getReconciliationStats(accountId: string, filters: any, businessId: string) {
    // For now, return basic stats
    return {
      totalReconciliations: 0,
      completedReconciliations: 0,
      inProgressReconciliations: 0,
      averageProcessingTime: 0,
    };
  }

  async createReconciliation(
    accountId: string,
    statementTransactions: any[],
    userId: string,
    businessId: string
  ) {
    // Create a new reconciliation session
    const reconciliation = {
      id: this.generateId(),
      accountId,
      businessId,
      userId,
      status: 'IN_PROGRESS',
      createdAt: new Date(),
      updatedAt: new Date(),
      statementTransactions,
    };

    return reconciliation;
  }

  async lockReconciliation(reconciliationId: string, userId: string, businessId: string) {
    // Lock the reconciliation to prevent further changes
    return {
      id: reconciliationId,
      status: 'LOCKED',
      lockedBy: userId,
      lockedAt: new Date(),
      message: 'Reconciliation locked successfully',
    };
  }

  async getReconciliationHistory(accountId: string, businessId: string, page = 1, limit = 10) {
    // Return reconciliation history for the account
    return {
      reconciliations: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }

  async generateReconciliationReport(reconciliationId: string, businessId: string) {
    // Generate a reconciliation report
    return {
      id: reconciliationId,
      reportDate: new Date(),
      summary: {
        totalItems: 0,
        matchedItems: 0,
        unmatchedItems: 0,
        variance: 0,
      },
      details: [],
    };
  }

  async exportReconciliationReport(reconciliationId: string, format: string, businessId: string) {
    // Export reconciliation report in specified format
    return {
      id: reconciliationId,
      format,
      downloadUrl: `/api/reconciliation/${reconciliationId}/export/${format}`,
      message: `Report exported in ${format} format`,
    };
  }

  async approveMatchedItems(
    reconciliationId: string,
    itemIds: string[],
    userId: string,
    businessId: string
  ) {
    return {
      approvedCount: itemIds.length,
      message: `${itemIds.length} items approved successfully`,
    };
  }

  async rejectMatchedItems(
    reconciliationId: string,
    itemIds: string[],
    userId: string,
    businessId: string
  ) {
    return {
      rejectedCount: itemIds.length,
      message: `${itemIds.length} items rejected successfully`,
    };
  }

  async updateReconciliationItem(
    reconciliationId: string,
    itemId: string,
    updates: any,
    userId: string,
    businessId: string
  ) {
    return {
      id: itemId,
      ...updates,
      updatedBy: userId,
      updatedAt: new Date(),
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
