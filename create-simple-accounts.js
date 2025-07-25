const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');
const crypto = require('crypto');

/**
 * Create Simple Chart of Accounts
 * This script creates basic accounts for journal entries using the current Account model
 */

async function main() {
  console.log(chalk.blue('==== Creating Simple Chart of Accounts ===='));
  
  try {
    // Check if we already have accounts
    const existingAccounts = await prisma.account.count();
    if (existingAccounts > 0) {
      console.log(chalk.yellow(`Found ${existingAccounts} existing accounts.`));
    }
    
    // Get the demo user ID
    const demoUser = await prisma.user.findFirst({
      where: { email: 'demo@fint.com' }
    });
    
    if (!demoUser) {
      console.log(chalk.red('Demo user not found. Please ensure demo user exists.'));
      return;
    }
    
    console.log(chalk.green(`Using demo user: ${demoUser.email}`));
    
    // Basic Chart of Accounts
    const chartOfAccounts = [
      // Asset accounts
      { 
        code: '1000', 
        name: 'Cash', 
        type: 'asset',
        description: 'Cash on hand or in bank'
      },
      { 
        code: '1100', 
        name: 'Bank Account', 
        type: 'asset',
        description: 'Bank checking/savings account'
      },
      { 
        code: '1200', 
        name: 'Accounts Receivable', 
        type: 'asset',
        description: 'Amounts owed by customers'
      },
      { 
        code: '1300', 
        name: 'Inventory', 
        type: 'asset',
        description: 'Goods held for sale'
      },
      { 
        code: '1500', 
        name: 'Office Equipment', 
        type: 'asset',
        description: 'Computers, furniture, etc.'
      },
      { 
        code: '1600', 
        name: 'Vehicles', 
        type: 'asset',
        description: 'Company vehicles'
      },
      { 
        code: '1700', 
        name: 'Buildings', 
        type: 'asset',
        description: 'Office buildings, warehouses'
      },
      
      // Liability accounts
      { 
        code: '2000', 
        name: 'Accounts Payable', 
        type: 'liability',
        description: 'Amounts owed to vendors'
      },
      { 
        code: '2100', 
        name: 'Credit Cards', 
        type: 'liability',
        description: 'Credit card balances'
      },
      { 
        code: '2200', 
        name: 'Short-term Loans', 
        type: 'liability',
        description: 'Loans due within one year'
      },
      { 
        code: '2500', 
        name: 'Long-term Loans', 
        type: 'liability',
        description: 'Loans due after one year'
      },
      { 
        code: '2600', 
        name: 'Mortgage Payable', 
        type: 'liability',
        description: 'Building mortgage'
      },
      
      // Equity accounts
      { 
        code: '3000', 
        name: 'Owner Capital', 
        type: 'equity',
        description: 'Owner\'s investment in the business'
      },
      { 
        code: '3100', 
        name: 'Owner Drawings', 
        type: 'equity',
        description: 'Owner\'s withdrawals from business'
      },
      { 
        code: '3900', 
        name: 'Retained Earnings', 
        type: 'equity',
        description: 'Accumulated earnings'
      },
      
      // Revenue accounts
      { 
        code: '4000', 
        name: 'Sales Revenue', 
        type: 'revenue',
        description: 'Income from sales of goods/services'
      },
      { 
        code: '4100', 
        name: 'Service Revenue', 
        type: 'revenue',
        description: 'Income from services rendered'
      },
      { 
        code: '4200', 
        name: 'Interest Income', 
        type: 'revenue',
        description: 'Interest earned on investments'
      },
      { 
        code: '4300', 
        name: 'Other Income', 
        type: 'revenue',
        description: 'Miscellaneous income'
      },
      
      // Expense accounts
      { 
        code: '5000', 
        name: 'Cost of Goods Sold', 
        type: 'expense',
        description: 'Direct costs of producing goods'
      },
      { 
        code: '5100', 
        name: 'Rent Expense', 
        type: 'expense',
        description: 'Office rent'
      },
      { 
        code: '5200', 
        name: 'Utilities Expense', 
        type: 'expense',
        description: 'Electricity, water, internet'
      },
      { 
        code: '5300', 
        name: 'Supplies Expense', 
        type: 'expense',
        description: 'Office supplies'
      },
      { 
        code: '5400', 
        name: 'Salaries Expense', 
        type: 'expense',
        description: 'Employee salaries'
      },
      { 
        code: '5500', 
        name: 'Insurance Expense', 
        type: 'expense',
        description: 'Business insurance'
      },
      { 
        code: '5600', 
        name: 'Depreciation Expense', 
        type: 'expense',
        description: 'Depreciation of fixed assets'
      },
      { 
        code: '5700', 
        name: 'Interest Expense', 
        type: 'expense',
        description: 'Interest on loans'
      },
      { 
        code: '5800', 
        name: 'Advertising Expense', 
        type: 'expense',
        description: 'Marketing and advertising costs'
      },
      { 
        code: '5900', 
        name: 'Other Expenses', 
        type: 'expense',
        description: 'Miscellaneous expenses'
      }
    ];
    
    console.log(chalk.cyan('Creating Chart of Accounts...'));
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const accountData of chartOfAccounts) {
      try {
        // Check if account already exists by code
        const existingAccount = await prisma.account.findFirst({
          where: { code: accountData.code }
        });
        
        if (existingAccount) {
          console.log(chalk.gray(`Account ${accountData.code} - ${accountData.name} already exists, skipping.`));
          skippedCount++;
          continue;
        }
        
        // Create account
        await prisma.account.create({
          data: {
            id: crypto.randomUUID(),
            code: accountData.code,
            name: accountData.name,
            type: accountData.type,
            userId: demoUser.id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        
        console.log(chalk.green(`✓ Created account: ${accountData.code} - ${accountData.name}`));
        createdCount++;
      } catch (error) {
        console.log(chalk.red(`✗ Failed to create account ${accountData.code}: ${error.message}`));
      }
    }
    
    // Display summary
    const finalAccounts = await prisma.account.findMany({
      where: { userId: demoUser.id },
      orderBy: { code: 'asc' }
    });
    
    console.log(chalk.blue('\n==== Chart of Accounts Summary ===='));
    console.log(`Total accounts: ${finalAccounts.length}`);
    console.log(`Created: ${createdCount}, Skipped: ${skippedCount}`);
    
    // Group by type
    const accountsByType = finalAccounts.reduce((acc, account) => {
      const type = account.type || 'Unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {});
    
    // Display by type
    Object.entries(accountsByType).forEach(([type, accounts]) => {
      console.log(chalk.cyan(`\n${type.toUpperCase()} ACCOUNTS:`));
      accounts.forEach(account => {
        console.log(`  ${account.code} - ${account.name}`);
      });
    });
    
    console.log(chalk.green('\n✓ Chart of Accounts created successfully!'));
    console.log(chalk.yellow('You can now create journal entries using these accounts.'));
    
  } catch (error) {
    console.error(chalk.red('Error creating Chart of Accounts:'), error);
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
