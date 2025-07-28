import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate comprehensive KPIs for a business
   * @param businessId - Business identifier
   * @param period - Time period (week, month, quarter, year, current)
   * @returns Promise<AnalyticsKPIs> - Comprehensive KPI data
   */
  async calculateKPIs(businessId: string, period: string = 'current'): Promise<any> {
    try {
      if (!businessId) {
        throw new BadRequestException('Business ID is required');
      }

      const startDate = this.getPeriodStartDate(period);
      const endDate = new Date();

      // Validate date range
      if (startDate >= endDate) {
        throw new BadRequestException('Invalid date range');
      }

      // Calculate all metrics in parallel for better performance
      const [
        revenue,
        expenses,
        cashFlow,
        inventoryValue,
        totalAssets,
        totalLiabilities,
        totalEquity,
        currentAssets,
        currentLiabilities,
      ] = await Promise.all([
        this.calculateRevenue(businessId, startDate, endDate),
        this.calculateExpenses(businessId, startDate, endDate),
        this.calculateCashFlow(businessId, startDate, endDate),
        this.calculateInventoryValue(businessId),
        this.calculateTotalAssets(businessId),
        this.calculateTotalLiabilities(businessId),
        this.calculateTotalEquity(businessId),
        this.calculateCurrentAssets(businessId),
        this.calculateCurrentLiabilities(businessId),
      ]);

      const profit = revenue - expenses;
      const profitMargin = this.calculatePercentage(profit, revenue);
      const currentRatio = this.calculateRatio(currentAssets, currentLiabilities);
      const quickRatio = this.calculateQuickRatio(
        currentAssets,
        inventoryValue,
        currentLiabilities
      );
      const debtToEquityRatio = this.calculateRatio(totalLiabilities, totalEquity);

      return {
        revenue: this.roundToTwoDecimals(revenue),
        expenses: this.roundToTwoDecimals(expenses),
        profit: this.roundToTwoDecimals(profit),
        profitMargin: this.roundToTwoDecimals(profitMargin),
        cashFlow: this.roundToTwoDecimals(cashFlow),
        inventoryValue: this.roundToTwoDecimals(inventoryValue),
        currentRatio: this.roundToTwoDecimals(currentRatio),
        quickRatio: this.roundToTwoDecimals(quickRatio),
        debtToEquityRatio: this.roundToTwoDecimals(debtToEquityRatio),
        totalAssets: this.roundToTwoDecimals(totalAssets),
        totalLiabilities: this.roundToTwoDecimals(totalLiabilities),
        totalEquity: this.roundToTwoDecimals(totalEquity),
        workingCapital: this.roundToTwoDecimals(currentAssets - currentLiabilities),
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: period,
        },
      };
    } catch (error) {
      this.logger.error(`Error calculating KPIs for business ${businessId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate comprehensive cash flow report
   * @param businessId - Business identifier
   * @param period - Time period
   * @returns Promise<CashFlowReport> - Detailed cash flow analysis
   */
  async generateCashFlowReport(businessId: string, period: string = 'current'): Promise<any> {
    try {
      if (!businessId) {
        throw new BadRequestException('Business ID is required');
      }

      const startDate = this.getPeriodStartDate(period);
      const endDate = new Date();

      const [operatingActivities, investingActivities, financingActivities] = await Promise.all([
        this.calculateOperatingCashFlow(businessId, startDate, endDate),
        this.calculateInvestingCashFlow(businessId, startDate, endDate),
        this.calculateFinancingCashFlow(businessId, startDate, endDate),
      ]);

      const netCashFlow = operatingActivities + investingActivities + financingActivities;

      return {
        operatingActivities: this.roundToTwoDecimals(operatingActivities),
        investingActivities: this.roundToTwoDecimals(investingActivities),
        financingActivities: this.roundToTwoDecimals(financingActivities),
        netCashFlow: this.roundToTwoDecimals(netCashFlow),
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: period,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generating cash flow report for business ${businessId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate profitability analysis with detailed breakdown
   * @param businessId - Business identifier
   * @param period - Time period
   * @returns Promise<ProfitabilityAnalysis> - Detailed profitability metrics
   */
  async generateProfitabilityAnalysis(
    businessId: string,
    period: string = 'current'
  ): Promise<any> {
    try {
      if (!businessId) {
        throw new BadRequestException('Business ID is required');
      }

      const startDate = this.getPeriodStartDate(period);
      const endDate = new Date();

      const [revenue, costOfGoodsSold, operatingExpenses, otherIncome, otherExpenses] =
        await Promise.all([
          this.calculateRevenue(businessId, startDate, endDate),
          this.calculateCostOfGoodsSold(businessId, startDate, endDate),
          this.calculateOperatingExpenses(businessId, startDate, endDate),
          this.calculateOtherIncome(businessId, startDate, endDate),
          this.calculateOtherExpenses(businessId, startDate, endDate),
        ]);

      const grossProfit = revenue - costOfGoodsSold;
      const operatingIncome = grossProfit - operatingExpenses;
      const netIncome = operatingIncome + otherIncome - otherExpenses;

      return {
        revenue: this.roundToTwoDecimals(revenue),
        costOfGoodsSold: this.roundToTwoDecimals(costOfGoodsSold),
        grossProfit: this.roundToTwoDecimals(grossProfit),
        grossProfitMargin: this.roundToTwoDecimals(this.calculatePercentage(grossProfit, revenue)),
        operatingExpenses: this.roundToTwoDecimals(operatingExpenses),
        operatingIncome: this.roundToTwoDecimals(operatingIncome),
        operatingMargin: this.roundToTwoDecimals(
          this.calculatePercentage(operatingIncome, revenue)
        ),
        otherIncome: this.roundToTwoDecimals(otherIncome),
        otherExpenses: this.roundToTwoDecimals(otherExpenses),
        netIncome: this.roundToTwoDecimals(netIncome),
        netProfitMargin: this.roundToTwoDecimals(this.calculatePercentage(netIncome, revenue)),
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: period,
        },
      };
    } catch (error) {
      this.logger.error(
        `Error generating profitability analysis for business ${businessId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate trend analysis for specified metrics
   * @param businessId - Business identifier
   * @param metric - Metric to analyze (revenue, expenses, profit, cashFlow)
   * @param periods - Number of periods to analyze
   * @returns Promise<TrendAnalysis[]> - Trend data points
   */
  async generateTrendAnalysis(
    businessId: string,
    metric: string,
    periods: number = 12
  ): Promise<any> {
    try {
      if (!businessId) {
        throw new BadRequestException('Business ID is required');
      }

      if (periods < 1 || periods > 60) {
        throw new BadRequestException('Periods must be between 1 and 60');
      }

      const validMetrics = [
        'revenue',
        'expenses',
        'profit',
        'cashFlow',
        'assets',
        'liabilities',
        'equity',
      ];
      if (!validMetrics.includes(metric)) {
        throw new BadRequestException(`Invalid metric. Must be one of: ${validMetrics.join(', ')}`);
      }

      const trends = [];
      const now = new Date();

      for (let i = periods - 1; i >= 0; i--) {
        const endDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);

        let value = 0;
        switch (metric) {
          case 'revenue':
            value = await this.calculateRevenue(businessId, startDate, endDate);
            break;
          case 'expenses':
            value = await this.calculateExpenses(businessId, startDate, endDate);
            break;
          case 'profit':
            value = await this.calculateProfit(businessId, startDate, endDate);
            break;
          case 'cashFlow':
            value = await this.calculateCashFlow(businessId, startDate, endDate);
            break;
          case 'assets':
            value = await this.calculateTotalAssets(businessId);
            break;
          case 'liabilities':
            value = await this.calculateTotalLiabilities(businessId);
            break;
          case 'equity':
            value = await this.calculateTotalEquity(businessId);
            break;
        }

        trends.push({
          period: endDate.toISOString().slice(0, 7),
          value: this.roundToTwoDecimals(value),
          date: endDate.toISOString(),
        });
      }

      return trends;
    } catch (error) {
      this.logger.error(
        `Error generating trend analysis for business ${businessId}: ${error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate comprehensive business metrics
   * @param businessId - Business identifier
   * @returns Promise<BusinessMetrics> - Complete business metrics
   */
  async generateBusinessMetrics(businessId: string): Promise<any> {
    try {
      if (!businessId) {
        throw new BadRequestException('Business ID is required');
      }

      const [
        totalAssets,
        totalLiabilities,
        totalEquity,
        currentAssets,
        currentLiabilities,
        netIncome,
      ] = await Promise.all([
        this.calculateTotalAssets(businessId),
        this.calculateTotalLiabilities(businessId),
        this.calculateTotalEquity(businessId),
        this.calculateCurrentAssets(businessId),
        this.calculateCurrentLiabilities(businessId),
        this.calculateNetIncome(businessId),
      ]);

      const workingCapital = currentAssets - currentLiabilities;
      const currentRatio = this.calculateRatio(currentAssets, currentLiabilities);
      const debtToEquityRatio = this.calculateRatio(totalLiabilities, totalEquity);
      const returnOnAssets = this.calculatePercentage(netIncome, totalAssets);
      const returnOnEquity = this.calculatePercentage(netIncome, totalEquity);

      return {
        totalAssets: this.roundToTwoDecimals(totalAssets),
        totalLiabilities: this.roundToTwoDecimals(totalLiabilities),
        totalEquity: this.roundToTwoDecimals(totalEquity),
        currentAssets: this.roundToTwoDecimals(currentAssets),
        currentLiabilities: this.roundToTwoDecimals(currentLiabilities),
        workingCapital: this.roundToTwoDecimals(workingCapital),
        currentRatio: this.roundToTwoDecimals(currentRatio),
        debtToEquityRatio: this.roundToTwoDecimals(debtToEquityRatio),
        returnOnAssets: this.roundToTwoDecimals(returnOnAssets),
        returnOnEquity: this.roundToTwoDecimals(returnOnEquity),
        netIncome: this.roundToTwoDecimals(netIncome),
      };
    } catch (error) {
      this.logger.error(
        `Error generating business metrics for business ${businessId}: ${error.message}`
      );
      throw error;
    }
  }

  // Private helper methods

  private getPeriodStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        return new Date(now.getFullYear(), quarter * 3, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      case 'current':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      default:
        throw new BadRequestException(
          `Invalid period: ${period}. Must be one of: week, month, quarter, year, current`
        );
    }
  }

  private calculatePercentage(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return (numerator / denominator) * 100;
  }

  private calculateRatio(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return numerator / denominator;
  }

  private calculateQuickRatio(
    currentAssets: number,
    inventory: number,
    currentLiabilities: number
  ): number {
    if (currentLiabilities === 0) return 0;
    return (currentAssets - inventory) / currentLiabilities;
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  // Database calculation methods with improved error handling and performance

  private async calculateRevenue(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            type: 'revenue',
          },
        },
        _sum: {
          credit: true,
        },
      });
      return result._sum.credit || 0;
    } catch (error) {
      this.logger.error(`Error calculating revenue: ${error.message}`);
      return 0;
    }
  }

  private async calculateExpenses(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            type: 'expense',
          },
        },
        _sum: {
          debit: true,
        },
      });
      return result._sum.debit || 0;
    } catch (error) {
      this.logger.error(`Error calculating expenses: ${error.message}`);
      return 0;
    }
  }

  private async calculateProfit(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const [revenue, expenses] = await Promise.all([
      this.calculateRevenue(businessId, startDate, endDate),
      this.calculateExpenses(businessId, startDate, endDate),
    ]);
    return revenue - expenses;
  }

  private async calculateCashFlow(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            type: 'asset',
            OR: [
              { name: { contains: 'cash', mode: 'insensitive' } },
              { name: { contains: 'bank', mode: 'insensitive' } },
              { name: { contains: 'checking', mode: 'insensitive' } },
              { name: { contains: 'savings', mode: 'insensitive' } },
            ],
          },
        },
        _sum: {
          credit: true,
          debit: true,
        },
      });
      return (result._sum.credit || 0) - (result._sum.debit || 0);
    } catch (error) {
      this.logger.error(`Error calculating cash flow: ${error.message}`);
      return 0;
    }
  }

  private async calculateInventoryValue(businessId: string): Promise<number> {
    try {
      const result = await this.prisma.inventoryLevel.aggregate({
        where: {
          InventoryItem: {
            businessId,
          },
        },
        _sum: {
          totalValue: true,
        },
      });
      return result._sum.totalValue || 0;
    } catch (error) {
      this.logger.error(`Error calculating inventory value: ${error.message}`);
      return 0;
    }
  }

  private async calculateTotalAssets(businessId: string): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            status: 'POSTED',
          },
          Account: {
            type: 'asset',
          },
        },
        _sum: {
          debit: true,
          credit: true,
        },
      });
      return (result._sum.debit || 0) - (result._sum.credit || 0);
    } catch (error) {
      this.logger.error(`Error calculating total assets: ${error.message}`);
      return 0;
    }
  }

  private async calculateTotalLiabilities(businessId: string): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            status: 'POSTED',
          },
          Account: {
            type: 'liability',
          },
        },
        _sum: {
          credit: true,
          debit: true,
        },
      });
      return (result._sum.credit || 0) - (result._sum.debit || 0);
    } catch (error) {
      this.logger.error(`Error calculating total liabilities: ${error.message}`);
      return 0;
    }
  }

  private async calculateTotalEquity(businessId: string): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            status: 'POSTED',
          },
          Account: {
            type: 'equity',
          },
        },
        _sum: {
          credit: true,
          debit: true,
        },
      });
      return (result._sum.credit || 0) - (result._sum.debit || 0);
    } catch (error) {
      this.logger.error(`Error calculating total equity: ${error.message}`);
      return 0;
    }
  }

  private async calculateCurrentAssets(businessId: string): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            status: 'POSTED',
          },
          Account: {
            type: 'asset',
            OR: [
              { name: { contains: 'cash', mode: 'insensitive' } },
              { name: { contains: 'bank', mode: 'insensitive' } },
              { name: { contains: 'receivable', mode: 'insensitive' } },
              { name: { contains: 'inventory', mode: 'insensitive' } },
            ],
          },
        },
        _sum: {
          debit: true,
          credit: true,
        },
      });
      return (result._sum.debit || 0) - (result._sum.credit || 0);
    } catch (error) {
      this.logger.error(`Error calculating current assets: ${error.message}`);
      return 0;
    }
  }

  private async calculateCurrentLiabilities(businessId: string): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            status: 'POSTED',
          },
          Account: {
            type: 'liability',
            OR: [
              { name: { contains: 'payable', mode: 'insensitive' } },
              { name: { contains: 'accrued', mode: 'insensitive' } },
              { name: { contains: 'short', mode: 'insensitive' } },
            ],
          },
        },
        _sum: {
          credit: true,
          debit: true,
        },
      });
      return (result._sum.credit || 0) - (result._sum.debit || 0);
    } catch (error) {
      this.logger.error(`Error calculating current liabilities: ${error.message}`);
      return 0;
    }
  }

  private async calculateNetIncome(businessId: string): Promise<number> {
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date();
    return await this.calculateProfit(businessId, startDate, endDate);
  }

  private async calculateOperatingCashFlow(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // Simplified calculation - focuses on cash from operations
    return await this.calculateCashFlow(businessId, startDate, endDate);
  }

  private async calculateInvestingCashFlow(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            type: 'asset',
            OR: [
              { name: { contains: 'equipment', mode: 'insensitive' } },
              { name: { contains: 'vehicle', mode: 'insensitive' } },
              { name: { contains: 'building', mode: 'insensitive' } },
              { name: { contains: 'land', mode: 'insensitive' } },
            ],
          },
        },
        _sum: {
          debit: true,
          credit: true,
        },
      });
      return (result._sum.debit || 0) - (result._sum.credit || 0);
    } catch (error) {
      this.logger.error(`Error calculating investing cash flow: ${error.message}`);
      return 0;
    }
  }

  private async calculateFinancingCashFlow(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            OR: [
              { type: 'equity' },
              {
                type: 'liability',
                OR: [
                  { name: { contains: 'loan', mode: 'insensitive' } },
                  { name: { contains: 'mortgage', mode: 'insensitive' } },
                ],
              },
            ],
          },
        },
        _sum: {
          credit: true,
          debit: true,
        },
      });
      return (result._sum.credit || 0) - (result._sum.debit || 0);
    } catch (error) {
      this.logger.error(`Error calculating financing cash flow: ${error.message}`);
      return 0;
    }
  }

  private async calculateCostOfGoodsSold(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            OR: [
              { name: { contains: 'cost of goods', mode: 'insensitive' } },
              { name: { contains: 'cogs', mode: 'insensitive' } },
              { name: { contains: 'cost of sales', mode: 'insensitive' } },
            ],
          },
        },
        _sum: {
          debit: true,
        },
      });
      return result._sum.debit || 0;
    } catch (error) {
      this.logger.error(`Error calculating cost of goods sold: ${error.message}`);
      return 0;
    }
  }

  private async calculateOperatingExpenses(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            type: 'expense',
            NOT: {
              OR: [
                { name: { contains: 'cost of goods', mode: 'insensitive' } },
                { name: { contains: 'cogs', mode: 'insensitive' } },
                { name: { contains: 'cost of sales', mode: 'insensitive' } },
              ],
            },
          },
        },
        _sum: {
          debit: true,
        },
      });
      return result._sum.debit || 0;
    } catch (error) {
      this.logger.error(`Error calculating operating expenses: ${error.message}`);
      return 0;
    }
  }

  private async calculateOtherIncome(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            type: 'revenue',
            NOT: {
              name: { contains: 'sales', mode: 'insensitive' },
            },
          },
        },
        _sum: {
          credit: true,
        },
      });
      return result._sum.credit || 0;
    } catch (error) {
      this.logger.error(`Error calculating other income: ${error.message}`);
      return 0;
    }
  }

  private async calculateOtherExpenses(
    businessId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const result = await this.prisma.journalEntryLine.aggregate({
        where: {
          JournalEntry: {
            businessId,
            date: { gte: startDate, lte: endDate },
            status: 'POSTED',
          },
          Account: {
            type: 'expense',
            OR: [
              { name: { contains: 'interest', mode: 'insensitive' } },
              { name: { contains: 'tax', mode: 'insensitive' } },
              { name: { contains: 'penalty', mode: 'insensitive' } },
            ],
          },
        },
        _sum: {
          debit: true,
        },
      });
      return result._sum.debit || 0;
    } catch (error) {
      this.logger.error(`Error calculating other expenses: ${error.message}`);
      return 0;
    }
  }
}
