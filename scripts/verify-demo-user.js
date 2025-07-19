const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDemoUser() {
  try {
    console.log('🔍 Verifying demo user...');
    
    // Check if demo user exists
    const user = await prisma.user.findUnique({
      where: { email: 'demo@fint.com' }
    });

    if (user) {
      console.log('✅ Demo user found:');
      console.log('  ID:', user.id);
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Has Password:', !!user.password);
      console.log('  Created At:', user.createdAt);
      console.log('  Updated At:', user.updatedAt);
    } else {
      console.log('❌ Demo user not found!');
    }

    // List all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\n📋 All users in database:');
    allUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error verifying demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDemoUser(); 