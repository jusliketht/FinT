require('dotenv').config({ path: './.env.test' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    // Log prisma properties
    console.log('Prisma object keys:', Object.keys(prisma));
    console.log('Prisma client version:', prisma._clientVersion);
    
    // Check if account exists
    if (prisma.account) {
      console.log('account exists on prisma client');
      
      // Try to get accounts
      const accounts = await prisma.account.findMany({
        take: 5
      });
      
      console.log('Successfully queried accounts:', accounts);
      console.log('Database connection test successful!');
    } else {
      console.log('account does NOT exist on prisma client');
    }
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 