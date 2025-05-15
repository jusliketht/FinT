const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');

/**
 * Verify Accounting System Prerequisites
 * This script checks if all required accounting components are properly set up
 */

async function main() {
  console.log(chalk.blue('==== Financial Management System Setup Verification ===='));
  
  let allPassed = true;
  
  // 1. Verify Account Types
  console.log(chalk.yellow('\nVerifying Account Types...'));
  // Check for account types (case insensitive)
  const requiredAccountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  
  try {
    const accountTypes = await prisma.accountType.findMany();
    const accountTypeValues = accountTypes.map(type => type.value.toLowerCase());
    console.log(chalk.gray(`Found account type values: ${accountTypes.map(t => t.value).join(', ')}`));
    
    // Check if all required types exist (case insensitive)
    const missingTypes = requiredAccountTypes.filter(
      type => !accountTypeValues.includes(type.toLowerCase())
    );
    
    if (missingTypes.length === 0) {
      console.log(chalk.green('✓ All required account types exist'));
      console.log(chalk.gray(`  Found types: ${accountTypes.map(t => t.label).join(', ')}`));
    } else {
      console.log(chalk.red(`✗ Missing account types: ${missingTypes.join(', ')}`));
      allPassed = false;
    }
  } catch (error) {
    console.log(chalk.red('✗ Error checking account types'), error);
    allPassed = false;
  }
  
  // 2. Verify Account Categories
  console.log(chalk.yellow('\nVerifying Account Categories...'));
  try {
    const categories = await prisma.accountCategory.findMany({
      include: { type: true }
    });
    
    if (categories.length === 0) {
      console.log(chalk.red('✗ No account categories found'));
      allPassed = false;
    } else {
      console.log(chalk.green(`✓ Found ${categories.length} account categories`));
      
      // Group by type and display
      const categoriesByType = categories.reduce((acc, cat) => {
        const typeValue = cat.type?.value || 'Unknown';
        if (!acc[typeValue]) acc[typeValue] = [];
        acc[typeValue].push(cat.name);
        return acc;
      }, {});
      
      Object.entries(categoriesByType).forEach(([type, cats]) => {
        console.log(chalk.gray(`  ${type}: ${cats.join(', ')}`));
      });
    }
  } catch (error) {
    console.log(chalk.red('✗ Error checking account categories'), error);
    allPassed = false;
  }
  
  // 3. Verify Accounts (Chart of Accounts)
  console.log(chalk.yellow('\nVerifying Chart of Accounts...'));
  try {
    const accounts = await prisma.account.findMany({
      include: { 
        type: true,
        category: true
      }
    });
    
    if (accounts.length === 0) {
      console.log(chalk.red('✗ No accounts found'));
      allPassed = false;
    } else {
      console.log(chalk.green(`✓ Found ${accounts.length} accounts`));
      
      // Group by type
      const accountsByType = accounts.reduce((acc, account) => {
        const typeValue = account.type?.value || 'Unknown';
        if (!acc[typeValue]) acc[typeValue] = [];
        acc[typeValue].push(`${account.code} - ${account.name}`);
        return acc;
      }, {});
      
      // Show first few accounts of each type
      Object.entries(accountsByType).forEach(([type, accts]) => {
        const displayAccounts = accts.length > 5 ? [...accts.slice(0, 5), `... and ${accts.length - 5} more`] : accts;
        console.log(chalk.gray(`  ${type}: ${displayAccounts.join(', ')}`));
      });
    }
  } catch (error) {
    console.log(chalk.red('✗ Error checking accounts'), error);
    allPassed = false;
  }
  
  // 4. Verify Database Schema
  console.log(chalk.yellow('\nVerifying Database Schema...'));
  const requiredTables = ['AccountType', 'AccountCategory', 'Account', 'JournalEntry'];
  const optionalTables = ['BankAccount', 'CreditCard', 'Transaction'];
  
  try {
    // This is a simple method to check if tables exist by querying them
    // For each required table, we'll try to count records
    for (const table of requiredTables) {
      try {
        const lowercaseTable = table.charAt(0).toLowerCase() + table.slice(1);
        await prisma[lowercaseTable].count();
        console.log(chalk.green(`✓ Table exists: ${table}`));
      } catch (e) {
        console.log(chalk.red(`✗ Missing required table: ${table}`));
        allPassed = false;
      }
    }
    
    // Check optional tables
    for (const table of optionalTables) {
      try {
        const lowercaseTable = table.charAt(0).toLowerCase() + table.slice(1);
        await prisma[lowercaseTable].count();
        console.log(chalk.gray(`○ Optional table exists: ${table}`));
      } catch (e) {
        console.log(chalk.gray(`○ Optional table not found: ${table}`));
      }
    }
  } catch (error) {
    console.log(chalk.red('✗ Error checking database schema'), error);
    allPassed = false;
  }
  
  // Final summary
  console.log(chalk.blue('\n==== Verification Summary ===='));
  
  if (allPassed) {
    console.log(chalk.green('✓ All prerequisites for accounting system are in place!'));
    console.log(chalk.blue('You can proceed with accounting operations using the workflow documented in Accounting_Workflow_Documentation.md'));
  } else {
    console.log(chalk.red('✗ Some prerequisites are missing. Please address the issues above before proceeding.'));
  }
}

main()
  .catch((e) => {
    console.error('Error running verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 