const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createSampleJournalEntries() {
  console.log('==== Creating Sample Journal Entries (Personal & Company) ====\n');
  
  try {
    // Get the demo user
    const user = await prisma.user.findFirst({
      where: { email: 'demo@fint.com' }
    });
    
    if (!user) {
      console.log('Demo user not found. Please create a demo user first.');
      return;
    }
    
    // Get or create a sample company for the user
    let company = await prisma.business.findFirst({ where: { ownerId: user.id } });
    if (!company) {
      company = await prisma.business.create({
        data: {
          name: 'Demo Company',
          type: 'private_limited',
          ownerId: user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      console.log('Created demo company:', company.name);
    }
    
    console.log(`Using user: ${user.name}`);
    console.log(`Using company: ${company.name}`);
    
    // Get some key accounts for testing (personal)
    const accounts = await prisma.account.findMany({
      where: { userId: user.id, businessId: null },
      select: { id: true, code: true, name: true, type: true }
    });
    // Get some key accounts for company
    const companyAccounts = await prisma.account.findMany({
      where: { userId: user.id, businessId: company.id },
      select: { id: true, code: true, name: true, type: true }
    });
    
    // Find specific accounts for our test entries (personal)
    const cashAccount = accounts.find(acc => acc.code === '11100'); // Cash in Hand
    const bankAccount = accounts.find(acc => acc.code === '11210'); // HDFC Current Account
    const revenueAccount = accounts.find(acc => acc.code === '41110'); // IT Consulting Revenue
    const expenseAccount = accounts.find(acc => acc.code === '51310'); // Digital Ads
    // Company accounts
    const cCashAccount = companyAccounts.find(acc => acc.code === '11100');
    const cBankAccount = companyAccounts.find(acc => acc.code === '11210');
    const cRevenueAccount = companyAccounts.find(acc => acc.code === '41110');
    const cExpenseAccount = companyAccounts.find(acc => acc.code === '51310');
    
    if (!cashAccount || !bankAccount || !revenueAccount || !expenseAccount) {
      console.log('Required personal accounts not found. Please ensure the chart of accounts is properly set up.');
    }
    if (!cCashAccount || !cBankAccount || !cRevenueAccount || !cExpenseAccount) {
      console.log('Required company accounts not found. Please ensure the company chart of accounts is properly set up.');
    }
    
    // --- PERSONAL ENTRIES ---
    if (cashAccount && bankAccount && revenueAccount && expenseAccount) {
      console.log('\n--- Creating PERSONAL journal entries (businessId: null) ---');
      // 1. Personal revenue
      await prisma.journalEntry.create({
        data: {
          date: new Date('2024-02-01'),
          description: 'Personal consulting income',
          amount: 20000.00,
          debitAccountId: cashAccount.id,
          creditAccountId: revenueAccount.id,
          userId: user.id,
          businessId: null
        }
      });
      // 2. Personal expense
      await prisma.journalEntry.create({
        data: {
          date: new Date('2024-02-05'),
          description: 'Personal digital ads expense',
          amount: 3000.00,
          debitAccountId: expenseAccount.id,
          creditAccountId: bankAccount.id,
          userId: user.id,
          businessId: null
        }
      });
      console.log('✓ Created 2 personal journal entries.');
    }
    // --- COMPANY ENTRIES ---
    if (cCashAccount && cBankAccount && cRevenueAccount && cExpenseAccount) {
      console.log('\n--- Creating COMPANY journal entries (businessId: company.id) ---');
      // 1. Company revenue
      await prisma.journalEntry.create({
        data: {
          date: new Date('2024-02-10'),
          description: 'Company IT consulting income',
          amount: 80000.00,
          debitAccountId: cCashAccount.id,
          creditAccountId: cRevenueAccount.id,
          userId: user.id,
          businessId: company.id
        }
      });
      // 2. Company expense
      await prisma.journalEntry.create({
        data: {
          date: new Date('2024-02-15'),
          description: 'Company digital ads expense',
          amount: 12000.00,
          debitAccountId: cExpenseAccount.id,
          creditAccountId: cBankAccount.id,
          userId: user.id,
          businessId: company.id
        }
      });
      console.log('✓ Created 2 company journal entries.');
    }
    
    // Print summary
    const personalEntries = await prisma.journalEntry.findMany({
      where: { userId: user.id, businessId: null },
      orderBy: { date: 'asc' }
    });
    const companyEntries = await prisma.journalEntry.findMany({
      where: { userId: user.id, businessId: company.id },
      orderBy: { date: 'asc' }
    });
    console.log(`\nPersonal entries: ${personalEntries.length}`);
    personalEntries.forEach(e => console.log(`  - ${e.date.toISOString().split('T')[0]}: ${e.description}`));
    console.log(`\nCompany entries: ${companyEntries.length}`);
    companyEntries.forEach(e => console.log(`  - ${e.date.toISOString().split('T')[0]}: ${e.description}`));
    
    console.log('\n==== Journal Entry Creation Complete ====');
    
  } catch (error) {
    console.error('Error creating journal entries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleJournalEntries(); 