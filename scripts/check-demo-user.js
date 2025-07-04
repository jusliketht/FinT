const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkAndCreateDemoUser() {
  try {
    console.log('🔍 Checking for demo user...');
    
    // Check if demo user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@fint.com' }
    });

    if (existingUser) {
      console.log('✅ Demo user already exists:', existingUser.email);
      return existingUser;
    }

    console.log('📝 Creating demo user...');
    
    // Hash the password
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    // Create demo user
    const demoUser = await prisma.user.create({
      data: {
        id: 'demo-user-id',
        name: 'Demo User',
        email: 'demo@fint.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Demo user created successfully:', demoUser.email);
    return demoUser;
    
  } catch (error) {
    console.error('❌ Error checking/creating demo user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkAndCreateDemoUser()
  .then(() => {
    console.log('🎉 Demo user check complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to check/create demo user:', error);
    process.exit(1);
  }); 