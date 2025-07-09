const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJournalEntries() {
  console.log('==== Checking Journal Entries and Accounts ====\n');
  
  try {
    // Check if we have any users
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });
    console.log(`Found ${users.length} users:`);
    users.forEach(user => console.log(`  - ${user.name} (${user.email})`));
    
    if (users.length === 0) {
      console.log('\nNo users found. Cannot proceed with journal entry check.');
      return;
    }
    
    const userId = users[0].id;
    console.log(`\nUsing user: ${users[0].name}`);
    
    // Check accounts
    const accounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true, code: true, name: true, type: true }
    });
    
    console.log(`\nFound ${accounts.length} accounts:`);
    accounts.forEach(account => {
      console.log(`  - ${account.code}: ${account.name} (${account.type})`);
    });
    
    // Check journal entries
    const journalEntries = await prisma.journalEntry.findMany({
      where: { userId },
      include: {
        debitAccount: { select: { code: true, name: true } },
        creditAccount: { select: { code: true, name: true } }
      },
      orderBy: { date: 'desc' }
    });
    
    console.log(`\nFound ${journalEntries.length} journal entries:`);
    journalEntries.forEach(entry => {
      console.log(`  - ${entry.date.toISOString().split('T')[0]}: ${entry.description}`);
      console.log(`    Debit: ${entry.debitAccount.code} - ${entry.debitAccount.name}`);
      console.log(`    Credit: ${entry.creditAccount.code} - ${entry.creditAccount.name}`);
      console.log(`    Amount: ${entry.amount}`);
      console.log('');
    });
    
    // Check if we have the basic account types needed
    const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
    const missingTypes = accountTypes.filter(type => 
      !accounts.some(account => account.type === type)
    );
    
    if (missingTypes.length > 0) {
      console.log(`\nMissing account types: ${missingTypes.join(', ')}`);
      console.log('You need to create accounts for these types to proceed with journal entries.');
    } else {
      console.log('\n✓ All basic account types are present');
    }
    
  } catch (error) {
    console.error('Error checking journal entries:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJournalEntries(); 