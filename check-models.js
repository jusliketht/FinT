const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Available Prisma models:');
  console.log(Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$')));
  
  try {
    // Try to query each model
    for (const key of Object.keys(prisma).filter(key => !key.startsWith('_') && !key.startsWith('$'))) {
      try {
        const count = await prisma[key].count();
        console.log(`${key}: ${count} records`);
      } catch (error) {
        console.log(`${key}: Error - ${error.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 