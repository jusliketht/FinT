#!/usr/bin/env node

/**
 * Check User Script
 * 
 * This script checks if the test user exists in the database and verifies credentials.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Checking User in Database');
    console.log('============================\n');

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
    });

    if (!user) {
      console.log('❌ User not found in database');
      console.log('   Email: test@example.com');
      console.log('\n💡 Solution: Run the seed script to create the user');
      console.log('   Command: cd server && node scripts/seed-test-data.js');
      return;
    }

    console.log('✅ User found in database');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Has Password:', !!user.password);
    console.log('   Password Length:', user.password ? user.password.length : 0);
    console.log('   Created At:', user.createdAt);

    // Test password verification
    const testPassword = 'password123';
    const isPasswordValid = await bcrypt.compare(testPassword, user.password);
    
    console.log('\n🔐 Password Verification Test');
    console.log('   Test Password:', testPassword);
    console.log('   Password Valid:', isPasswordValid);
    
    if (isPasswordValid) {
      console.log('✅ Password verification successful!');
      console.log('\n🎉 User credentials are correct and ready for login');
    } else {
      console.log('❌ Password verification failed!');
      console.log('\n💡 Solution: Re-run the seed script to update the password');
      console.log('   Command: cd server && node scripts/seed-test-data.js');
    }

    // Check if there are other users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log('\n📊 All Users in Database');
    console.log('   Total Users:', allUsers.length);
    allUsers.forEach((u, index) => {
      console.log(`   ${index + 1}. ${u.email} (${u.name}) - Created: ${u.createdAt.toISOString().split('T')[0]}`);
    });

  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkUser(); 