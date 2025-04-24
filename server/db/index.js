// Example using Prisma Client
// Install: npm install @prisma/client
// Generate client: npx prisma generate

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Optional: Add connection testing logic here

module.exports = prisma;

/*
// Example using node-postgres (pg) client directly
// Install: npm install pg
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config(); // Load .env variables

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Your Supabase connection string
  // ssl: { // Required for Supabase connections
  //   rejectUnauthorized: false // Adjust based on your environment/needs
  // }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export pool if needed for transactions etc.
};
*/
