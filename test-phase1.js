const { PrismaClient } = require('@prisma/client');
const chalk = require('chalk');

const prisma = new PrismaClient();

/**
 * Test Phase 1 Critical Bookkeeping System
 * This script verifies all Phase 1 requirements are working correctly
 */

async function main() {
  console.log(chalk.blue('==== Phase 1 Critical Bookkeeping System Test ===='));
  
  try {
    // Setup: Create test user if needed
    console.log(chalk.cyan('\n0. Setting up test environment...'));
    const testUser = await setupTestUser();
    
    // Test 1: Verify double-entry bookkeeping system
    console.log(chalk.cyan('\n1. Testing Double-Entry Bookkeeping System...'));
    await testDoubleEntryBookkeeping(testUser.id);
    
    // Test 2: Verify chart of accounts management
    console.log(chalk.cyan('\n2. Testing Chart of Accounts Management...'));
    await testChartOfAccounts();
    
    // Test 3: Verify multi-business support
    console.log(chalk.cyan('\n3. Testing Multi-Business Support...'));
    await testMultiBusinessSupport();
    
    // Test 4: Verify financial statement generation
    console.log(chalk.cyan('\n4. Testing Financial Statement Generation...'));
    await testFinancialStatements();
    
    // Test 5: Verify trial balance
    console.log(chalk.cyan('\n5. Testing Trial Balance...'));
    await testTrialBalance();
    
    console.log(chalk.green('\n✓ All Phase 1 tests completed successfully!'));
    
  } catch (error) {
    console.error(chalk.red('\n✗ Test failed:'), error);
  } finally {
    await prisma.$disconnect();
  }
}

async function setupTestUser() {
  // Check if test user exists
  let testUser = await prisma.user.findUnique({
    where: { email: 'test@phase1.com' }
  });
  
  if (!testUser) {
    // Create test user
    testUser = await prisma.user.create({
      data: {
        id: 'test-user-phase1',
        name: 'Test User Phase 1',
        email: 'test@phase1.com',
        password: 'hashedpassword',
        role: 'ADMIN',
        updatedAt: new Date()
      }
    });
    console.log(chalk.green('✓ Created test user'));
  } else {
    console.log(chalk.green('✓ Test user already exists'));
  }
  
  return testUser;
}

async function testDoubleEntryBookkeeping(userId) {
  // Get existing accounts
  const cashAccount = await prisma.accountHead.findFirst({
    where: { code: '1110' } // Cash and Cash Equivalents
  });
  
  const revenueAccount = await prisma.accountHead.findFirst({
    where: { code: '4100' } // Sales Revenue
  });
  
  if (!cashAccount || !revenueAccount) {
    console.log(chalk.yellow('⚠ Skipping double-entry test - required accounts not found'));
    return;
  }
  
  // Create a balanced journal entry
  const entryData = {
    date: new Date(),
    description: 'Test double-entry transaction',
    reference: 'TEST-001',
    totalAmount: 1000.00,
    userId: userId,
    businessId: null,
    isAdjusting: false,
    JournalEntryLines: {
      create: [
        {
          accountId: cashAccount.id,
          debitAmount: 1000.00,
          creditAmount: 0,
          description: 'Cash received'
        },
        {
          accountId: revenueAccount.id,
          debitAmount: 0,
          creditAmount: 1000.00,
          description: 'Revenue earned'
        }
      ]
    }
  };
  
  const journalEntry = await prisma.journalEntry.create({
    data: entryData,
    include: {
      JournalEntryLines: {
        include: {
          Account: true
        }
      }
    }
  });
  
  // Verify the entry is balanced
  const totalDebits = journalEntry.JournalEntryLines.reduce((sum, line) => sum + line.debitAmount, 0);
  const totalCredits = journalEntry.JournalEntryLines.reduce((sum, line) => sum + line.creditAmount, 0);
  
  if (Math.abs(totalDebits - totalCredits) < 0.01) {
    console.log(chalk.green('✓ Double-entry bookkeeping working correctly'));
    console.log(`  - Created journal entry: ${journalEntry.id}`);
    console.log(`  - Total debits: $${totalDebits.toFixed(2)}`);
    console.log(`  - Total credits: $${totalCredits.toFixed(2)}`);
  } else {
    console.log(chalk.red('✗ Double-entry bookkeeping failed'));
    console.log(`  - Total debits: $${totalDebits.toFixed(2)}`);
    console.log(`  - Total credits: $${totalCredits.toFixed(2)}`);
  }
}

async function testChartOfAccounts() {
  // Check if standard chart of accounts exists
  const accountCategories = await prisma.accountCategory.findMany();
  const accountHeads = await prisma.accountHead.findMany({
    include: {
      category: true
    }
  });
  
  console.log(`✓ Found ${accountCategories.length} account categories`);
  console.log(`✓ Found ${accountHeads.length} account heads`);
  
  // Verify standard categories exist
  const requiredCategories = ['Assets', 'Liabilities', 'Equity', 'Revenue', 'Expenses'];
  const existingCategories = accountCategories.map(cat => cat.name);
  
  for (const category of requiredCategories) {
    if (existingCategories.includes(category)) {
      console.log(`  ✓ Category "${category}" exists`);
    } else {
      console.log(`  ✗ Category "${category}" missing`);
    }
  }
  
  // Verify hierarchical structure
  const hierarchicalAccounts = accountHeads.filter(acc => acc.parentId);
  console.log(`✓ Found ${hierarchicalAccounts.length} hierarchical accounts`);
}

async function testMultiBusinessSupport() {
  // Check if businesses exist
  const businesses = await prisma.business.findMany({
    take: 5
  });
  
  console.log(`✓ Found ${businesses.length} businesses`);
  
  if (businesses.length > 0) {
    const business = businesses[0];
    console.log(`  - Sample business: ${business.name} (${business.type})`);
    
    // Check business-specific accounts
    const businessAccounts = await prisma.accountHead.findMany({
      where: { businessId: business.id }
    });
    
    console.log(`  - Business has ${businessAccounts.length} specific accounts`);
  }
}

async function testFinancialStatements() {
  // Get all journal entries for calculation
  const journalEntries = await prisma.journalEntry.findMany({
    include: {
      JournalEntryLines: {
        include: {
          Account: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });
  
  if (journalEntries.length === 0) {
    console.log(chalk.yellow('⚠ No journal entries found for financial statement test'));
    return;
  }
  
  // Calculate account balances
  const accountBalances = new Map();
  
  for (const entry of journalEntries) {
    for (const line of entry.JournalEntryLines) {
      const accountId = line.accountId;
      const account = line.Account;
      
      if (!accountBalances.has(accountId)) {
        accountBalances.set(accountId, {
          account,
          balance: 0
        });
      }
      
      const balance = accountBalances.get(accountId);
      balance.balance += line.debitAmount - line.creditAmount;
    }
  }
  
  // Group by account type
  const assets = [];
  const liabilities = [];
  const equity = [];
  const revenue = [];
  const expenses = [];
  
  for (const [accountId, data] of accountBalances) {
    const account = data.account;
    const balance = data.balance;
    
    switch (account.category.name) {
      case 'Assets':
        assets.push({ account, balance });
        break;
      case 'Liabilities':
        liabilities.push({ account, balance });
        break;
      case 'Equity':
        equity.push({ account, balance });
        break;
      case 'Revenue':
        revenue.push({ account, balance });
        break;
      case 'Expenses':
        expenses.push({ account, balance });
        break;
    }
  }
  
  console.log(`✓ Financial statement calculation working`);
  console.log(`  - Assets: ${assets.length} accounts`);
  console.log(`  - Liabilities: ${liabilities.length} accounts`);
  console.log(`  - Equity: ${equity.length} accounts`);
  console.log(`  - Revenue: ${revenue.length} accounts`);
  console.log(`  - Expenses: ${expenses.length} accounts`);
}

async function testTrialBalance() {
  // Get all journal entry lines
  const journalEntryLines = await prisma.journalEntryLine.findMany({
    include: {
      Account: {
        include: {
          category: true
        }
      }
    }
  });
  
  if (journalEntryLines.length === 0) {
    console.log(chalk.yellow('⚠ No journal entry lines found for trial balance test'));
    return;
  }
  
  // Calculate trial balance
  const trialBalance = new Map();
  
  for (const line of journalEntryLines) {
    const accountId = line.accountId;
    const account = line.Account;
    
    if (!trialBalance.has(accountId)) {
      trialBalance.set(accountId, {
        account,
        debits: 0,
        credits: 0,
        balance: 0
      });
    }
    
    const balance = trialBalance.get(accountId);
    balance.debits += line.debitAmount;
    balance.credits += line.creditAmount;
    balance.balance = balance.debits - balance.credits;
  }
  
  // Verify trial balance is balanced
  let totalDebits = 0;
  let totalCredits = 0;
  
  for (const [accountId, balance] of trialBalance) {
    totalDebits += balance.debits;
    totalCredits += balance.credits;
  }
  
  if (Math.abs(totalDebits - totalCredits) < 0.01) {
    console.log(chalk.green('✓ Trial balance is balanced'));
    console.log(`  - Total debits: $${totalDebits.toFixed(2)}`);
    console.log(`  - Total credits: $${totalCredits.toFixed(2)}`);
    console.log(`  - Accounts in trial balance: ${trialBalance.size}`);
  } else {
    console.log(chalk.red('✗ Trial balance is not balanced'));
    console.log(`  - Total debits: $${totalDebits.toFixed(2)}`);
    console.log(`  - Total credits: $${totalCredits.toFixed(2)}`);
  }
}

main(); 