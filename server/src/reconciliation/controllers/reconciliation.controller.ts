import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReconciliationService } from '../services/reconciliation.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('reconciliation')
@UseGuards(JwtAuthGuard)
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Post('auto-match')
  async performAutoMatching(
    @Request() req,
    @Body() data: {
      statementTransactions: any[];
      accountId: string;
      businessId?: string;
    }
  ) {
    return this.reconciliationService.performAutoMatching(
      data.statementTransactions,
      data.accountId,
      data.businessId || req.user.businessId
    );
  }

  @Post('create')
  async createReconciliation(
    @Request() req,
    @Body() data: {
      accountId: string;
      statementDate: string;
      closingBalance: number;
      businessId?: string;
    }
  ) {
    return this.reconciliationService.createReconciliation(
      data.accountId,
      [], // statementTransactions - empty array for now
      req.user.id,
      data.businessId || req.user.businessId
    );
  }

  @Put(':id/lock')
  async lockReconciliation(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.reconciliationService.lockReconciliation(
      id,
      req.user.id,
      req.user.businessId
    );
  }

  @Get('history/:accountId')
  async getReconciliationHistory(
    @Request() req,
    @Param('accountId') accountId: string,
    @Query('businessId') businessId?: string
  ) {
    return this.reconciliationService.getReconciliationHistory(
      accountId,
      businessId || req.user.businessId
    );
  }

  @Get('report/:id')
  async generateReconciliationReport(
    @Request() req,
    @Param('id') id: string
  ) {
    return this.reconciliationService.generateReconciliationReport(
      id,
      req.user.businessId
    );
  }

  @Post('create-entries')
  async createJournalEntries(
    @Request() req,
    @Body() data: { transactions: any[] }
  ) {
    return this.reconciliationService.createJournalEntries(
      data.transactions,
      req.user.id,
      req.user.businessId
    );
  }

  @Get('report/:id/export')
  async exportReconciliationReport(
    @Request() req,
    @Param('id') id: string,
    @Query('format') format: string = 'pdf'
  ) {
    return this.reconciliationService.exportReconciliationReport(
      id,
      format,
      req.user.businessId
    );
  }

  @Get('stats/:accountId')
  async getReconciliationStats(
    @Request() req,
    @Param('accountId') accountId: string,
    @Query() filters: any
  ) {
    return this.reconciliationService.getReconciliationStats(
      accountId,
      filters,
      req.user.businessId
    );
  }

  @Post(':id/approve')
  async approveMatchedItems(
    @Request() req,
    @Param('id') id: string,
    @Body() data: { itemIds: string[] }
  ) {
    return this.reconciliationService.approveMatchedItems(
      id,
      data.itemIds,
      req.user.id,
      req.user.businessId
    );
  }

  @Post(':id/reject')
  async rejectMatchedItems(
    @Request() req,
    @Param('id') id: string,
    @Body() data: { itemIds: string[] }
  ) {
    return this.reconciliationService.rejectMatchedItems(
      id,
      data.itemIds,
      req.user.id,
      req.user.businessId
    );
  }

  @Put(':id/items/:itemId')
  async updateReconciliationItem(
    @Request() req,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() updates: any
  ) {
    return this.reconciliationService.updateReconciliationItem(
      id,
      itemId,
      updates,
      req.user.id,
      req.user.businessId
    );
  }
} 