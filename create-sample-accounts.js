const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');
const crypto = require('crypto');

/**
 * Create Sample Accounts (Simple Version)
 * This script bypasses any middleware and creates accounts directly in the database
 */

async function main() {
  console.log(chalk.blue('==== Creating Sample Accounts (Simple Version) ===='));
  
  try {
    // Check if we already have accounts
    const existingAccounts = await prisma.account.count();
    if (existingAccounts > 0) {
      console.log(chalk.yellow(`Found ${existingAccounts} existing accounts. Do you want to proceed and add more sample accounts?`));
      console.log(chalk.yellow('You can cancel this script (Ctrl+C) if you want to keep only existing accounts.'));
    }
    
    // Basic sample accounts by type
    const sampleAccounts = [
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
        categoryName: 'Owner\'s Equity',
        description: 'Owner\'s investment in the business',
        balance: 25000
      },
      { 
        code: '3900', 
        name: 'Retained Earnings', 
        typeValue: 'equity',
        categoryName: 'Owner\'s Equity',
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
    
    // Create the accounts
    console.log(chalk.cyan('Creating sample accounts...'));
    
    // First, check the database schema
    console.log('Checking database schema...');
    
    // Get column info for Account table
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Account'
    `;
    
    console.log('Account table columns:');
    const columns = tableInfo.map(col => `${col.column_name} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    console.log(columns.join(', '));
    
    // Check if userId column exists and is required
    const userIdColumn = tableInfo.find(col => col.column_name === 'userId');
    const userIdRequired = userIdColumn && userIdColumn.is_nullable === 'NO';
    
    if (userIdRequired) {
      console.log(chalk.yellow('userId column is required. Will attempt to find or create a default user.'));
      
      // Try to find a user
      let userId;
      try {
        // Check if User table exists
        const userTable = await prisma.$queryRaw`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_name = 'User'
        `;
        
        if (userTable.length > 0) {
          // Try to get a user ID
          const users = await prisma.$queryRaw`
            SELECT id FROM "User" LIMIT 1
          `;
          
          if (users.length > 0) {
            userId = users[0].id;
            console.log(chalk.green(`Found existing user with ID: ${userId}`));
          } else {
            console.log(chalk.red('User table exists but no users found. Cannot proceed.'));
            return;
          }
        } else {
          console.log(chalk.red('User table not found. Cannot proceed with account creation.'));
          return;
        }
      } catch (error) {
        console.error(chalk.red('Error finding users:'), error);
        return;
      }
      
      // Now create accounts with the user ID
      for (const accountData of sampleAccounts) {
        try {
          // Check if account already exists by code
          const existingAccount = await prisma.account.findFirst({
            where: { code: accountData.code }
          });
          
          if (existingAccount) {
            console.log(chalk.gray(`Account ${accountData.code} - ${accountData.name} already exists, skipping.`));
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
            console.log(chalk.red(`Account type ${accountData.typeValue} not found. Skipping ${accountData.code} - ${accountData.name}`));
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
              console.log(chalk.red(`Cannot find any category for ${accountData.typeValue}. Skipping ${accountData.code} - ${accountData.name}`));
              continue;
            }
            
            console.log(chalk.yellow(`Using ${category.name} for ${accountData.name} instead of ${accountData.categoryName}`));
          }
          
          // Create account with raw SQL to include userId
          await prisma.$executeRaw`
            INSERT INTO "Account" (
              "id", "code", "name", "typeId", "categoryId", "description", "balance", "createdAt", "updatedAt", "userId"
            ) VALUES (
              ${crypto.randomUUID()}, 
              ${accountData.code}, 
              ${accountData.name}, 
              ${accountType.id}, 
              ${category.id}, 
              ${accountData.description}, 
              ${accountData.balance}, 
              CURRENT_TIMESTAMP, 
              CURRENT_TIMESTAMP,
              ${userId}
            )
          `;
          
          console.log(chalk.green(`✓ Created account: ${accountData.code} - ${accountData.name}`));
        } catch (error) {
          console.log(chalk.red(`✗ Failed to create account ${accountData.code}: ${error.message}`));
        }
      }
    } else {
      // If userId is not required, create accounts without it
      console.log(chalk.green('userId column is not required or does not exist. Creating accounts directly.'));
      
      for (const accountData of sampleAccounts) {
        try {
          // Check if account already exists by code
          const existingAccount = await prisma.account.findFirst({
            where: { code: accountData.code }
          });
          
          if (existingAccount) {
            console.log(chalk.gray(`Account ${accountData.code} - ${accountData.name} already exists, skipping.`));
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
            console.log(chalk.red(`Account type ${accountData.typeValue} not found. Skipping ${accountData.code} - ${accountData.name}`));
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
              console.log(chalk.red(`Cannot find any category for ${accountData.typeValue}. Skipping ${accountData.code} - ${accountData.name}`));
              continue;
            }
            
            console.log(chalk.yellow(`Using ${category.name} for ${accountData.name} instead of ${accountData.categoryName}`));
          }
          
          // Create account directly
          const account = await prisma.$executeRaw`
            INSERT INTO "Account" (
              "id", "code", "name", "typeId", "categoryId", "description", "balance", "createdAt", "updatedAt"
            ) VALUES (
              ${crypto.randomUUID()}, 
              ${accountData.code}, 
              ${accountData.name}, 
              ${accountType.id}, 
              ${category.id}, 
              ${accountData.description}, 
              ${accountData.balance}, 
              CURRENT_TIMESTAMP, 
              CURRENT_TIMESTAMP
            )
          `;
          
          console.log(chalk.green(`✓ Created account: ${accountData.code} - ${accountData.name}`));
        } catch (error) {
          console.log(chalk.red(`✗ Failed to create account ${accountData.code}: ${error.message}`));
        }
      }
    }
    
    // Display summary
    const finalAccounts = await prisma.account.findMany({
      include: {
        type: true,
        category: true
      }
    });
    
    console.log(chalk.blue('\n==== Chart of Accounts Summary ===='));
    console.log(`Total accounts: ${finalAccounts.length}`);
    
    // Group by type
    const accountsByType = finalAccounts.reduce((acc, account) => {
      const typeValue = account.type?.value || 'Unknown';
      if (!acc[typeValue]) acc[typeValue] = [];
      acc[typeValue].push(account);
      return acc;
    }, {});
    
    // Display by type
    Object.entries(accountsByType).forEach(([type, accounts]) => {
      console.log(chalk.cyan(`\n${type.toUpperCase()} ACCOUNTS:`));
      accounts.forEach(account => {
        console.log(`  ${account.code} - ${account.name} (${account.category?.name || 'No category'})`);
      });
    });
    
  } catch (error) {
    console.error(chalk.red('Error creating sample accounts:'), error);
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