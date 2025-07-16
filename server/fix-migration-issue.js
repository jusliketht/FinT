const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMigrationIssue() {
  try {
    console.log('Checking for orphaned JournalEntry records...');
    
    // Use raw SQL to find JournalEntry records with invalid debitAccountId
    const invalidDebitEntries = await prisma.$queryRaw`
      SELECT id FROM "JournalEntry" 
      WHERE "debitAccountId" NOT IN (SELECT id FROM "AccountHead")
    `;

    // Use raw SQL to find JournalEntry records with invalid creditAccountId
    const invalidCreditEntries = await prisma.$queryRaw`
      SELECT id FROM "JournalEntry" 
      WHERE "creditAccountId" NOT IN (SELECT id FROM "AccountHead")
    `;

    console.log(`Found ${invalidDebitEntries.length} entries with invalid debit accounts`);
    console.log(`Found ${invalidCreditEntries.length} entries with invalid credit accounts`);

    if (invalidDebitEntries.length > 0 || invalidCreditEntries.length > 0) {
      console.log('Deleting orphaned JournalEntry records...');
      
      // Get all invalid entry IDs
      const invalidEntryIds = [
        ...invalidDebitEntries.map(entry => entry.id),
        ...invalidCreditEntries.map(entry => entry.id)
      ];

      // Delete orphaned entries using raw SQL
      if (invalidEntryIds.length > 0) {
        await prisma.$executeRaw`
          DELETE FROM "JournalEntry" 
          WHERE id = ANY(${invalidEntryIds})
        `;
      }

      console.log(`Deleted ${invalidEntryIds.length} orphaned JournalEntry records`);
    }

    // Check if we have any AccountHead records
    const accountHeadCount = await prisma.accountHead.count();
    console.log(`Found ${accountHeadCount} AccountHead records`);

    // Check if we have any AccountCategory records
    const accountCategoryCount = await prisma.accountCategory.count();
    console.log(`Found ${accountCategoryCount} AccountCategory records`);

    // If no AccountCategory records exist, create default ones
    if (accountCategoryCount === 0) {
      console.log('Creating default AccountCategory records...');
      
      const defaultCategories = [
        { name: 'Assets', description: 'Resources owned by the business' },
        { name: 'Liabilities', description: 'Obligations owed by the business' },
        { name: 'Equity', description: 'Owner\'s investment in the business' },
        { name: 'Revenue', description: 'Income earned by the business' },
        { name: 'Expenses', description: 'Costs incurred by the business' }
      ];

      for (const category of defaultCategories) {
        await prisma.accountCategory.create({
          data: category
        });
      }

      console.log('Created default AccountCategory records');
    }

    // If no AccountHead records exist, create default ones
    if (accountHeadCount === 0) {
      console.log('Creating default AccountHead records...');
      
      const categories = await prisma.accountCategory.findMany();
      console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name })));
      
      const assetsCategory = categories.find(c => c.name === 'Assets');
      const liabilitiesCategory = categories.find(c => c.name === 'Liabilities');
      const equityCategory = categories.find(c => c.name === 'Equity');
      const revenueCategory = categories.find(c => c.name === 'Revenue');
      const expensesCategory = categories.find(c => c.name === 'Expenses');

      const defaultAccounts = [
        { code: '1000', name: 'Cash', type: 'asset', categoryId: assetsCategory?.id },
        { code: '1100', name: 'Bank Account', type: 'asset', categoryId: assetsCategory?.id },
        { code: '2000', name: 'Accounts Payable', type: 'liability', categoryId: liabilitiesCategory?.id },
        { code: '3000', name: 'Owner\'s Equity', type: 'equity', categoryId: equityCategory?.id },
        { code: '4000', name: 'Revenue', type: 'revenue', categoryId: revenueCategory?.id },
        { code: '5000', name: 'Expenses', type: 'expense', categoryId: expensesCategory?.id }
      ];

      for (const account of defaultAccounts) {
        console.log('Creating account:', account);
        if (account.categoryId) {
          try {
            await prisma.accountHead.create({
              data: {
                code: account.code,
                name: account.name,
                type: account.type,
                categoryId: account.categoryId
              }
            });
            console.log(`Created account: ${account.name}`);
          } catch (error) {
            console.error(`Failed to create account ${account.name}:`, error);
          }
        } else {
          console.log(`Skipping account ${account.name} - no category found`);
        }
      }

      console.log('Created default AccountHead records');
    }

    console.log('Migration issue fixed successfully!');
  } catch (error) {
    console.error('Error fixing migration issue:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigrationIssue(); 