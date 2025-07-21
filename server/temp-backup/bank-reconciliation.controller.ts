import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { BankReconciliationService, CreateReconciliationDto } from '../services/bank-reconciliation.service';

@Controller('bank-reconciliation')
@UseGuards(JwtAuthGuard)
export class BankReconciliationController {
  constructor(private bankReconciliationService: BankReconciliationService) {}

  @Post('auto-match')
  async performAutoReconciliation(
    @Body() body: { accountId: string; bankStatementId: string },
    @Request() req: any
  ) {
    return this.bankReconciliationService.performAutoReconciliation(
      body.accountId,
      body.bankStatementId
    );
  }

  @Post()
  async createReconciliation(
    @Body() data: CreateReconciliationDto,
    @Request() req: any
  ) {
    return this.bankReconciliationService.createReconciliation({
      ...data,
      userId: req.user.id
    });
  }

  @Get(':id')
  async getReconciliation(@Param('id') id: string) {
    return this.bankReconciliationService.getReconciliation(id);
  }

  @Get('account/:accountId')
  async getReconciliationsByAccount(@Param('accountId') accountId: string) {
    return this.bankReconciliationService.getReconciliationsByAccount(accountId);
  }

  @Post(':id/manual-match')
  async manualMatch(
    @Param('id') reconciliationId: string,
    @Body() body: { bankLineId: string; transactionId: string }
  ) {
    return this.bankReconciliationService.manualMatch(
      reconciliationId,
      body.bankLineId,
      body.transactionId
    );
  }

  @Post(':id/outstanding-item')
  async createOutstandingItem(
    @Param('id') reconciliationId: string,
    @Body() data: {
      type: string;
      description: string;
      amount: number;
      transactionId?: string;
    }
  ) {
    return this.bankReconciliationService.createOutstandingItem(reconciliationId, data);
  }
} 