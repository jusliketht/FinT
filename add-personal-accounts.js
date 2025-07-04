const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');
const crypto = require('crypto');

/**
 * Add Personal Bank Accounts and Credit Cards
 * This script adds personal financial accounts for a user
 */

async function main() {
  console.log(chalk.blue('==== Adding Personal Financial Accounts ===='));
  
  try {
    // Get or create a user
    let userId;
    try {
      const users = await prisma.user.findMany({ take: 1 });
      if (users.length > 0) {
        userId = users[0].id;
        console.log(chalk.green(`Using existing user with ID: ${userId}`));
      } else {
        console.log(chalk.red('No users found. Please create a user first.'));
        return;
      }
    } catch (error) {
      console.error(chalk.red('Error finding users:'), error);
      return;
    }

    // Personal Financial Accounts
    const personalAccounts = [
      // Personal Bank Accounts (Asset)
      { code: '11230', name: 'SBI Savings Account', type: 'asset', description: 'Personal SBI savings account' },
      { code: '11240', name: 'Axis Bank Current Account', type: 'asset', description: 'Personal Axis Bank current account' },
      { code: '11250', name: 'Kotak 811 Account', type: 'asset', description: 'Personal Kotak 811 digital account' },
      { code: '11260', name: 'Paytm Payments Bank', type: 'asset', description: 'Paytm Payments Bank account' },
      
      // Personal Credit Cards (Liability)
      { code: '21410', name: 'HDFC Credit Card', type: 'liability', description: 'HDFC Bank credit card' },
      { code: '21420', name: 'ICICI Credit Card', type: 'liability', description: 'ICICI Bank credit card' },
      { code: '21430', name: 'SBI Credit Card', type: 'liability', description: 'SBI credit card' },
      { code: '21440', name: 'Axis Bank Credit Card', type: 'liability', description: 'Axis Bank credit card' },
      { code: '21450', name: 'Amazon Pay ICICI Card', type: 'liability', description: 'Amazon Pay ICICI credit card' },
      
      // Personal Investment Accounts (Asset)
      { code: '11500', name: 'Mutual Fund Investments', type: 'asset', description: 'Personal mutual fund investments' },
      { code: '11510', name: 'Stock Portfolio', type: 'asset', description: 'Personal stock market investments' },
      { code: '11520', name: 'Fixed Deposits', type: 'asset', description: 'Personal fixed deposits' },
      { code: '11530', name: 'PPF Account', type: 'asset', description: 'Public Provident Fund account' },
      { code: '11540', name: 'EPF Account', type: 'asset', description: 'Employee Provident Fund account' },
      
      // Personal Loans (Liability)
      { code: '22200', name: 'Personal Loan', type: 'liability', description: 'Personal loan from bank' },
      { code: '22210', name: 'Home Loan', type: 'liability', description: 'Home loan from bank' },
      { code: '22220', name: 'Car Loan', type: 'liability', description: 'Car loan from bank' },
      { code: '22230', name: 'Education Loan', type: 'liability', description: 'Education loan from bank' },
      
      // Personal Income (Revenue)
      { code: '41400', name: 'Salary Income', type: 'revenue', description: 'Personal salary income' },
      { code: '41410', name: 'Freelance Income', type: 'revenue', description: 'Freelance/consulting income' },
      { code: '41420', name: 'Rental Income', type: 'revenue', description: 'Rental income from property' },
      { code: '41430', name: 'Dividend Income', type: 'revenue', description: 'Dividend income from investments' },
      
      // Personal Expenses (Expense)
      { code: '55100', name: 'Personal Rent', type: 'expense', description: 'Personal rent payments' },
      { code: '55110', name: 'Personal Utilities', type: 'expense', description: 'Personal utility bills' },
      { code: '55120', name: 'Personal Groceries', type: 'expense', description: 'Personal grocery expenses' },
      { code: '55130', name: 'Personal Transportation', type: 'expense', description: 'Personal transport expenses' },
      { code: '55140', name: 'Personal Entertainment', type: 'expense', description: 'Personal entertainment expenses' },
      { code: '55150', name: 'Personal Healthcare', type: 'expense', description: 'Personal healthcare expenses' },
      { code: '55160', name: 'Personal Shopping', type: 'expense', description: 'Personal shopping expenses' },
      { code: '55170', name: 'Personal Travel', type: 'expense', description: 'Personal travel expenses' },
      { code: '55180', name: 'Personal Insurance', type: 'expense', description: 'Personal insurance premiums' },
      { code: '55190', name: 'Personal Education', type: 'expense', description: 'Personal education expenses' }
    ];
    
    console.log(chalk.cyan(`Creating ${personalAccounts.length} personal accounts...`));
    
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const accountData of personalAccounts) {
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
            userId: userId,
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
      orderBy: { code: 'asc' }
    });
    
    console.log(chalk.blue('\n==== Personal Accounts Summary ===='));
    console.log(`Total accounts: ${finalAccounts.length}`);
    console.log(`Created in this run: ${createdCount}`);
    console.log(`Skipped (already existed): ${skippedCount}`);
    
    // Group by type
    const accountsByType = finalAccounts.reduce((acc, account) => {
      const type = account.type || 'Unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(account);
      return acc;
    }, {});
    
    // Display by type
    Object.entries(accountsByType).forEach(([type, accounts]) => {
      console.log(chalk.cyan(`\n${type.toUpperCase()} ACCOUNTS (${accounts.length}):`));
      accounts.forEach(account => {
        console.log(`  ${account.code} - ${account.name}`);
      });
    });
    
    console.log(chalk.green('\n✅ Personal accounts creation completed successfully!'));
    console.log(chalk.yellow('\n💡 Tips:'));
    console.log(chalk.yellow('• Bank accounts are asset accounts (positive balance)'));
    console.log(chalk.yellow('• Credit cards are liability accounts (negative balance)'));
    console.log(chalk.yellow('• You can now track personal finances alongside business finances'));
    
  } catch (error) {
    console.error(chalk.red('Error creating personal accounts:'), error);
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