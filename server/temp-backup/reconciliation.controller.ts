import { Controller, Post, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReconciliationService } from '../services/reconciliation.service';
import { JournalEntriesService } from '../services/journal-entries.service';

@Controller('reconciliation')
@UseGuards(JwtAuthGuard)
export class ReconciliationController {
  constructor(
    private readonly reconciliationService: ReconciliationService,
    private readonly journalEntriesService: JournalEntriesService,
  ) {}

  /**
   * Perform auto-matching for reconciliation
   */
  @Post('auto-match')
  async performAutoMatching(
    @Body() body: {
      statementTransactions: any[];
      accountId: string;
      businessId?: string;
    },
    @Request() req: any
  ) {
    const { statementTransactions, accountId, businessId } = body;
    const userId = req.user.id;

    return await this.reconciliationService.performAutoMatching(
      statementTransactions,
      accountId,
      userId,
      businessId
    );
  }

  /**
   * Create reconciliation record
   */
  @Post()
  async createReconciliation(
    @Body() body: {
      accountId: string;
      statementDate: string;
      closingBalance: number;
      businessId?: string;
    },
    @Request() req: any
  ) {
    const { accountId, statementDate, closingBalance, businessId } = body;
    const userId = req.user.id;

    return await this.reconciliationService.createReconciliation(
      accountId,
      new Date(statementDate),
      closingBalance,
      userId,
      businessId
    );
  }

  /**
   * Lock reconciliation period
   */
  @Put(':id/lock')
  async lockReconciliation(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return await this.reconciliationService.lockReconciliation(id, userId);
  }

  /**
   * Get reconciliation history for an account
   */
  @Get('history/:accountId')
  async getReconciliationHistory(
    @Param('accountId') accountId: string,
    @Request() req: any,
    @Query('businessId') businessId?: string
  ) {
    const userId = req.user.id;
    return await this.reconciliationService.getReconciliationHistory(
      accountId,
      userId,
      businessId
    );
  }

  /**
   * Generate reconciliation report
   */
  @Get('report/:id')
  async generateReconciliationReport(
    @Param('id') id: string,
    @Request() req: any
  ) {
    const userId = req.user.id;
    return await this.reconciliationService.generateReconciliationReport(id, userId);
  }

  /**
   * Create journal entries from unmatched transactions
   */
  @Post('create-entries')
  async createJournalEntries(
    @Body() body: {
      transactions: Array<{
        date: string;
        description: string;
        amount: number;
        type: 'credit' | 'debit';
        debitAccountId: string;
        creditAccountId: string;
        gstRate?: number;
        gstAmount?: number;
        gstin?: string;
        hsnCode?: string;
        placeOfSupply?: string;
        isInterState?: boolean;
        tdsSection?: string;
        tdsRate?: number;
        tdsAmount?: number;
        panNumber?: string;
        isMsmeVendor?: boolean;
        invoiceNumber?: string;
        vendorName?: string;
      }>;
    },
    @Request() req: any
  ) {
    const { transactions } = body;
    const userId = req.user.id;

    return await this.journalEntriesService.createBatchFromTransactions(
      transactions,
      userId
    );
  }
} 