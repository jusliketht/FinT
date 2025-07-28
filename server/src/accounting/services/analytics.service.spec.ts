import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    journalEntryLine: {
      aggregate: jest.fn(),
    },
    inventoryLevel: {
      aggregate: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateKPIs', () => {
    it('should throw BadRequestException for missing businessId', async () => {
      await expect(service.calculateKPIs('', 'current')).rejects.toThrow(BadRequestException);
      await expect(service.calculateKPIs(null as any, 'current')).rejects.toThrow(
        BadRequestException
      );
    });

    it('should handle database errors gracefully', async () => {
      const businessId = 'test-business-id';

      // Mock all database calls to throw errors
      mockPrismaService.journalEntryLine.aggregate.mockRejectedValue(new Error('Database error'));
      mockPrismaService.inventoryLevel.aggregate.mockRejectedValue(new Error('Database error'));

      const result = await service.calculateKPIs(businessId, 'current');

      expect(result).toBeDefined();
      expect(result.revenue).toBe(0);
      expect(result.expenses).toBe(0);
      expect(result.profit).toBe(0);
      expect(result.inventoryValue).toBe(0);
    });

    it('should handle division by zero in ratios', async () => {
      const businessId = 'test-business-id';

      // Mock all values to zero to test division by zero handling
      mockPrismaService.journalEntryLine.aggregate.mockResolvedValue({
        _sum: { credit: 0, debit: 0 },
      });
      mockPrismaService.inventoryLevel.aggregate.mockResolvedValue({ _sum: { totalValue: 0 } });

      const result = await service.calculateKPIs(businessId, 'current');

      expect(result.profitMargin).toBe(0);
      expect(result.currentRatio).toBe(0);
      expect(result.quickRatio).toBe(0);
      expect(result.debtToEquityRatio).toBe(0);
    });
  });

  describe('generateCashFlowReport', () => {
    it('should throw BadRequestException for missing businessId', async () => {
      await expect(service.generateCashFlowReport('', 'current')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('generateProfitabilityAnalysis', () => {
    it('should throw BadRequestException for missing businessId', async () => {
      await expect(service.generateProfitabilityAnalysis('', 'current')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('generateTrendAnalysis', () => {
    it('should throw BadRequestException for invalid periods', async () => {
      const businessId = 'test-business-id';

      await expect(service.generateTrendAnalysis(businessId, 'revenue', 0)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.generateTrendAnalysis(businessId, 'revenue', 61)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for invalid metric', async () => {
      const businessId = 'test-business-id';

      await expect(service.generateTrendAnalysis(businessId, 'invalid', 12)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException for missing businessId', async () => {
      await expect(service.generateTrendAnalysis('', 'revenue', 12)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('generateBusinessMetrics', () => {
    it('should throw BadRequestException for missing businessId', async () => {
      await expect(service.generateBusinessMetrics('')).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPeriodStartDate', () => {
    it('should return correct start date for different periods', () => {
      const now = new Date('2024-01-15');
      jest.useFakeTimers();
      jest.setSystemTime(now);

      // Test week period
      const weekStart = service['getPeriodStartDate']('week');
      expect(weekStart.getDate()).toBe(8); // 15 - 7 = 8

      // Test month period
      const monthStart = service['getPeriodStartDate']('month');
      expect(monthStart.getMonth()).toBe(0); // January
      expect(monthStart.getDate()).toBe(1);

      // Test quarter period
      const quarterStart = service['getPeriodStartDate']('quarter');
      expect(quarterStart.getMonth()).toBe(0); // Q1 starts in January
      expect(quarterStart.getDate()).toBe(1);

      // Test year period
      const yearStart = service['getPeriodStartDate']('year');
      expect(yearStart.getFullYear()).toBe(2024);
      expect(yearStart.getMonth()).toBe(0);
      expect(yearStart.getDate()).toBe(1);

      // Test current period
      const currentStart = service['getPeriodStartDate']('current');
      expect(currentStart.getMonth()).toBe(0);
      expect(currentStart.getDate()).toBe(1);

      jest.useRealTimers();
    });

    it('should throw BadRequestException for invalid period', () => {
      expect(() => service['getPeriodStartDate']('invalid')).toThrow(BadRequestException);
    });
  });

  describe('Helper methods', () => {
    it('should calculate percentage correctly', () => {
      expect(service['calculatePercentage'](50, 100)).toBe(50);
      expect(service['calculatePercentage'](0, 100)).toBe(0);
      expect(service['calculatePercentage'](100, 0)).toBe(0);
    });

    it('should calculate ratio correctly', () => {
      expect(service['calculateRatio'](10, 5)).toBe(2);
      expect(service['calculateRatio'](0, 5)).toBe(0);
      expect(service['calculateRatio'](10, 0)).toBe(0);
    });

    it('should calculate quick ratio correctly', () => {
      expect(service['calculateQuickRatio'](100, 20, 40)).toBe(2); // (100-20)/40
      expect(service['calculateQuickRatio'](50, 10, 0)).toBe(0); // division by zero
    });

    it('should round to two decimals correctly', () => {
      expect(service['roundToTwoDecimals'](3.14159)).toBe(3.14);
      expect(service['roundToTwoDecimals'](3.145)).toBe(3.15);
      expect(service['roundToTwoDecimals'](3)).toBe(3);
    });
  });
});
