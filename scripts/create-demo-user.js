const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('Creating demo user...');
    
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@fint.com' }
    });

    if (existingUser) {
      console.log('Demo user already exists!');
      console.log('Email: demo@fint.com');
      console.log('Password: demo123');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create demo user
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        name: 'Demo User',
        email: 'demo@fint.com',
        password: hashedPassword,
        role: 'ADMIN',
        updatedAt: new Date()
      }
    });

    console.log('✅ Demo user created successfully!');
    console.log('Email: demo@fint.com');
    console.log('Password: demo123');
    console.log('User ID:', user.id);

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser(); 