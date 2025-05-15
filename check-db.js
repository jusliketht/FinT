require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabaseStructure() {
  console.log('Checking database structure...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    // Check Account table structure
    console.log('\nChecking Account table structure...');
    const accountColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Account'
    `;
    
    console.log('Account table columns:');
    console.table(accountColumns);
    
    // Check AccountType table structure
    console.log('\nChecking AccountType table structure...');
    const accountTypeColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'AccountType'
    `;
    
    console.log('AccountType table columns:');
    console.table(accountTypeColumns);
    
    // Check AccountCategory table structure
    console.log('\nChecking AccountCategory table structure...');
    const accountCategoryColumns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'AccountCategory'
    `;
    
    console.log('AccountCategory table columns:');
    console.table(accountCategoryColumns);
    
    // Check if User table exists
    console.log('\nChecking if User table exists...');
    const userTable = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_name = 'User'
    `;
    
    if (userTable.length > 0) {
      console.log('User table exists');
      
      // Check User table structure
      const userColumns = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'User'
      `;
      
      console.log('User table columns:');
      console.table(userColumns);
    } else {
      console.log('User table does not exist');
    }
    
    console.log('\nDatabase structure check completed successfully!');
  } catch (error) {
    console.log('Database structure check failed:', error);
  }
}

checkDatabaseStructure()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 