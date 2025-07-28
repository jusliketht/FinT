// Test setup file for Jest
import 'reflect-metadata';

// Global test configuration
beforeAll(() => {
  // Setup any global test configuration
});

afterAll(() => {
  // Cleanup any global test resources
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
