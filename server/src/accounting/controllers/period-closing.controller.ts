import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PeriodClosingService, CreateAdjustingEntryDto } from '../services/period-closing.service';

@Controller('period-closing')
@UseGuards(JwtAuthGuard)
export class PeriodClosingController {
  constructor(private periodClosingService: PeriodClosingService) {}

  @Post('close-period')
  async closePeriod(
    @Body() body: {
      businessId: string;
      periodEndDate: Date;
      adjustingEntries?: CreateAdjustingEntryDto[];
    },
    @Request() req: any
  ) {
    return this.periodClosingService.closePeriod(
      body.businessId,
      new Date(body.periodEndDate),
      req.user.id,
      body.adjustingEntries
    );
  }

  @Post('adjusting-entry')
  async createAdjustingEntry(
    @Body() data: CreateAdjustingEntryDto,
    @Request() req: any
  ) {
    return this.periodClosingService.createAdjustingEntry({
      ...data,
      userId: req.user.id
    });
  }

  @Get('periods/:businessId')
  async getAccountingPeriods(@Param('businessId') businessId: string) {
    return this.periodClosingService.getAccountingPeriods(businessId);
  }

  @Get('period/:id')
  async getAccountingPeriod(@Param('id') id: string) {
    return this.periodClosingService.getAccountingPeriod(id);
  }

  @Post('depreciation')
  async createDepreciationEntry(
    @Body() body: {
      assetAccountId: string;
      depreciationExpenseAccountId: string;
      accumulatedDepreciationAccountId: string;
      amount: number;
      date: Date;
      businessId: string;
    },
    @Request() req: any
  ) {
    return this.periodClosingService.createDepreciationEntry(
      body.assetAccountId,
      body.depreciationExpenseAccountId,
      body.accumulatedDepreciationAccountId,
      body.amount,
      new Date(body.date),
      body.businessId,
      req.user.id
    );
  }

  @Post('accrual')
  async createAccrualEntry(
    @Body() body: {
      expenseAccountId: string;
      payableAccountId: string;
      amount: number;
      date: Date;
      description: string;
      businessId: string;
    },
    @Request() req: any
  ) {
    return this.periodClosingService.createAccrualEntry(
      body.expenseAccountId,
      body.payableAccountId,
      body.amount,
      new Date(body.date),
      body.description,
      body.businessId,
      req.user.id
    );
  }

  @Post('prepaid-expense')
  async createPrepaidExpenseEntry(
    @Body() body: {
      prepaidAccountId: string;
      expenseAccountId: string;
      amount: number;
      date: Date;
      description: string;
      businessId: string;
    },
    @Request() req: any
  ) {
    return this.periodClosingService.createPrepaidExpenseEntry(
      body.prepaidAccountId,
      body.expenseAccountId,
      body.amount,
      new Date(body.date),
      body.description,
      body.businessId,
      req.user.id
    );
  }

  @Post('unearned-revenue')
  async createUnearnedRevenueEntry(
    @Body() body: {
      unearnedRevenueAccountId: string;
      revenueAccountId: string;
      amount: number;
      date: Date;
      description: string;
      businessId: string;
    },
    @Request() req: any
  ) {
    return this.periodClosingService.createUnearnedRevenueEntry(
      body.unearnedRevenueAccountId,
      body.revenueAccountId,
      body.amount,
      new Date(body.date),
      body.description,
      body.businessId,
      req.user.id
    );
  }
} 