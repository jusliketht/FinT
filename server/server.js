const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import database
const db = require('./db/init');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const accountingRoutes = require('./routes/accountingRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // HTTP request logger
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: false
}));

// API Routes - Make sure these come before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounting', accountingRoutes);

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In development, let Create React App handle routing
if (process.env.NODE_ENV === 'development') {
  console.log('Running in development mode - API only');
} else {
  // Serve static files from the React frontend app in production
  const buildPath = path.resolve(__dirname, '../client/build');
  console.log('Static files directory:', buildPath);
  app.use(express.static(buildPath));

  // Serve React App for any other routes in production
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;
db.initializeDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running at http://localhost:${PORT}`);
      if (process.env.NODE_ENV === 'development') {
        console.log('API server running - use Create React App dev server for frontend');
      } else {
        console.log('Production mode - serving static files');
      }
      console.log(`Health check endpoint: http://localhost:${PORT}/api/health`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
    });
  })
  .catch(error => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }); 