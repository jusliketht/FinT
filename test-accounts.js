const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Account Heads Functionality...');
    
    // Test 1: Check if account heads exist
    const accountHeads = await prisma.accountHead.findMany({
      include: {
        category: true
      }
    });
    
    console.log(`Found ${accountHeads.length} account heads:`);
    accountHeads.forEach(account => {
      console.log(`- ${account.code}: ${account.name} (${account.category.name})`);
    });
    
    // Test 2: Check if journal entries exist
    const journalEntries = await prisma.journalEntry.findMany({
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
    
    // Test 3: Check if businesses exist
    const businesses = await prisma.business.findMany({
      take: 5
    });
    
    console.log(`\nFound ${businesses.length} businesses:`);
    businesses.forEach(business => {
      console.log(`- ${business.name} (${business.type})`);
    });
    
    // Test 4: Check if users exist
    const users = await prisma.user.findMany({
      take: 5
    });
    
    console.log(`\nFound ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email})`);
    });
    
    console.log('\n✓ All tests completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 