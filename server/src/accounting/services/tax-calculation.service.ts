import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface TaxCalculationDto {
  taxableAmount: number;
  taxAmount: number;
  taxRate: number;
  totalAmount: number;
  taxRateId?: string;
  taxType?: string;
}

export interface TaxReportDto {
  fromDate: Date;
  toDate: Date;
  taxType?: string;
  transactions: Array<any & {
    Transaction: any;
    TaxRate: any;
  }>;
  summary: {
    totalTaxableAmount: number;
    totalTaxAmount: number;
  };
}

export interface CreateTaxRateDto {
  name: string;
  rate: number;
  type: string;
  effectiveFrom: Date;
  effectiveTo?: Date;
  businessId?: string;
}

@Injectable()
export class TaxCalculationService {

  async calculateTax(
    amount: number,
    taxType: string,
    businessId?: string
  ): Promise<TaxCalculationDto> {
    const taxRate = await this.getApplicableTaxRate(taxType, businessId);
    
    if (!taxRate) {
      return {
        taxableAmount: amount,
        taxAmount: 0,
        taxRate: 0,
        totalAmount: amount
      };
    }

    const taxAmount = (amount * taxRate.rate) / 100;
    
    return {
      taxableAmount: amount,
      taxAmount,
      taxRate: taxRate.rate,
      totalAmount: amount + taxAmount,
      taxRateId: taxRate.id,
      taxType: taxRate.type
    };
  }

  async createTaxTransaction(
    transactionId: string,
    taxCalculation: TaxCalculationDto
  ): Promise<any> {
    return prisma.taxTransaction.create({
      data: {
        transactionId,
        taxRateId: taxCalculation.taxRateId!,
        taxableAmount: taxCalculation.taxableAmount,
        taxAmount: taxCalculation.taxAmount,
        taxType: taxCalculation.taxType!
      }
    });
  }

  async createTaxRate(data: CreateTaxRateDto): Promise<TaxRate> {
    return this.prisma.taxRate.create({
      data: {
        ...data,
        effectiveFrom: new Date(data.effectiveFrom),
        effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null
      }
    });
  }

  async updateTaxRate(id: string, data: Partial<CreateTaxRateDto>): Promise<TaxRate> {
    const updateData: any = { ...data };
    if (data.effectiveFrom) {
      updateData.effectiveFrom = new Date(data.effectiveFrom);
    }
    if (data.effectiveTo) {
      updateData.effectiveTo = new Date(data.effectiveTo);
    }

    return this.prisma.taxRate.update({
      where: { id },
      data: updateData
    });
  }

  async getTaxRates(businessId?: string): Promise<TaxRate[]> {
    return this.prisma.taxRate.findMany({
      where: {
        OR: [
          { businessId },
          { businessId: null } // Global tax rates
        ]
      },
      orderBy: [
        { businessId: 'desc' }, // Prefer business-specific rates
        { effectiveFrom: 'desc' }
      ]
    });
  }

  async getTaxRate(id: string): Promise<TaxRate | null> {
    return this.prisma.taxRate.findUnique({
      where: { id }
    });
  }

  async deleteTaxRate(id: string): Promise<void> {
    await this.prisma.taxRate.delete({
      where: { id }
    });
  }

  async generateTaxReport(
    businessId: string,
    fromDate: Date,
    toDate: Date,
    taxType?: string
  ): Promise<TaxReportDto> {
    const taxTransactions = await this.prisma.taxTransaction.findMany({
      where: {
        Transaction: {
          businessId,
          date: {
            gte: fromDate,
            lte: toDate
          }
        },
        ...(taxType && { taxType })
      },
      include: {
        Transaction: true,
        TaxRate: true
      }
    });

    const summary = taxTransactions.reduce((acc, tx) => {
      acc.totalTaxableAmount += tx.taxableAmount;
      acc.totalTaxAmount += tx.taxAmount;
      return acc;
    }, { totalTaxableAmount: 0, totalTaxAmount: 0 });

    return {
      fromDate,
      toDate,
      taxType,
      transactions: taxTransactions,
      summary
    };
  }

  async getTaxTransactionsByPeriod(
    businessId: string,
    fromDate: Date,
    toDate: Date,
    taxType?: string
  ): Promise<TaxTransaction[]> {
    return this.prisma.taxTransaction.findMany({
      where: {
        Transaction: {
          businessId,
          date: {
            gte: fromDate,
            lte: toDate
          }
        },
        ...(taxType && { taxType })
      },
      include: {
        Transaction: true,
        TaxRate: true
      },
      orderBy: {
        Transaction: {
          date: 'desc'
        }
      }
    });
  }

  async calculateTaxSummary(
    businessId: string,
    fromDate: Date,
    toDate: Date
  ): Promise<{
    byType: Record<string, { taxableAmount: number; taxAmount: number }>;
    total: { taxableAmount: number; taxAmount: number };
  }> {
    const taxTransactions = await this.getTaxTransactionsByPeriod(businessId, fromDate, toDate);
    
    const byType: Record<string, { taxableAmount: number; taxAmount: number }> = {};
    let totalTaxableAmount = 0;
    let totalTaxAmount = 0;

    taxTransactions.forEach(tx => {
      if (!byType[tx.taxType]) {
        byType[tx.taxType] = { taxableAmount: 0, taxAmount: 0 };
      }
      
      byType[tx.taxType].taxableAmount += tx.taxableAmount;
      byType[tx.taxType].taxAmount += tx.taxAmount;
      
      totalTaxableAmount += tx.taxableAmount;
      totalTaxAmount += tx.taxAmount;
    });

    return {
      byType,
      total: { taxableAmount: totalTaxableAmount, taxAmount: totalTaxAmount }
    };
  }

  private async getApplicableTaxRate(
    taxType: string,
    businessId?: string
  ): Promise<TaxRate | null> {
    return this.prisma.taxRate.findFirst({
      where: {
        type: taxType,
        isActive: true,
        effectiveFrom: { lte: new Date() },
        OR: [
          { effectiveTo: null },
          { effectiveTo: { gte: new Date() } }
        ],
        OR: [
          { businessId },
          { businessId: null } // Global tax rates
        ]
      },
      orderBy: [
        { businessId: 'desc' }, // Prefer business-specific rates
        { effectiveFrom: 'desc' }
      ]
    });
  }
} 