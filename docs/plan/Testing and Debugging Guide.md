# FinT Application - Testing and Debugging Guide

## 1. Introduction

This guide provides comprehensive instructions for testing and debugging the FinT application, covering both backend (NestJS) and frontend (React) components. Effective testing and debugging are crucial for ensuring the application's reliability, functionality, and performance.

## 2. General Testing Principles

*   **Test Early, Test Often**: Integrate testing into every stage of development.
*   **Automated Testing**: Prioritize automated tests (unit, integration, E2E) to ensure consistent quality.
*   **Clear Test Cases**: Write tests that are clear, concise, and cover specific scenarios.
*   **Isolation**: Test components in isolation where possible to pinpoint issues easily.
*   **Reproducibility**: Ensure tests are reproducible and yield consistent results.
*   **Code Coverage**: Aim for high code coverage, especially for critical business logic.

## 3. Backend Testing (NestJS)

The backend uses Jest for unit and integration testing, and Supertest for end-to-end (E2E) testing.

### 3.1. Unit Testing

Unit tests focus on individual functions, methods, or classes in isolation.

**Location**: `fint-backend/src/**/*.spec.ts`

**How to Run**: 
```bash
cd fint-backend
npm test
# To run tests in watch mode
npm test -- --watch
# To run tests with coverage report
npm test -- --coverage
```

**Example Test Structure (src/auth/auth.service.spec.ts)**:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@/database/prisma.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs'); // Mock bcrypt for unit tests

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  // Mock Prisma and other dependencies
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        isEmailVerified: false,
        createdAt: new Date(),
      });

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.register(registerDto);

      expect(result.user.email).toBe(registerDto.email);
      expect(result.message).toBe('Registration successful. Please verify your email.');
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 12);
    });

    it('should throw ConflictException if user already exists', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockPrismaService.user.findUnique.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  // Add more tests for login, forgotPassword, resetPassword, etc.
});
```

**Key Considerations for Unit Tests**: 
- Mock all external dependencies (e.g., PrismaService, JwtService, ConfigService) to ensure true isolation.
- Test edge cases, error conditions, and valid scenarios.
- Use `jest.fn()` to create mock functions and `toHaveBeenCalledWith()` to verify interactions.

### 3.2. Integration Testing

Integration tests verify the interaction between multiple units (e.g., a controller and a service, or a service and the database).

**Location**: Typically within `src/**/*.spec.ts` or a dedicated `test/integration` folder.

**How to Run**: Same as unit tests (`npm test`).

**Example Test Structure (src/users/users.service.spec.ts - showing integration with Prisma)**:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '@/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService (Integration)', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clean up database before each test
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should create and retrieve a user profile', async () => {
    const newUser = await prisma.user.create({
      data: {
        email: 'integration@example.com',
        password: 'hashedPassword',
        firstName: 'Integration',
        lastName: 'Test',
      },
    });

    const profile = await service.getProfile(newUser.id);
    expect(profile.email).toBe('integration@example.com');
    expect(profile.firstName).toBe('Integration');
  });

  it('should update a user profile', async () => {
    const newUser = await prisma.user.create({
      data: {
        email: 'update@example.com',
        password: 'hashedPassword',
        firstName: 'Old',
        lastName: 'Name',
      },
    });

    const updatedProfile = await service.updateProfile(newUser.id, {
      firstName: 'New',
      lastName: 'Name',
    });

    expect(updatedProfile.user.firstName).toBe('New');
    expect(updatedProfile.user.lastName).toBe('Name');
  });

  it('should throw NotFoundException if user not found during update', async () => {
    await expect(service.updateProfile('non-existent-id', { firstName: 'Test' })).rejects.toThrow(NotFoundException);
  });
});
```

**Key Considerations for Integration Tests**: 
- Use a dedicated test database or clear the database before each test to ensure a clean state.
- Test the interaction between components, not just individual methods.
- Verify data persistence and retrieval.

### 3.3. End-to-End (E2E) Testing

E2E tests simulate real user scenarios by making actual HTTP requests to the running application. Supertest is used for this purpose.

**Location**: `fint-backend/test/**/*.e2e-spec.ts`

**How to Run**: 
```bash
cd fint-backend
npm run test:e2e
```

**Example Test Structure (test/auth.e2e-spec.ts)**:
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await prismaService.user.deleteMany({}); // Clean up users before tests
  });

  afterAll(async () => {
    await prismaService.user.deleteMany({}); // Clean up after tests
    await app.close();
  });

  it('/auth/register (POST) - should register a user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'e2e@example.com',
        password: 'Password123!',
        firstName: 'E2E',
        lastName: 'Test',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe('e2e@example.com');
      });
  });

  it('/auth/login (POST) - should login a user', async () => {
    // First, ensure user is registered
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'login_e2e@example.com',
        password: 'Password123!',
        firstName: 'Login',
        lastName: 'Test',
      });

    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'login_e2e@example.com',
        password: 'Password123!',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.accessToken).toBeDefined();
      });
  });

  // Add more E2E tests for other endpoints
});
```

**Key Considerations for E2E Tests**: 
- Run tests against a running instance of the application (e.g., using `npm run start:dev` or Docker Compose).
- Clean up the database before and after tests to prevent test pollution.
- Test complete user flows and API interactions.

## 4. Frontend Testing (React)

The frontend uses Jest and React Testing Library for unit and integration testing.

**Location**: `fint-frontend/src/**/*.test.tsx`

**How to Run**: 
```bash
cd fint-frontend
npm test
# To run tests in watch mode
npm test -- --watch
# To run tests with coverage report
npm test -- --coverage
```

### 4.1. Unit Testing (Components)

Unit tests for React components focus on rendering, props, and basic user interactions.

**Example Test Structure (src/components/common/__tests__/Button.test.tsx)**:
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Button } from '../Button';

// Helper to wrap component with ChakraProvider
const renderWithChakra = (component: React.ReactElement) => {
  return render(<ChakraProvider>{component}</ChakraProvider>);
};

describe('Button Component', () => {
  it('renders button with text', () => {
    renderWithChakra(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('applies primary variant by default', () => {
    renderWithChakra(<Button>Primary Button</Button>);
    const button = screen.getByRole('button');
    // You might need to inspect Chakra UI's internal class names or styles
    // For simplicity, we'll just check if it's a button
    expect(button).toBeInTheDocument(); 
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    renderWithChakra(<Button onClick={handleClick}>Clickable</Button>);
    screen.getByRole('button', { name: /clickable/i }).click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Key Considerations for Frontend Unit Tests**: 
- Use `render` from `@testing-library/react` to render components.
- Use `screen` queries (e.g., `getByRole`, `getByText`) to find elements in the rendered output.
- Simulate user interactions with `@testing-library/user-event`.
- Mock Redux store, API calls, and other external dependencies for isolated testing.

### 4.2. Integration Testing (Redux Slices, API Services)

Integration tests for the frontend verify the interaction between components and the Redux store, or between the application and API services.

**Example Test Structure (src/store/slices/authSlice.test.ts)**:
```typescript
import authReducer, { setCredentials, logout, AuthState } from '../slices/authSlice';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const user = { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' };
    const token = 'fake-jwt-token';
    const actual = authReducer(initialState, setCredentials({ user, token }));
    expect(actual.user).toEqual(user);
    expect(actual.token).toEqual(token);
    expect(actual.isAuthenticated).toBe(true);
  });

  it('should handle logout', () => {
    const stateWithUser: AuthState = {
      user: { id: '1', email: 'test@example.com', firstName: 'Test', lastName: 'User' },
      token: 'fake-jwt-token',
      isAuthenticated: true,
      isLoading: false,
    };
    const actual = authReducer(stateWithUser, logout());
    expect(actual.user).toBeNull();
    expect(actual.token).toBeNull();
    expect(actual.isAuthenticated).toBe(false);
  });
});
```

**Key Considerations for Frontend Integration Tests**: 
- Test Redux reducers and actions directly.
- For API service tests, mock the `fetch` API or use MSW (Mock Service Worker) to intercept network requests.

### 4.3. End-to-End (E2E) Testing (Cypress/Playwright - Recommended)

While React Testing Library is great for component and integration tests, for full E2E testing that simulates user flows across multiple pages and interacts with the actual backend, tools like Cypress or Playwright are recommended.

**Setup (Cypress Example)**:
```bash
cd fint-frontend
npm install -D cypress
npx cypress open # To open Cypress Test Runner
```

**Example Cypress Test (cypress/e2e/auth.cy.ts)**:
```typescript
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login'); // Assuming your login page is at /login
  });

  it('should allow a user to register and then login', () => {
    // Register
    cy.get('a[href*="/register"]').click(); // Click register link
    cy.url().should('include', '/register');
    cy.get('input[name="firstName"]').type('Cypress');
    cy.get('input[name="lastName"]').type('Test');
    cy.get('input[name="email"]').type('cypress@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.contains('Registration successful').should('be.visible');
    cy.url().should('include', '/login'); // Redirect to login after registration

    // Login
    cy.get('input[name="email"]').type('cypress@example.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/dashboard'); // Assert redirection to dashboard
    cy.contains('Welcome, Cypress').should('be.visible');
  });

  it('should show error for invalid login credentials', () => {
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    cy.contains('Invalid credentials').should('be.visible');
    cy.url().should('include', '/login');
  });
});
```

**Key Considerations for E2E Tests**: 
- Run the backend and frontend applications before running E2E tests.
- Use `cy.visit()` to navigate to pages.
- Use `cy.get()` to select elements and `type()`, `click()` to simulate interactions.
- Use `should()` to assert on element visibility, text content, URL, etc.
- Clean up test data after each test run if possible.

## 5. Debugging Techniques

### 5.1. Backend Debugging (NestJS)

#### 5.1.1. Console Logging

Use `console.log()`, `console.error()`, `console.warn()` to output variable values, execution flow, and error messages.

#### 5.1.2. NestJS Logger

NestJS provides a built-in logger. You can inject `Logger` into your services and controllers:
```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  doSomething() {
    this.logger.log('Doing something...');
    this.logger.error('Something went wrong!', 'MyServiceErrorContext');
  }
}
```

#### 5.1.3. VS Code Debugger

NestJS applications can be debugged directly in VS Code.

1.  **Add `launch.json`**: Create a `.vscode/launch.json` file in your `fint-backend` directory:
    ```json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "type": "node",
          "request": "attach",
          "name": "Attach NestJS Backend",
          "port": 9229,
          "restart": true,
          "protocol": "inspector",
          "skipFiles": [
            "<node_internals>/**"
          ]
        },
        {
          "type": "node",
          "request": "launch",
          "name": "Launch NestJS Backend",
          "args": [
            "${workspaceFolder}/src/main.ts"
          ],
          "runtimeArgs": [
            "--nolazy",
            "-r",
            "ts-node/register",
            "-r",
            "tsconfig-paths/register"
          ],
          "sourceMaps": true,
          "cwd": "${workspaceFolder}",
          "protocol": "inspector",
          "console": "integratedTerminal",
          "internalConsoleOptions": "neverOpen",
          "skipFiles": [
            "<node_internals>/**"
          ]
        }
      ]
    }
    ```
2.  **Start in Debug Mode**: Run your NestJS application with `npm run start:debug`.
3.  **Attach Debugger**: In VS Code, go to the Run and Debug view (Ctrl+Shift+D), select 






    "Attach NestJS Backend" configuration, and click the green play button.
4.  **Set Breakpoints**: Click in the gutter next to a line of code to set a breakpoint. When the code hits the breakpoint, execution will pause, and you can inspect variables, step through code, etc.

#### 5.1.4. Postman/Insomnia

Use API clients like Postman or Insomnia to send requests to your backend endpoints and inspect responses. This helps in verifying API functionality and debugging network-related issues.

### 5.2. Frontend Debugging (React)

#### 5.2.1. Console Logging

Similar to the backend, use `console.log()`, `console.error()`, etc., in your React components and functions to inspect values and execution flow.

#### 5.2.2. Browser Developer Tools

Modern web browsers (Chrome, Firefox, Edge) come with powerful developer tools:

*   **Elements Tab**: Inspect and modify the DOM and CSS in real-time.
*   **Console Tab**: View console logs, errors, and execute JavaScript.
*   **Sources Tab**: Set breakpoints in your JavaScript code, step through execution, and inspect variables. You can find your original `.tsx` files here if source maps are correctly configured.
*   **Network Tab**: Monitor network requests and responses, check status codes, and inspect payload.
*   **Components/Profiler Tab (React DevTools)**: Install the React Developer Tools browser extension to inspect your React component tree, props, state, and performance.

#### 5.2.3. VS Code Debugger (for React)

For debugging React applications in VS Code, you typically use the `Debugger for Chrome` or `Debugger for Edge` extension.

1.  **Install Extension**: Install the appropriate debugger extension from the VS Code Marketplace.
2.  **Add `launch.json`**: Create a `.vscode/launch.json` file in your `fint-frontend` directory:
    ```json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "name": "Launch Chrome against localhost",
          "type": "chrome",
          "request": "launch",
          "url": "http://localhost:3000", // Or whatever port your React app runs on
          "webRoot": "${workspaceFolder}/src",
          "sourceMapPathOverrides": {
            "webpack:///src/*": "${webRoot}/*"
          }
        }
      ]
    }
    ```
3.  **Start React App**: Run your React application with `npm start`.
4.  **Launch Debugger**: In VS Code, go to the Run and Debug view, select "Launch Chrome against localhost", and click the green play button. A new Chrome window will open, and the debugger will attach.
5.  **Set Breakpoints**: Set breakpoints in your `.tsx` files in VS Code. When the code executes, it will pause at the breakpoint.

#### 5.2.4. Redux DevTools

Install the Redux DevTools browser extension. This allows you to:

*   Inspect every state change.
*   Revert to previous states.
*   Dispatch actions manually.
*   Monitor performance.

## 6. Common Issues and Troubleshooting

### 6.1. Backend Issues

*   **Database Connection Errors**: 
    *   Check `DATABASE_URL` in `.env` file.
    *   Ensure PostgreSQL container is running and accessible (check `docker-compose ps`).
    *   Verify database credentials (username, password, host, port, database name).
    *   Run `npx prisma migrate dev` to ensure migrations are applied.
*   **JWT Authentication Errors (401 Unauthorized)**:
    *   Ensure `Authorization: Bearer <token>` header is present and correctly formatted.
    *   Check if the JWT token is expired or invalid.
    *   Verify `JWT_SECRET` in `.env` matches the one used for token generation.
    *   Ensure `JwtAuthGuard` is applied to protected routes.
*   **Validation Errors (400 Bad Request)**:
    *   Check request body against DTOs (`class-validator`).
    *   Ensure all required fields are present and data types match.
*   **Prisma Errors (e.g., unique constraint failed)**:
    *   Review Prisma schema (`schema.prisma`) for unique constraints.
    *   Check if you are trying to create a record with a value that already exists in a unique field.
*   **Module Not Found Errors**: 
    *   Check `tsconfig.json` `paths` configuration.
    *   Ensure all modules are correctly imported and exported.
    *   Run `npm install` to ensure all dependencies are installed.

### 6.2. Frontend Issues

*   **API Call Failures (Network Tab)**:
    *   Check the Network tab in browser dev tools for failed requests (red status).
    *   Verify API endpoint URLs in `src/store/api/apiSlice.ts` and service files.
    *   Ensure backend is running and accessible.
    *   Check for CORS errors (Cross-Origin Resource Sharing) in the browser console. If present, ensure your backend allows requests from your frontend's origin.
*   **Component Rendering Issues**: 
    *   Check browser console for React errors or warnings.
    *   Use React DevTools to inspect component state and props.
    *   Verify data received from API matches component expectations.
*   **State Management Issues (Redux)**:
    *   Use Redux DevTools to inspect the Redux store state and action history.
    *   Verify actions are dispatched correctly and reducers update the state as expected.
*   **Styling Issues (Chakra UI/Tailwind CSS)**:
    *   Use the Elements tab in browser dev tools to inspect applied CSS styles.
    *   Check for conflicting styles or incorrect class names.
    *   Ensure Tailwind CSS is correctly configured and processed (`tailwind.config.js`, `index.css`).

## 7. Performance Monitoring

*   **Backend**: Use tools like Prometheus and Grafana (as configured in `docker-compose.monitoring.yml`) to monitor API response times, CPU/memory usage, and database query performance.
*   **Frontend**: Use browser performance tools (Lighthouse, Performance tab in Chrome DevTools) to analyze rendering performance, load times, and identify bottlenecks.

## 8. Logging

*   **Backend**: Ensure NestJS logging is configured to output to files or a centralized logging system (e.g., ELK stack as in `docker-compose.monitoring.yml`). Regularly review logs for errors and warnings.
*   **Frontend**: Implement client-side error logging (e.g., using a service like Sentry or simply sending errors to the backend) to capture and analyze issues occurring in the user's browser.

This guide provides a solid foundation for testing and debugging the FinT application. By following these practices, you can ensure the application remains robust, performant, and free of critical issues.

