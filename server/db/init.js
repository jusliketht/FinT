const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

// Function to test database connection
async function initializeDatabase() {
  try {
    await prisma.$connect();
    console.log("Successfully connected to PostgreSQL database");
    return prisma;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Graceful shutdown function
const disconnect = async () => {
  try {
    await prisma.$disconnect();
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error during database disconnection:", error);
    process.exit(1);
  }
};

// Export the prisma client and initialization function
module.exports = {
  prisma,
  initializeDatabase,
  disconnect,
};
