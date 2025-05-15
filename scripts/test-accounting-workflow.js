const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');

/**
 * Test Accounting Workflow
 * This script tests the basic accounting workflow:
 * 1. Create journal entries
 * 2. Verify ledger entries
 * 3. Generate trial balance
 */

async function main() {
  console.log(chalk.blue('==== Accounting Workflow Test ===='));
  console.log(chalk.yellow('This script will create sample accounting entries and verify the workflow.'));
  
  try {
    // Step 1: Find key accounts for testing
    console.log(chalk.cyan('\n1. Looking up test accounts...'));
    
    // Find an Asset account (preferably Cash)
    const cashAccount = await findAccountByCodeOrType('1000', 'Asset');
    if (!cashAccount) {
      console.log(chalk.red('✗ No Cash or Asset account found. Cannot proceed with test.'));
      return;
    }
    console.log(chalk.green(`✓ Found Cash/Asset account: ${cashAccount.code} - ${cashAccount.name}`));
    
    // Find a Revenue account
    const revenueAccount = await findAccountByType('Revenue');
    if (!revenueAccount) {
      console.log(chalk.red('✗ No Revenue account found. Cannot proceed with test.'));
      return;
    }
    console.log(chalk.green(`✓ Found Revenue account: ${revenueAccount.code} - ${revenueAccount.name}`));
    
    // Find an Expense account
    const expenseAccount = await findAccountByType('Expense');
    if (!expenseAccount) {
      console.log(chalk.red('✗ No Expense account found. Cannot proceed with test.'));
      return;
    }
    console.log(chalk.green(`✓ Found Expense account: ${expenseAccount.code} - ${expenseAccount.name}`));
    
    // Step 2: Create test journal entries
    console.log(chalk.cyan('\n2. Creating test journal entries...'));
    
    // Record revenue (Debit Cash, Credit Revenue)
    console.log('Creating revenue entry: Debit Cash, Credit Revenue');
    const revenueAmount = 1000.00;
    const revenueEntry = await createJournalEntry(
      'Test Revenue Entry',
      cashAccount.id,
      revenueAccount.id,
      revenueAmount
    );
    console.log(chalk.green(`✓ Created journal entry: ${revenueEntry.id}`));
    
    // Record expense (Debit Expense, Credit Cash)
    console.log('Creating expense entry: Debit Expense, Credit Cash');
    const expenseAmount = 500.00;
    const expenseEntry = await createJournalEntry(
      'Test Expense Entry',
      expenseAccount.id,
      cashAccount.id,
      expenseAmount
    );
    console.log(chalk.green(`✓ Created journal entry: ${expenseEntry.id}`));
    
    // Step 3: Verify account balances
    console.log(chalk.cyan('\n3. Verifying account balances...'));
    
    // Refresh account data
    const updatedCashAccount = await prisma.account.findUnique({
      where: { id: cashAccount.id }
    });
    
    const updatedRevenueAccount = await prisma.account.findUnique({
      where: { id: revenueAccount.id }
    });
    
    const updatedExpenseAccount = await prisma.account.findUnique({
      where: { id: expenseAccount.id }
    });
    
    // Expected balances (may depend on previous data)
    const expectedCashBalance = parseFloat(cashAccount.balance) + revenueAmount - expenseAmount;
    const expectedRevenueBalance = parseFloat(revenueAccount.balance) + revenueAmount;
    const expectedExpenseBalance = parseFloat(expenseAccount.balance) + expenseAmount;
    
    console.log(`Cash balance: ${updatedCashAccount.balance}`);
    console.log(`Revenue balance: ${updatedRevenueAccount.balance}`);
    console.log(`Expense balance: ${updatedExpenseAccount.balance}`);
    
    // Verify the balances
    if (Math.abs(parseFloat(updatedCashAccount.balance) - expectedCashBalance) < 0.01) {
      console.log(chalk.green('✓ Cash account balance updated correctly'));
    } else {
      console.log(chalk.red(`✗ Cash account balance incorrect. Expected ~${expectedCashBalance}, got ${updatedCashAccount.balance}`));
    }
    
    if (Math.abs(parseFloat(updatedRevenueAccount.balance) - expectedRevenueBalance) < 0.01) {
      console.log(chalk.green('✓ Revenue account balance updated correctly'));
    } else {
      console.log(chalk.red(`✗ Revenue account balance incorrect. Expected ~${expectedRevenueBalance}, got ${updatedRevenueAccount.balance}`));
    }
    
    if (Math.abs(parseFloat(updatedExpenseAccount.balance) - expectedExpenseBalance) < 0.01) {
      console.log(chalk.green('✓ Expense account balance updated correctly'));
    } else {
      console.log(chalk.red(`✗ Expense account balance incorrect. Expected ~${expectedExpenseBalance}, got ${updatedExpenseAccount.balance}`));
    }
    
    // Step 4: Generate Trial Balance
    console.log(chalk.cyan('\n4. Generating trial balance...'));
    
    const trialBalance = await generateTrialBalance();
    
    // Display trial balance summary
    console.log(`Total Debits: ${trialBalance.totalDebits.toFixed(2)}`);
    console.log(`Total Credits: ${trialBalance.totalCredits.toFixed(2)}`);
    
    // Verify trial balance equality
    const diff = Math.abs(trialBalance.totalDebits - trialBalance.totalCredits);
    if (diff < 0.01) {
      console.log(chalk.green('✓ Trial Balance is balanced (Debits = Credits)'));
    } else {
      console.log(chalk.red(`✗ Trial Balance is NOT balanced. Difference: ${diff.toFixed(2)}`));
    }
    
    console.log(chalk.blue('\n==== Workflow Test Complete ===='));
    console.log(chalk.gray('Note: The created entries remain in the database for your inspection.'));
    console.log(chalk.gray('To view them, check the journal entries and ledgers in the application.'));
    
  } catch (error) {
    console.error(chalk.red('\nError during test:'), error);
  }
}

/**
 * Helper function to find an account by code or type
 */
async function findAccountByCodeOrType(code, type) {
  // Try to find by code first
  const accountByCode = await prisma.account.findFirst({
    where: { code }
  });
  
  if (accountByCode) return accountByCode;
  
  // Otherwise find by type
  return findAccountByType(type);
}

/**
 * Helper function to find an account by type
 */
async function findAccountByType(type) {
  // Find account type first
  const accountType = await prisma.accountType.findFirst({
    where: { value: type }
  });
  
  if (!accountType) return null;
  
  // Find account with this type
  return prisma.account.findFirst({
    where: { typeId: accountType.id }
  });
}

/**
 * Helper function to create a journal entry
 */
async function createJournalEntry(description, debitAccountId, creditAccountId, amount) {
  return prisma.journalEntry.create({
    data: {
      date: new Date(),
      description,
      amount,
      debitAccountId,
      creditAccountId
    }
  });
}

/**
 * Helper function to generate a trial balance
 */
async function generateTrialBalance() {
  // Get all accounts
  const accounts = await prisma.account.findMany({
    include: {
      type: true
    }
  });
  
  let totalDebits = 0;
  let totalCredits = 0;
  
  // Calculate debits and credits based on account type
  accounts.forEach(account => {
    const balance = parseFloat(account.balance);
    const type = account.type?.value;
    
    if (['Asset', 'Expense'].includes(type)) {
      // Debit balance accounts
      if (balance > 0) {
        totalDebits += balance;
      } else {
        totalCredits += Math.abs(balance);
      }
    } else {
      // Credit balance accounts (Liability, Equity, Revenue)
      if (balance > 0) {
        totalCredits += balance;
      } else {
        totalDebits += Math.abs(balance);
      }
    }
  });
  
  return {
    accounts,
    totalDebits,
    totalCredits
  };
}

main()
  .catch((e) => {
    console.error('Error running test:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 