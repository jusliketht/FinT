// Environment variables for Jest tests
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:5000';
process.env.REACT_APP_ENVIRONMENT = 'test';
process.env.REACT_APP_VERSION = '1.0.0';

// Mock environment variables that might be used in the application
process.env.REACT_APP_JWT_SECRET = 'test-jwt-secret';
process.env.REACT_APP_DATABASE_URL = 'test-database-url';
process.env.REACT_APP_REDIS_URL = 'test-redis-url';

// Disable console warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
     args[0].includes('Warning: componentWillReceiveProps') ||
     args[0].includes('Warning: componentWillUpdate'))
  ) {
    return;
  }
  originalWarn.call(console, ...args);
}; 