const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Create Test Accounts
 * This script creates test accounts using the actual database schema
 */

async function main() {
  console.log('==== Creating Test Accounts ====');
  
  try {
    // First, check if we have any users
    const users = await prisma.user.findMany({ take: 1 });
    
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      
      // Create a test user
      const testUser = await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123', // In a real app, this would be hashed
          role: 'ADMIN',
          emailVerified: true
        }
      });
      
      console.log(`Created test user with ID: ${testUser.id}`);
      
      // Create test accounts
      console.log('Creating test accounts...');
      
      const accountsToCreate = [
        { name: 'Cash', type: 'asset', code: '1000' },
        { name: 'Accounts Receivable', type: 'asset', code: '1200' },
        { name: 'Office Equipment', type: 'asset', code: '1500' },
        { name: 'Accounts Payable', type: 'liability', code: '2000' },
        { name: 'Bank Loan', type: 'liability', code: '2500' },
        { name: 'Owner Capital', type: 'equity', code: '3000' },
        { name: 'Retained Earnings', type: 'equity', code: '3900' },
        { name: 'Services Revenue', type: 'revenue', code: '4000' },
        { name: 'Product Sales', type: 'revenue', code: '4500' },
        { name: 'Rent Expense', type: 'expense', code: '5000' },
        { name: 'Utilities Expense', type: 'expense', code: '5100' },
        { name: 'Supplies Expense', type: 'expense', code: '5200' },
        { name: 'Salaries Expense', type: 'expense', code: '5300' }
      ];
      
      for (const account of accountsToCreate) {
        try {
          const createdAccount = await prisma.account.create({
            data: {
              name: account.name,
              type: account.type,
              code: account.code,
              userId: testUser.id
            }
          });
          
          console.log(`Created account: ${createdAccount.code} - ${createdAccount.name}`);
        } catch (error) {
          console.error(`Error creating account ${account.code}:`, error.message);
        }
      }
    } else {
      const userId = users[0].id;
      console.log(`Using existing user with ID: ${userId}`);
      
      // Create test accounts with existing user
      console.log('Creating test accounts...');
      
      const accountsToCreate = [
        { name: 'Cash', type: 'asset', code: '1000' },
        { name: 'Accounts Receivable', type: 'asset', code: '1200' },
        { name: 'Office Equipment', type: 'asset', code: '1500' },
        { name: 'Accounts Payable', type: 'liability', code: '2000' },
        { name: 'Bank Loan', type: 'liability', code: '2500' },
        { name: 'Owner Capital', type: 'equity', code: '3000' },
        { name: 'Retained Earnings', type: 'equity', code: '3900' },
        { name: 'Services Revenue', type: 'revenue', code: '4000' },
        { name: 'Product Sales', type: 'revenue', code: '4500' },
        { name: 'Rent Expense', type: 'expense', code: '5000' },
        { name: 'Utilities Expense', type: 'expense', code: '5100' },
        { name: 'Supplies Expense', type: 'expense', code: '5200' },
        { name: 'Salaries Expense', type: 'expense', code: '5300' }
      ];
      
      for (const account of accountsToCreate) {
        try {
          // Check if account already exists
          const existingAccount = await prisma.account.findUnique({
            where: { code: account.code }
          });
          
          if (existingAccount) {
            console.log(`Account ${account.code} already exists, skipping.`);
            continue;
          }
          
          const createdAccount = await prisma.account.create({
            data: {
              name: account.name,
              type: account.type,
              code: account.code,
              userId: userId
            }
          });
          
          console.log(`Created account: ${createdAccount.code} - ${createdAccount.name}`);
        } catch (error) {
          console.error(`Error creating account ${account.code}:`, error.message);
        }
      }
    }
    
    // Display summary
    const accounts = await prisma.account.findMany();
    console.log('\n==== Account Summary ====');
    console.log(`Total accounts: ${accounts.length}`);
    
    // Group by type
    const accountsByType = {};
    accounts.forEach(account => {
      if (!accountsByType[account.type]) accountsByType[account.type] = [];
      accountsByType[account.type].push(account);
    });
    
    // Display by type
    Object.entries(accountsByType).forEach(([type, accts]) => {
      console.log(`\n${type.toUpperCase()} ACCOUNTS:`);
      accts.forEach(account => {
        console.log(`  ${account.code} - ${account.name}`);
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 