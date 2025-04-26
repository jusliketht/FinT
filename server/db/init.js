const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Create Prisma client instance
const prisma = new PrismaClient();

// Function to initialize the database
async function initializeDatabase() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL database');

    // You can add any additional initialization here
    // For example, creating default roles, admin user, etc.

    return prisma;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Export the prisma client and initialization function
module.exports = {
  prisma,
  initializeDatabase
}; 