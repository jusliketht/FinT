import { Controller, Get, Query, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AnalyticsService } from '../services/analytics.service';

@Controller('analytics')
// @UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('kpis')
  async getKPIs(@Query('businessId') businessId: string, @Query('period') period?: string) {
    if (!businessId) {
      throw new Error('businessId is required');
    }
    return this.analyticsService.calculateKPIs(businessId, period);
  }

  @Get('cash-flow')
  async getCashFlowReport(@Query('businessId') businessId: string, @Query('period') period?: string) {
    if (!businessId) {
      throw new Error('businessId is required');
    }
    return this.analyticsService.generateCashFlowReport(businessId, period);
  }

  @Get('profitability')
  async getProfitabilityAnalysis(@Query('businessId') businessId: string, @Query('period') period?: string) {
    if (!businessId) {
      throw new Error('businessId is required');
    }
    return this.analyticsService.generateProfitabilityAnalysis(businessId, period);
  }

  @Get('trends')
  async getTrendAnalysis(
    @Query('businessId') businessId: string,
    @Query('metric') metric: string,
    @Query('periods') periods?: number
  ) {
    if (!businessId) {
      throw new Error('businessId is required');
    }
    return this.analyticsService.generateTrendAnalysis(businessId, metric, periods);
  }

  @Get('business-metrics')
  async getBusinessMetrics(@Query('businessId') businessId: string) {
    if (!businessId) {
      throw new Error('businessId is required');
    }
    return this.analyticsService.generateBusinessMetrics(businessId);
  }
} 