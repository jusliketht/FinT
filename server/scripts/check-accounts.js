// Load environment variables
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Main function to check accounts
async function checkAccounts() {
  console.log('Checking account data in the database...');

  // Check account types
  try {
    const accountTypes = await prisma.accountType.findMany({
      include: {
        categories: true
      }
    });
    
    console.log(`\nFound ${accountTypes.length} account types:`);
    accountTypes.forEach(type => {
      console.log(`- ${type.label} (${type.value}): ${type.categories.length} categories`);
      type.categories.forEach(category => {
        console.log(`  - ${category.name}`);
      });
    });
  } catch (error) {
    console.error('Error retrieving account types:', error);
  }

  console.log('\nDatabase check completed!');
}

// Run the check
checkAccounts()
  .catch((error) => {
    console.error('Error in check script:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 