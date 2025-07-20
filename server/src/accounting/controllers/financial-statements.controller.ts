import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { FinancialStatementsService } from '../services/financial-statements.service';

@Controller('financial-statements')
@UseGuards(JwtAuthGuard)
export class FinancialStatementsController {
  constructor(private readonly financialStatementsService: FinancialStatementsService) {}

  @Get('balance-sheet')
  async getBalanceSheet(
    @Query('businessId') businessId: string,
    @Query('asOfDate') asOfDate: string,
    @GetUser() user: any
  ) {
    const date = asOfDate ? new Date(asOfDate) : new Date();
    return this.financialStatementsService.getBalanceSheet(businessId, date);
  }

  @Get('income-statement')
  async getIncomeStatement(
    @Query('businessId') businessId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @GetUser() user: any
  ) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return this.financialStatementsService.getIncomeStatement(businessId, from, to);
  }

  @Get('cash-flow')
  async getCashFlowStatement(
    @Query('businessId') businessId: string,
    @Query('fromDate') fromDate: string,
    @Query('toDate') toDate: string,
    @GetUser() user: any
  ) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return this.financialStatementsService.getCashFlowStatement(businessId, from, to);
  }

  @Get('trial-balance')
  async getTrialBalance(
    @Query('businessId') businessId: string,
    @Query('asOfDate') asOfDate: string,
    @GetUser() user: any
  ) {
    const date = asOfDate ? new Date(asOfDate) : new Date();
    return this.financialStatementsService.getTrialBalance(businessId, date);
  }
} 