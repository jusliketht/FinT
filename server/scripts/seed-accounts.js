// Load environment variables
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Debug available models
console.log('Available Prisma models:', Object.keys(prisma));

// Main account types
const ACCOUNT_TYPES = [
  { value: 'asset', label: 'Asset' },
  { value: 'liability', label: 'Liability' },
  { value: 'equity', label: 'Equity' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
  { value: 'provision', label: 'Provision' }
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
  console.log('Skipped account creation as user association is required.');
}

// Run the seeder
seedAccounts()
  .catch((error) => {
    console.error('Error seeding accounts:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 