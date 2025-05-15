const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking Account Types in database...');
    
    const accountTypes = await prisma.accountType.findMany();
    
    console.log('\nAccount Types:');
    accountTypes.forEach(type => {
      console.log(`ID: ${type.id}, Value: "${type.value}", Label: "${type.label}"`);
    });
    
    console.log('\nTotal account types found:', accountTypes.length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 