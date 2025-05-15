const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Seed Accounts
 * This script creates basic accounts for testing
 */

async function main() {
  console.log('==== Creating Sample Accounts ====');
  
  try {
    // Check if we already have accounts
    const existingAccounts = await prisma.account.count();
    console.log(`Found ${existingAccounts} existing accounts.`);
    
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
    console.log('Creating sample accounts...');
    
    // First check the database schema
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Account'
    `;
    
    const columns = tableInfo.map(col => `${col.column_name} (${col.is_nullable === 'YES' ? 'nullable' : 'required'})`);
    console.log('Account table columns:', columns.join(', '));
    
    // Check if userId column exists
    const userIdColumn = tableInfo.find(col => col.column_name === 'userId');
    
    // Modify the schema if needed
    if (userIdColumn) {
      console.log('userId column exists in Account table');
      
      // Try to alter the table to make userId nullable
      try {
        await prisma.$executeRaw`
          ALTER TABLE "Account" ALTER COLUMN "userId" DROP NOT NULL
        `;
        console.log('Modified Account table to make userId nullable');
      } catch (error) {
        console.error('Error modifying schema:', error);
      }
    }
    
    // Now create the accounts
    for (const accountData of sampleAccounts) {
      try {
        // Check if account already exists
        const existingAccount = await prisma.account.findFirst({
          where: { code: accountData.code }
        });
        
        if (existingAccount) {
          console.log(`Account ${accountData.code} - ${accountData.name} already exists, skipping.`);
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
          console.log(`Account type ${accountData.typeValue} not found. Skipping ${accountData.code} - ${accountData.name}`);
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
            console.log(`Cannot find any category for ${accountData.typeValue}. Skipping ${accountData.code} - ${accountData.name}`);
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
    
    // Display summary
    const finalAccounts = await prisma.account.findMany({
      include: {
        type: true,
        category: true
      }
    });
    
    console.log('\n==== Chart of Accounts Summary ====');
    console.log(`Total accounts: ${finalAccounts.length}`);
    
    // Group by type
    const accountsByType = {};
    finalAccounts.forEach(account => {
      const typeValue = account.type?.value || 'Unknown';
      if (!accountsByType[typeValue]) accountsByType[typeValue] = [];
      accountsByType[typeValue].push(account);
    });
    
    // Display by type
    Object.entries(accountsByType).forEach(([type, accounts]) => {
      console.log(`\n${type.toUpperCase()} ACCOUNTS:`);
      accounts.forEach(account => {
        console.log(`  ${account.code} - ${account.name} (${account.category?.name || 'No category'})`);
      });
    });
    
  } catch (error) {
    console.error('Error creating sample accounts:', error);
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