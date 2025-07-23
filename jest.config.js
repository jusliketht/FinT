module.exports = {
  // Test environment
  testEnvironment: 'jsdom',
  
  // Root directories
  roots: ['<rootDir>/client/src', '<rootDir>/server/src'],
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
  
  // File extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/client/src/$1',
    '^@server/(.*)$': '<rootDir>/server/src/$1',
    '^@components/(.*)$': '<rootDir>/client/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/client/src/pages/$1',
    '^@services/(.*)$': '<rootDir>/client/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/client/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/client/src/hooks/$1',
    '^@contexts/(.*)$': '<rootDir>/client/src/contexts/$1',
  },
  
  // Transform configurations
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        '@babel/preset-typescript',
      ],
      plugins: [
        ['@babel/plugin-transform-runtime', { regenerator: true }],
      ],
    }],
  },
  
  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/client/src/setupTests.js',
    '<rootDir>/jest.setup.js',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx,ts,tsx}',
    'server/src/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/*.config.js',
    '!**/setupTests.js',
    '!**/jest.setup.js',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks between tests
  restoreMocks: true,
  
  // Module path ignore patterns
  modulePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  
  // Test path ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
  ],
  
  // Environment variables for tests
  setupFiles: ['<rootDir>/jest.env.js'],
  
  // Global test configuration
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react-jsx',
      },
    },
  },
  
  // Projects for different test environments
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.(test|spec).(js|jsx|ts|tsx)'],
      setupFilesAfterEnv: ['<rootDir>/client/src/setupTests.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/client/src/$1',
        '^@components/(.*)$': '<rootDir>/client/src/components/$1',
        '^@pages/(.*)$': '<rootDir>/client/src/pages/$1',
        '^@services/(.*)$': '<rootDir>/client/src/services/$1',
        '^@utils/(.*)$': '<rootDir>/client/src/utils/$1',
        '^@hooks/(.*)$': '<rootDir>/client/src/hooks/$1',
        '^@contexts/(.*)$': '<rootDir>/client/src/contexts/$1',
      },
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/src/**/*.(test|spec).(js|ts)'],
      transform: {
        '^.+\\.(js|ts)$': ['ts-jest', {
          tsconfig: '<rootDir>/server/tsconfig.json',
        }],
      },
      moduleNameMapper: {
        '^@server/(.*)$': '<rootDir>/server/src/$1',
      },
    },
  ],
}; 