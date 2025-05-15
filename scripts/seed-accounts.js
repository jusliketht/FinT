// Load environment variables
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Debug available models
console.log('Available Prisma models:', Object.keys(prisma));

/**
 * Seed Accounts
 * This script creates basic accounts for testing
 */

// Main account types
const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'provision', label: 'Provision' },
  { value: 'revenue', label: 'Revenue' }
];

// Account categories based on Accounts.md
const ACCOUNT_CATEGORIES = [
  { name: 'Current Assets', typeValue: 'asset' },
  { name: 'Fixed Assets', typeValue: 'asset' },
  { name: 'Current Liabilities', typeValue: 'liability' },
  { name: 'Long-Term Liabilities', typeValue: 'liability' },
  { name: "Owner's Equity", typeValue: 'equity' },
  { name: 'Operating Income', typeValue: 'income' },
  { name: 'GST on Income', typeValue: 'income' },
  { name: 'Operating Expenses', typeValue: 'expense' },
  { name: 'Tax & Compliance', typeValue: 'expense' },
  { name: 'Financial Expenses', typeValue: 'expense' },
  { name: 'Depreciation', typeValue: 'expense' },
  { name: 'General Provisions', typeValue: 'provision' }
];

// Basic sample accounts
const SAMPLE_ACCOUNTS = [
  // Asset accounts
  { 
    code: '1000', 
    name: 'Cash', 
    typeValue: 'asset',
    categoryName: 'Current Assets',
    description: 'Cash on hand or in bank',
    balance: 10000
  },
  { 
    code: '1200', 
    name: 'Accounts Receivable', 
    typeValue: 'asset',
    categoryName: 'Current Assets',
    description: 'Amounts owed by customers',
    balance: 5000
  },
  { 
    code: '1500', 
    name: 'Office Equipment', 
    typeValue: 'asset',
    categoryName: 'Fixed Assets',
    description: 'Computers, furniture, etc.',
    balance: 15000
  },
  
  // Liability accounts
  { 
    code: '2000', 
    name: 'Accounts Payable', 
    typeValue: 'liability',
    categoryName: 'Current Liabilities',
    description: 'Amounts owed to vendors',
    balance: 3000
  },
  { 
    code: '2500', 
    name: 'Bank Loan', 
    typeValue: 'liability',
    categoryName: 'Long-Term Liabilities',
    description: 'Business loan from bank',
    balance: 20000
  },
  
  // Equity accounts
  { 
    code: '3000', 
    name: 'Owner Capital', 
    typeValue: 'equity',
    categoryName: "Owner's Equity",
    description: 'Owner\'s investment in the business',
    balance: 25000
  },
  { 
    code: '3900', 
    name: 'Retained Earnings', 
    typeValue: 'equity',
    categoryName: "Owner's Equity",
    description: 'Accumulated earnings',
    balance: 0
  },
  
  // Revenue accounts
  { 
    code: '4000', 
    name: 'Services Revenue', 
    typeValue: 'revenue',
    categoryName: 'Operating Income',
    description: 'Income from services rendered',
    balance: 0
  },
  { 
    code: '4500', 
    name: 'Product Sales', 
    typeValue: 'revenue',
    categoryName: 'Operating Income',
    description: 'Income from product sales',
    balance: 0
  },
  
  // Expense accounts
  { 
    code: '5000', 
    name: 'Rent Expense', 
    typeValue: 'expense',
    categoryName: 'Operating Expenses',
    description: 'Office rent',
    balance: 0
  },
  { 
    code: '5100', 
    name: 'Utilities Expense', 
    typeValue: 'expense',
    categoryName: 'Operating Expenses',
    description: 'Electricity, water, internet',
    balance: 0
  },
  { 
    code: '5200', 
    name: 'Supplies Expense', 
    typeValue: 'expense',
    categoryName: 'Operating Expenses',
    description: 'Office supplies',
    balance: 0
  },
  { 
    code: '5300', 
    name: 'Salaries Expense', 
    typeValue: 'expense',
    categoryName: 'Operating Expenses',
    description: 'Employee salaries',
    balance: 0
  }
];

// Main seeder function
async function seedAccounts() {
  console.log('Starting account seeding...');

  // Create account types if they don't exist
  console.log('Creating account types...');
  for (const type of ACCOUNT_TYPES) {
    try {
      await prisma.accountType.upsert({
        where: { value: type.value },
        update: { label: type.label },
        create: { value: type.value, label: type.label }
      });
      console.log(`Created/updated account type: ${type.value}`);
    } catch (error) {
      console.error(`Error creating account type ${type.value}:`, error);
    }
  }

  // Create account categories
  console.log('Creating account categories...');
  for (const category of ACCOUNT_CATEGORIES) {
    // Get the type ID
    const type = await prisma.accountType.findUnique({
      where: { value: category.typeValue }
    });

    if (!type) {
      console.log(`Type not found: ${category.typeValue}`);
      continue;
    }

    try {
      await prisma.accountCategory.upsert({
        where: {
          name_typeId: {
            name: category.name,
            typeId: type.id
          }
        },
        update: {},
        create: {
          name: category.name,
          typeId: type.id
        }
      });
      console.log(`Created/updated account category: ${category.name}`);
    } catch (error) {
      console.error(`Error creating category ${category.name}:`, error);
    }
  }

  console.log('Account type and category seeding completed successfully!');
  
  // Check if we can create accounts without userId
  try {
    // Check database schema
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Account'
    `;
    
    // Check if userId column exists and is required
    const userIdColumn = tableInfo.find(col => col.column_name === 'userId');
    const userIdRequired = userIdColumn && userIdColumn.is_nullable === 'NO';
    
    if (userIdRequired) {
      console.log('Cannot create accounts: userId is required but no user exists');
    } else {
      console.log('Creating sample accounts...');
      
      // Create accounts
      for (const accountData of SAMPLE_ACCOUNTS) {
        try {
          // Check if account already exists
          const existingAccount = await prisma.account.findFirst({
            where: { code: accountData.code }
          });
          
          if (existingAccount) {
            console.log(`Account ${accountData.code} already exists, skipping`);
            continue;
          }
          
          // Find account type
          const accountType = await prisma.accountType.findFirst({
            where: { 
              value: { 
                contains: accountData.typeValue, 
                mode: 'insensitive' 
              } 
            }
          });
          
          if (!accountType) {
            console.log(`Account type ${accountData.typeValue} not found. Skipping ${accountData.code}`);
            continue;
          }
          
          // Find category
          let category = await prisma.accountCategory.findFirst({
            where: { 
              name: { 
                contains: accountData.categoryName,
                mode: 'insensitive'
              },
              typeId: accountType.id 
            }
          });
          
          if (!category) {
            // Try more flexibly
            category = await prisma.accountCategory.findFirst({
              where: { 
                typeId: accountType.id 
              }
            });
            
            if (!category) {
              console.log(`Cannot find any category for ${accountData.typeValue}. Skipping ${accountData.code}`);
              continue;
            }
            
            console.log(`Using ${category.name} for ${accountData.name} instead of ${accountData.categoryName}`);
          }
          
          // Create account
          const account = await prisma.account.create({
            data: {
              code: accountData.code,
              name: accountData.name,
              typeId: accountType.id,
              categoryId: category.id,
              description: accountData.description,
              balance: accountData.balance
            }
          });
          
          console.log(`Created account: ${account.code} - ${account.name}`);
        } catch (error) {
          console.log(`Failed to create account ${accountData.code}: ${error.message}`);
        }
      }
    }
  } catch (error) {
    console.error('Error creating accounts:', error);
  }
}

// Run the seeder
seedAccounts()
  .catch((error) => {
    console.error('Error seeding accounts:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 