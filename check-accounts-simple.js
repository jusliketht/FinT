const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking for existing accounts...');
    
    // Check AccountHead table (new schema)
    const accountHeads = await prisma.accountHead.findMany({
      take: 5,
      include: {
        category: true
      }
    });
    
    console.log(`Found ${accountHeads.length} account heads:`);
    accountHeads.forEach(account => {
      console.log(`- ${account.code}: ${account.name} (${account.category.name})`);
    });
    
    // Check Account table (old schema)
    const accounts = await prisma.account.findMany({
      take: 5
    });
    
    console.log(`\nFound ${accounts.length} accounts in old schema:`);
    accounts.forEach(account => {
      console.log(`- ${account.code}: ${account.name} (${account.type})`);
    });
    
    // Check if there are any journal entries
    const journalEntries = await prisma.journalEntry.findMany({
      take: 5,
      include: {
        JournalEntryLines: {
          include: {
            Account: true
          }
        }
      }
    });
    
    console.log(`\nFound ${journalEntries.length} journal entries:`);
    journalEntries.forEach(entry => {
      console.log(`- ${entry.description} (${entry.JournalEntryLines.length} lines)`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 