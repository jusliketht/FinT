const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const helmet = require('helmet');
require('dotenv').config();

// Import database client
const prisma = require('./db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(compression()); // Add compression for all responses
app.use(helmet()); // Add security headers

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Test database connection
async function testConnection() {
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('PostgreSQL database connected');
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
  }
}

// Run connection test
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Clean up Prisma connection on exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = app; 