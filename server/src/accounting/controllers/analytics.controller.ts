import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('Analytics')
@Controller('businesses/:businessId/analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get key performance indicators' })
  @ApiResponse({ status: 200, description: 'KPIs retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  async getKPIs(
    @Param('businessId') businessId: string, 
    @Request() req,
    @Query('period') period?: string
  ) {
    return this.analyticsService.calculateKPIs(businessId, period);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get financial trends' })
  @ApiResponse({ status: 200, description: 'Trends retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  async getTrends(
    @Param('businessId') businessId: string, 
    @Request() req,
    @Query('period') period?: string
  ) {
    return this.analyticsService.generateTrends(businessId, period);
  }

  @Get('top-accounts')
  @ApiOperation({ summary: 'Get top accounts by activity' })
  @ApiResponse({ status: 200, description: 'Top accounts retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of accounts to return' })
  async getTopAccounts(
    @Param('businessId') businessId: string, 
    @Request() req,
    @Query('period') period?: string,
    @Query('limit') limit?: number
  ) {
    return this.analyticsService.getTopAccounts(businessId, period, limit);
  }

  @Get('recent-transactions')
  @ApiOperation({ summary: 'Get recent transactions' })
  @ApiResponse({ status: 200, description: 'Recent transactions retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of transactions to return' })
  async getRecentTransactions(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('limit') limit?: number
  ) {
    return this.analyticsService.getRecentTransactions(businessId, limit);
  }

  @Get('cash-flow')
  @ApiOperation({ summary: 'Get cash flow report' })
  @ApiResponse({ status: 200, description: 'Cash flow report retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  async getCashFlowReport(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('period') period?: string
  ) {
    return this.analyticsService.generateCashFlowReport(businessId, period);
  }

  @Get('profitability')
  @ApiOperation({ summary: 'Get profitability analysis' })
  @ApiResponse({ status: 200, description: 'Profitability analysis retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  async getProfitabilityAnalysis(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('period') period?: string
  ) {
    return this.analyticsService.generateProfitabilityAnalysis(businessId, period);
  }

  @Get('trend-analysis')
  @ApiOperation({ summary: 'Get trend analysis' })
  @ApiResponse({ status: 200, description: 'Trend analysis retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'metric', required: true, description: 'Metric to analyze' })
  @ApiQuery({ name: 'periods', required: false, description: 'Number of periods to analyze' })
  async getTrendAnalysis(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('metric') metric: string,
    @Query('periods') periods?: number
  ) {
    return this.analyticsService.generateTrendAnalysis(businessId, metric, periods);
  }

  @Get('business-metrics')
  @ApiOperation({ summary: 'Get business metrics' })
  @ApiResponse({ status: 200, description: 'Business metrics retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  async getBusinessMetrics(
    @Param('businessId') businessId: string,
    @Request() req
  ) {
    return this.analyticsService.generateBusinessMetrics(businessId);
  }

  @Get('revenue-analysis')
  @ApiOperation({ summary: 'Get revenue analysis' })
  @ApiResponse({ status: 200, description: 'Revenue analysis retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  async getRevenueAnalysis(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.analyticsService.generateRevenueAnalysis(businessId, startDate, endDate);
  }

  @Get('expense-analysis')
  @ApiOperation({ summary: 'Get expense analysis' })
  @ApiResponse({ status: 200, description: 'Expense analysis retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  async getExpenseAnalysis(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.analyticsService.generateExpenseAnalysis(businessId, startDate, endDate);
  }

  @Get('cash-flow-analysis')
  @ApiOperation({ summary: 'Get cash flow analysis' })
  @ApiResponse({ status: 200, description: 'Cash flow analysis retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  async getCashFlowAnalysis(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.analyticsService.generateCashFlowAnalysis(businessId, startDate, endDate);
  }

  @Get('profitability-analysis')
  @ApiOperation({ summary: 'Get detailed profitability analysis' })
  @ApiResponse({ status: 200, description: 'Detailed profitability analysis retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date (YYYY-MM-DD)' })
  async getProfitabilityAnalysisDetailed(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    return this.analyticsService.generateProfitabilityAnalysisDetailed(businessId, startDate, endDate);
  }

  @Get('financial-ratios')
  @ApiOperation({ summary: 'Get financial ratios' })
  @ApiResponse({ status: 200, description: 'Financial ratios retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'As of date (YYYY-MM-DD)' })
  async getFinancialRatios(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('asOfDate') asOfDate?: string
  ) {
    return this.analyticsService.generateFinancialRatios(businessId, asOfDate);
  }

  @Get('account-aging')
  @ApiOperation({ summary: 'Get account aging report' })
  @ApiResponse({ status: 200, description: 'Account aging report retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'asOfDate', required: false, description: 'As of date (YYYY-MM-DD)' })
  async getAccountAging(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('asOfDate') asOfDate?: string
  ) {
    return this.analyticsService.generateAccountAging(businessId, asOfDate);
  }

  @Get('budget-vs-actual')
  @ApiOperation({ summary: 'Get budget vs actual analysis' })
  @ApiResponse({ status: 200, description: 'Budget vs actual analysis retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period' })
  async getBudgetVsActual(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('period') period?: string
  ) {
    return this.analyticsService.generateBudgetVsActual(businessId, period);
  }

  @Get('comparative-analysis')
  @ApiOperation({ summary: 'Get comparative analysis' })
  @ApiResponse({ status: 200, description: 'Comparative analysis retrieved successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiQuery({ name: 'currentPeriod', required: true, description: 'Current period' })
  @ApiQuery({ name: 'comparisonPeriod', required: true, description: 'Comparison period' })
  async getComparativeAnalysis(
    @Param('businessId') businessId: string,
    @Request() req,
    @Query('currentPeriod') currentPeriod: string,
    @Query('comparisonPeriod') comparisonPeriod: string
  ) {
    return this.analyticsService.generateComparativeAnalysis(businessId, currentPeriod, comparisonPeriod);
  }

  @Get('export/:reportType')
  @ApiOperation({ summary: 'Export analytics report' })
  @ApiResponse({ status: 200, description: 'Report exported successfully' })
  @ApiParam({ name: 'businessId', description: 'Business ID' })
  @ApiParam({ name: 'reportType', description: 'Type of report to export' })
  @ApiQuery({ name: 'format', required: false, description: 'Export format (pdf, excel, csv)' })
  async exportReport(
    @Param('businessId') businessId: string,
    @Param('reportType') reportType: string,
    @Request() req,
    @Query('format') format?: string,
    @Query() filters?: any
  ) {
    return this.analyticsService.exportReport(businessId, format, filters);
  }
}
