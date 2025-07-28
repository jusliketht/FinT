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
      console.log('📧 Email: demo@fint.com');
      console.log('🔑 Password: demo123');
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
        contactNumber: '+1234567890',
        address: '123 Demo Street, Demo City, DC 12345'
      }
    });

    console.log('✅ Demo user created successfully:', demoUser.email);
    console.log('📧 Email: demo@fint.com');
    console.log('🔑 Password: demo123');
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