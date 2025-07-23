# FinT Application Testing Guide

This document provides comprehensive guidance for testing the FinT financial management application, covering both frontend and backend testing strategies, best practices, and implementation details.

## Table of Contents

1. [Overview](#overview)
2. [Testing Strategy](#testing-strategy)
3. [Test Types](#test-types)
4. [Setup and Configuration](#setup-and-configuration)
5. [Running Tests](#running-tests)
6. [Writing Tests](#writing-tests)
7. [Test Coverage](#test-coverage)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The FinT application uses a comprehensive testing strategy that includes:

- **Unit Tests**: Testing individual components and functions
- **Integration Tests**: Testing component interactions and API endpoints
- **End-to-End Tests**: Testing complete user workflows
- **Visual Regression Tests**: Ensuring UI consistency

### Testing Stack

- **Frontend**: Jest + React Testing Library + @testing-library/jest-dom
- **Backend**: Jest + Supertest + @nestjs/testing
- **E2E**: Playwright (planned)
- **Coverage**: Istanbul/nyc

## Testing Strategy

### Frontend Testing Strategy

1. **Component Testing**: Test React components in isolation
2. **Hook Testing**: Test custom React hooks
3. **Context Testing**: Test React context providers
4. **Service Testing**: Test API service functions
5. **Utility Testing**: Test helper functions

### Backend Testing Strategy

1. **Service Testing**: Test business logic in services
2. **Controller Testing**: Test API endpoints
3. **Middleware Testing**: Test authentication and validation
4. **Database Testing**: Test Prisma operations
5. **Integration Testing**: Test complete API workflows

## Test Types

### 1. Unit Tests

Unit tests focus on testing individual functions, components, or classes in isolation.

**Frontend Example:**
```javascript
// Login.test.jsx
describe('Login Component', () => {
  test('renders login form', () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
```

**Backend Example:**
```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  test('should validate user credentials', async () => {
    const result = await service.validateUser('test@example.com', 'password');
    expect(result).toBeTruthy();
  });
});
```

### 2. Integration Tests

Integration tests verify that multiple components work together correctly.

**Frontend Example:**
```javascript
// Dashboard.test.jsx
describe('Dashboard Integration', () => {
  test('loads and displays dashboard data', async () => {
    render(<Dashboard />);
    await waitFor(() => {
      expect(screen.getByText(/total income/i)).toBeInTheDocument();
    });
  });
});
```

**Backend Example:**
```typescript
// transactions.controller.spec.ts
describe('TransactionsController', () => {
  test('should create transaction and update account balance', async () => {
    const response = await request(app.getHttpServer())
      .post('/transactions')
      .send(transactionData);
    expect(response.status).toBe(201);
  });
});
```

### 3. End-to-End Tests

E2E tests simulate real user interactions with the application.

```javascript
// login.e2e.test.js
describe('User Authentication', () => {
  test('user can login and access dashboard', async () => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'demo@fint.com');
    await page.fill('[data-testid="password"]', 'demo123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

## Setup and Configuration

### Prerequisites

1. **Node.js**: Version 18 or higher
2. **npm**: Version 8 or higher
3. **Database**: SQLite for testing (configured automatically)

### Installation

```bash
# Install dependencies
npm install

# Install testing dependencies (if not already installed)
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Configuration Files

1. **jest.config.js**: Main Jest configuration
2. **jest.setup.js**: Global test setup
3. **.env.test**: Test environment variables

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:client

# Run backend tests only
npm run test:server

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Advanced Test Runner

```bash
# Run all tests sequentially
node scripts/run-tests.js

# Run tests in parallel
node scripts/run-tests.js --parallel

# Run tests in watch mode
node scripts/run-tests.js --watch

# Run with E2E tests
node scripts/run-tests.js --e2e

# Generate coverage report
node scripts/run-tests.js --coverage
```

### Test Scripts

```json
{
  "scripts": {
    "test": "npm run test:client && npm run test:server",
    "test:client": "cd client && npm test",
    "test:server": "cd server && npm test",
    "test:watch": "npm run test:watch:client & npm run test:watch:server",
    "test:coverage": "npm run test:coverage:client && npm run test:coverage:server",
    "test:e2e": "playwright test"
  }
}
```

## Writing Tests

### Frontend Testing Guidelines

#### 1. Component Testing

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

// Test component rendering
describe('Login Component', () => {
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    const mockLogin = jest.fn();
    render(
      <BrowserRouter>
        <Login onLogin={mockLogin} />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

#### 2. Hook Testing

```javascript
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

describe('useAuth Hook', () => {
  test('manages authentication state', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);

    act(() => {
      result.current.login('test@example.com', 'password');
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

#### 3. Context Testing

```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const TestComponent = () => {
  const { user } = useAuth();
  return <div>User: {user?.name}</div>;
};

describe('AuthContext', () => {
  test('provides user context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText(/user: test user/i)).toBeInTheDocument();
  });
});
```

### Backend Testing Guidelines

#### 1. Service Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: {
            transaction: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  test('should create transaction', async () => {
    const transactionData = {
      description: 'Test Transaction',
      amount: 1000,
      type: 'income',
    };

    const mockTransaction = { id: '1', ...transactionData };
    jest.spyOn(prismaService.transaction, 'create').mockResolvedValue(mockTransaction);

    const result = await service.create(transactionData);

    expect(result).toEqual(mockTransaction);
    expect(prismaService.transaction.create).toHaveBeenCalledWith({
      data: transactionData,
    });
  });
});
```

#### 2. Controller Testing

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('TransactionsController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  test('/transactions (GET)', () => {
    return request(app.getHttpServer())
      .get('/transactions')
      .expect(200)
      .expect('Content-Type', /json/);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## Test Coverage

### Coverage Goals

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### Coverage Configuration

```javascript
// jest.config.js
collectCoverageFrom: [
  'client/src/**/*.{js,jsx,ts,tsx}',
  'server/src/**/*.{js,ts}',
  '!**/*.d.ts',
  '!**/node_modules/**',
  '!**/coverage/**',
],
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

## Best Practices

### 1. Test Organization

- Group related tests using `describe` blocks
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Mocking

- Mock external dependencies
- Use realistic mock data
- Avoid over-mocking

### 3. Test Data

- Use factories for creating test data
- Keep test data minimal and focused
- Use meaningful test data

### 4. Async Testing

- Always await async operations
- Use `waitFor` for UI updates
- Handle promises correctly

### 5. Error Testing

- Test error scenarios
- Verify error messages
- Test edge cases

### 6. Performance

- Keep tests fast
- Avoid unnecessary setup/teardown
- Use efficient selectors

## Troubleshooting

### Common Issues

#### 1. Test Environment Issues

```bash
# Clear Jest cache
npm run test -- --clearCache

# Reset node_modules
rm -rf node_modules package-lock.json
npm install
```

#### 2. Database Issues

```bash
# Reset test database
npm run db:reset:test

# Run migrations
npm run db:migrate:test
```

#### 3. Mock Issues

```javascript
// Clear all mocks
beforeEach(() => {
  jest.clearAllMocks();
});

// Reset specific mocks
jest.resetModules();
```

### Debugging Tests

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test file
npm test -- Login.test.jsx

# Run tests with verbose output
npm test -- --verbose
```

### Performance Optimization

1. **Parallel Testing**: Use `--parallel` flag for faster execution
2. **Test Isolation**: Ensure tests don't depend on each other
3. **Efficient Mocks**: Use lightweight mocks
4. **Selective Testing**: Run only relevant tests during development

## Continuous Integration

### GitHub Actions

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:coverage
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:staged",
      "pre-push": "npm run test"
    }
  }
}
```

## Conclusion

This testing guide provides a comprehensive framework for ensuring the quality and reliability of the FinT application. By following these guidelines and best practices, you can maintain high test coverage and confidence in your codebase.

For additional support or questions, refer to:
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing) 