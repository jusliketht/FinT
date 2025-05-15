const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Checking Account table structure...');
  
  try {
    // Use raw query to get table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Account'
    `;
    
    console.log('Account table columns:');
    console.table(tableInfo);
    
    // Try to get account records with the actual structure
    const accounts = await prisma.$queryRaw`
      SELECT * FROM "Account" LIMIT 5
    `;
    
    console.log('Sample accounts:');
    console.log(accounts);
    
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