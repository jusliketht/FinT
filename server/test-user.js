const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testUser() {
  try {
    console.log('🔍 Testing user authentication...');
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password,
      passwordLength: user.password ? user.password.length : 0
    });

    // Test password verification
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('🔐 Password test:', {
      testPassword,
      isPasswordValid,
      passwordHash: user.password.substring(0, 20) + '...'
    });

    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
    } else {
      console.log('❌ Password verification failed!');
      
      // Try to create a new hash and compare
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('🔄 New hash for comparison:', newHash.substring(0, 20) + '...');
      
      const newHashValid = await bcrypt.compare(testPassword, newHash);
      console.log('🔄 New hash test:', newHashValid);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUser(); 