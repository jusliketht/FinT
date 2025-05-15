const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  console.log('Prisma object keys:', Object.keys(prisma));
  console.log('Prisma client version:', prisma._clientVersion);
  
  try {
    // Check table structure
    console.log('\nChecking Account table structure...');
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
    
    console.log('Database connection test successful!');
  } catch (error) {
    console.log('Database connection test failed:', error);
  }
}

testConnection()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 