const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModels() {
  try {
    console.log('Available Prisma models:');
    console.log(Object.keys(prisma).filter(key => !key.startsWith('$') && !key.startsWith('_')));
    
    // Test specific models
    const models = ['accountingPeriod', 'taxRate', 'taxTransaction'];
    for (const model of models) {
      try {
        const count = await prisma[model].count();
        console.log(`${model}: ${count} records`);
      } catch (error) {
        console.log(`${model}: Error - ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModels(); 