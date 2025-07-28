import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async calculateKPIs(businessId: string, period: string = 'current'): Promise<any> {
    const startDate = this.getPeriodStartDate(period);
    const endDate = new Date();

    // Calculate revenue from accounts with type 'revenue'
    const revenue = await this.calculateRevenue(businessId, startDate, endDate);
    
    // Calculate expenses from accounts with type 'expense'
    const expenses = await this.calculateExpenses(businessId, startDate, endDate);
    
    const profit = revenue - expenses;
    const cashFlow = await this.calculateCashFlow(businessId, startDate, endDate);
    const inventoryValue = await this.calculateInventoryValue(businessId);

    return {
      revenue,
      expenses,
      profit,
      profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
      cashFlow,
      inventoryValue,
      currentRatio: await this.calculateCurrentRatio(businessId),
      quickRatio: await this.calculateQuickRatio(businessId),
      debtToEquityRatio: await this.calculateDebtToEquityRatio(businessId)
    };
  }

  async generateCashFlowReport(businessId: string, period: string = 'current'): Promise<any> {
    const startDate = this.getPeriodStartDate(period);
    const endDate = new Date();

    const operatingActivities = await this.calculateOperatingCashFlow(businessId, startDate, endDate);
    const investingActivities = await this.calculateInvestingCashFlow(businessId, startDate, endDate);
    const financingActivities = await this.calculateFinancingCashFlow(businessId, startDate, endDate);

    const netCashFlow = operatingActivities + investingActivities + financingActivities;

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFlow,
      period: { startDate, endDate }
    };
  }

  async generateProfitabilityAnalysis(businessId: string, period: string = 'current'): Promise<any> {
    const startDate = this.getPeriodStartDate(period);
    const endDate = new Date();

    const revenue = await this.calculateRevenue(businessId, startDate, endDate);
    const costOfGoodsSold = await this.calculateCostOfGoodsSold(businessId, startDate, endDate);
    const operatingExpenses = await this.calculateOperatingExpenses(businessId, startDate, endDate);
    const netIncome = revenue - costOfGoodsSold - operatingExpenses;

    return {
      revenue,
      costOfGoodsSold,
      grossProfit: revenue - costOfGoodsSold,
      grossProfitMargin: revenue > 0 ? ((revenue - costOfGoodsSold) / revenue) * 100 : 0,
      operatingExpenses,
      operatingIncome: revenue - costOfGoodsSold - operatingExpenses,
      operatingMargin: revenue > 0 ? ((revenue - costOfGoodsSold - operatingExpenses) / revenue) * 100 : 0,
      netIncome,
      netProfitMargin: revenue > 0 ? (netIncome / revenue) * 100 : 0
    };
  }

  async generateTrendAnalysis(businessId: string, metric: string, periods: number = 12): Promise<any> {
    const trends = [];
    for (let i = periods - 1; i >= 0; i--) {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - i - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() - i);

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
      }

      trends.push({
        period: endDate.toISOString().slice(0, 7),
        value
      });
    }

    return trends;
  }

  async generateBusinessMetrics(businessId: string): Promise<any> {
    const [totalAssets, totalLiabilities, totalEquity, currentAssets, currentLiabilities] = await Promise.all([
      this.calculateTotalAssets(businessId),
      this.calculateTotalLiabilities(businessId),
      this.calculateTotalEquity(businessId),
      this.calculateCurrentAssets(businessId),
      this.calculateCurrentLiabilities(businessId)
    ]);

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      currentAssets,
      currentLiabilities,
      workingCapital: currentAssets - currentLiabilities,
      currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
      debtToEquityRatio: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
      returnOnAssets: totalAssets > 0 ? (await this.calculateNetIncome(businessId)) / totalAssets : 0,
      returnOnEquity: totalEquity > 0 ? (await this.calculateNetIncome(businessId)) / totalEquity : 0
    };
  }

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
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  }

  // Database-based calculation methods
  private async calculateRevenue(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.journalEntryLine.aggregate({
      where: {
        JournalEntry: {
          businessId,
          date: { gte: startDate, lte: endDate },
          status: 'POSTED'
        },
        Account: {
          type: 'revenue'
        }
      },
      _sum: {
        credit: true
      }
    });
    return result._sum.credit || 0;
  }

  private async calculateExpenses(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.journalEntryLine.aggregate({
      where: {
        JournalEntry: {
          businessId,
          date: { gte: startDate, lte: endDate },
          status: 'POSTED'
        },
        Account: {
          type: 'expense'
        }
      },
      _sum: {
        debit: true
      }
    });
    return result._sum.debit || 0;
  }

  private async calculateProfit(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    const revenue = await this.calculateRevenue(businessId, startDate, endDate);
    const expenses = await this.calculateExpenses(businessId, startDate, endDate);
    return revenue - expenses;
  }

  private async calculateCashFlow(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    const result = await this.prisma.journalEntryLine.aggregate({
      where: {
        JournalEntry: {
          businessId,
          date: { gte: startDate, lte: endDate },
          status: 'POSTED'
        },
        Account: {
          type: 'asset',
          OR: [
            { name: { contains: 'cash', mode: 'insensitive' } },
            { name: { contains: 'bank', mode: 'insensitive' } }
          ]
        }
      },
      _sum: {
        credit: true,
        debit: true
      }
    });
    return (result._sum.credit || 0) - (result._sum.debit || 0);
  }

  private async calculateInventoryValue(businessId: string): Promise<number> {
    const result = await this.prisma.inventoryLevel.aggregate({
      where: {
        InventoryItem: {
          businessId
        }
      },
      _sum: {
        totalValue: true
      }
    });
    return result._sum.totalValue || 0;
  }

  private async calculateCurrentRatio(businessId: string): Promise<number> {
    const currentAssets = await this.calculateCurrentAssets(businessId);
    const currentLiabilities = await this.calculateCurrentLiabilities(businessId);
    return currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
  }

  private async calculateQuickRatio(businessId: string): Promise<number> {
    const currentAssets = await this.calculateCurrentAssets(businessId);
    const inventory = await this.calculateInventoryValue(businessId);
    const currentLiabilities = await this.calculateCurrentLiabilities(businessId);
    return currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0;
  }

  private async calculateDebtToEquityRatio(businessId: string): Promise<number> {
    const totalLiabilities = await this.calculateTotalLiabilities(businessId);
    const totalEquity = await this.calculateTotalEquity(businessId);
    return totalEquity > 0 ? totalLiabilities / totalEquity : 0;
  }

  private async calculateTotalAssets(businessId: string): Promise<number> {
    const result = await this.prisma.journalEntryLine.aggregate({
      where: {
        JournalEntry: {
          businessId,
          status: 'POSTED'
        },
        Account: {
          type: 'asset'
        }
      },
      _sum: {
        debit: true,
        credit: true
      }
    });
    return (result._sum.debit || 0) - (result._sum.credit || 0);
  }

  private async calculateTotalLiabilities(businessId: string): Promise<number> {
    const result = await this.prisma.journalEntryLine.aggregate({
      where: {
        JournalEntry: {
          businessId,
          status: 'POSTED'
        },
        Account: {
          type: 'liability'
        }
      },
      _sum: {
        credit: true,
        debit: true
      }
    });
    return (result._sum.credit || 0) - (result._sum.debit || 0);
  }

  private async calculateTotalEquity(businessId: string): Promise<number> {
    const result = await this.prisma.journalEntryLine.aggregate({
      where: {
        JournalEntry: {
          businessId,
          status: 'POSTED'
        },
        Account: {
          type: 'equity'
        }
      },
      _sum: {
        credit: true,
        debit: true
      }
    });
    return (result._sum.credit || 0) - (result._sum.debit || 0);
  }

  private async calculateCurrentAssets(businessId: string): Promise<number> {
    // For simplicity, we'll consider all assets as current assets
    return await this.calculateTotalAssets(businessId);
  }

  private async calculateCurrentLiabilities(businessId: string): Promise<number> {
    // For simplicity, we'll consider all liabilities as current liabilities
    return await this.calculateTotalLiabilities(businessId);
  }

  private async calculateNetIncome(businessId: string): Promise<number> {
    const revenue = await this.calculateRevenue(businessId, new Date(new Date().getFullYear(), 0, 1), new Date());
    const expenses = await this.calculateExpenses(businessId, new Date(new Date().getFullYear(), 0, 1), new Date());
    return revenue - expenses;
  }

  private async calculateOperatingCashFlow(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    // Simplified calculation - in a real scenario, this would be more complex
    return await this.calculateCashFlow(businessId, startDate, endDate);
  }

  private async calculateInvestingCashFlow(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    // Placeholder - would calculate from fixed asset transactions
    return 0;
  }

  private async calculateFinancingCashFlow(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    // Placeholder - would calculate from equity and debt transactions
    return 0;
  }

  private async calculateCostOfGoodsSold(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    // Placeholder - would calculate from inventory and cost of goods sold accounts
    return await this.calculateExpenses(businessId, startDate, endDate) * 0.6; // Assume 60% of expenses are COGS
  }

  private async calculateOperatingExpenses(businessId: string, startDate: Date, endDate: Date): Promise<number> {
    // Placeholder - would calculate from operating expense accounts
    return await this.calculateExpenses(businessId, startDate, endDate) * 0.4; // Assume 40% of expenses are operating
  }
} 