import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Standard chart of accounts structure
const STANDARD_ACCOUNT_CATEGORIES = [
  { code: '1000', name: 'Assets', type: 'ASSET' },
  { code: '1100', name: 'Current Assets', type: 'ASSET', parentCode: '1000' },
  { code: '1110', name: 'Cash and Cash Equivalents', type: 'ASSET', parentCode: '1100' },
  { code: '1120', name: 'Accounts Receivable', type: 'ASSET', parentCode: '1100' },
  { code: '1130', name: 'Inventory', type: 'ASSET', parentCode: '1100' },
  { code: '1140', name: 'Prepaid Expenses', type: 'ASSET', parentCode: '1100' },
  { code: '1200', name: 'Non-Current Assets', type: 'ASSET', parentCode: '1000' },
  { code: '1210', name: 'Property, Plant & Equipment', type: 'ASSET', parentCode: '1200' },
  { code: '1220', name: 'Accumulated Depreciation', type: 'ASSET', parentCode: '1200' },
  { code: '1230', name: 'Intangible Assets', type: 'ASSET', parentCode: '1200' },
  
  { code: '2000', name: 'Liabilities', type: 'LIABILITY' },
  { code: '2100', name: 'Current Liabilities', type: 'LIABILITY', parentCode: '2000' },
  { code: '2110', name: 'Accounts Payable', type: 'LIABILITY', parentCode: '2100' },
  { code: '2120', name: 'Accrued Expenses', type: 'LIABILITY', parentCode: '2100' },
  { code: '2130', name: 'GST Payable', type: 'LIABILITY', parentCode: '2100' },
  { code: '2140', name: 'TDS Payable', type: 'LIABILITY', parentCode: '2100' },
  { code: '2150', name: 'Short-term Loans', type: 'LIABILITY', parentCode: '2100' },
  { code: '2200', name: 'Non-Current Liabilities', type: 'LIABILITY', parentCode: '2000' },
  { code: '2210', name: 'Long-term Debt', type: 'LIABILITY', parentCode: '2200' },
  
  { code: '3000', name: 'Equity', type: 'EQUITY' },
  { code: '3100', name: 'Owner\'s Equity', type: 'EQUITY', parentCode: '3000' },
  { code: '3200', name: 'Retained Earnings', type: 'EQUITY', parentCode: '3000' },
  { code: '3300', name: 'Current Year Earnings', type: 'EQUITY', parentCode: '3000' },
  
  { code: '4000', name: 'Revenue', type: 'REVENUE' },
  { code: '4100', name: 'Sales Revenue', type: 'REVENUE', parentCode: '4000' },
  { code: '4200', name: 'Service Revenue', type: 'REVENUE', parentCode: '4000' },
  { code: '4300', name: 'Other Income', type: 'REVENUE', parentCode: '4000' },
  
  { code: '5000', name: 'Expenses', type: 'EXPENSE' },
  { code: '5100', name: 'Cost of Goods Sold', type: 'EXPENSE', parentCode: '5000' },
  { code: '5200', name: 'Operating Expenses', type: 'EXPENSE', parentCode: '5000' },
  { code: '5210', name: 'Rent Expense', type: 'EXPENSE', parentCode: '5200' },
  { code: '5220', name: 'Utilities Expense', type: 'EXPENSE', parentCode: '5200' },
  { code: '5230', name: 'Salaries and Wages', type: 'EXPENSE', parentCode: '5200' },
  { code: '5240', name: 'Office Supplies', type: 'EXPENSE', parentCode: '5200' },
  { code: '5250', name: 'Marketing and Advertising', type: 'EXPENSE', parentCode: '5200' },
  { code: '5260', name: 'Travel and Entertainment', type: 'EXPENSE', parentCode: '5200' },
  { code: '5300', name: 'Administrative Expenses', type: 'EXPENSE', parentCode: '5000' },
  { code: '5400', name: 'Financial Expenses', type: 'EXPENSE', parentCode: '5000' },
  { code: '5410', name: 'Interest Expense', type: 'EXPENSE', parentCode: '5400' },
  { code: '5420', name: 'Bank Charges', type: 'EXPENSE', parentCode: '5400' },
];

@Injectable()
export class AccountSetupService {
  constructor() {}

  async initializeStandardChartOfAccounts(businessId: string): Promise<void> {
    // First, ensure we have the basic account categories
    await this.ensureAccountCategories();
    
    // Create standard chart of accounts for new business
    for (const account of STANDARD_ACCOUNT_CATEGORIES) {
      await this.createAccountIfNotExists(account, businessId);
    }
  }

  private async ensureAccountCategories(): Promise<void> {
    const categories = [
      { name: 'Assets', description: 'Resources owned by the business' },
      { name: 'Liabilities', description: 'Obligations owed by the business' },
      { name: 'Equity', description: 'Owner\'s investment and retained earnings' },
      { name: 'Revenue', description: 'Income earned by the business' },
      { name: 'Expenses', description: 'Costs incurred by the business' },
    ];

    for (const category of categories) {
      await prisma.accountCategory.upsert({
        where: { name: category.name },
        update: {},
        create: {
          id: uuidv4(),
          name: category.name,
          description: category.description,
        },
      });
    }
  }

  private async createAccountIfNotExists(accountData: any, businessId: string): Promise<void> {
    const category = await prisma.accountCategory.findFirst({
      where: { name: this.getCategoryName(accountData.type) }
    });

    if (!category) {
      throw new Error(`Category not found for type: ${accountData.type}`);
    }

    await prisma.accountHead.upsert({
      where: { code: accountData.code },
      update: {},
      create: {
        id: uuidv4(),
        code: accountData.code,
        name: accountData.name,
        type: accountData.type,
        businessId,
        categoryId: category.id,
        isCustom: false,
        parentId: accountData.parentCode ? 
          (await this.findAccountByCode(accountData.parentCode))?.id : null
      }
    });
  }

  private async findAccountByCode(code: string): Promise<any | null> {
    return prisma.accountHead.findUnique({ where: { code } });
  }

  private getCategoryName(type: string): string {
    switch (type) {
      case 'ASSET': return 'Assets';
      case 'LIABILITY': return 'Liabilities';
      case 'EQUITY': return 'Equity';
      case 'REVENUE': return 'Revenue';
      case 'EXPENSE': return 'Expenses';
      default: throw new Error(`Unknown account type: ${type}`);
    }
  }
} 