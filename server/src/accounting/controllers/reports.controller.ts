import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('trial-balance')
  async getTrialBalance(
    @Request() req,
    @Query('businessId') businessId?: string,
    @Query('asOfDate') asOfDate?: string
  ) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.reportsService.generateTrialBalance(
      req.user.id,
      businessId || req.user.businessId,
      date
    );
  }

  @Get('balance-sheet')
  async getBalanceSheet(
    @Request() req,
    @Query('businessId') businessId?: string,
    @Query('asOfDate') asOfDate?: string
  ) {
    const date = asOfDate ? new Date(asOfDate) : undefined;
    return this.reportsService.generateBalanceSheet(
      req.user.id,
      businessId || req.user.businessId,
      date
    );
  }

  @Get('profit-and-loss')
  async getProfitAndLoss(
    @Request() req,
    @Query('businessId') businessId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.generateProfitAndLoss(
      req.user.id,
      businessId || req.user.businessId,
      start,
      end
    );
  }

  @Get('cash-flow')
  async getCashFlow(
    @Request() req,
    @Query('businessId') businessId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.reportsService.generateCashFlow(
      req.user.id,
      businessId || req.user.businessId,
      start,
      end
    );
  }
} 