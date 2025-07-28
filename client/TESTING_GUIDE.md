# FinT Application Testing Guide

## Overview

This guide provides comprehensive information about testing the FinT financial management application. The application uses React Testing Library and Jest for unit and integration testing.

## Test Structure

### Test Files Location
```
client/src/__tests__/
├── Dashboard.test.jsx          # Dashboard component tests
├── Accounts.test.jsx           # Account management tests
├── Reports.test.jsx            # Financial reports tests
├── Login.test.jsx              # Authentication tests
├── BankReconciliation.test.jsx # Bank reconciliation tests
├── Invoices.test.jsx           # Invoice management tests
├── Transactions.test.jsx       # Transaction management tests
└── mocks/                      # Mock data and utilities
    └── apiMocks.js
```

### Test Categories

1. **Component Tests**: Test individual React components
2. **Integration Tests**: Test component interactions
3. **Service Tests**: Test API service calls
4. **Context Tests**: Test React context providers
5. **Utility Tests**: Test helper functions

## Running Tests

### Quick Commands

```bash
# Run all tests
npm run test:all

# Run specific test suite
npm test -- --testPathPattern=Dashboard.test.jsx --watchAll=false

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Execution Script

Use the custom test runner for comprehensive testing:

```bash
# Run all test suites with detailed reporting
npm run test:suite
```

This will:
- Run all test suites sequentially
- Generate a detailed report
- Save results to `test-report.json`
- Display colored output with pass/fail status

## Test Status Summary

### ✅ Passing Test Suites

| Test Suite | Status | Tests | Coverage |
|------------|--------|-------|----------|
| Dashboard | ✅ All Passing | 23/23 | Rendering, Data Loading, Quick Actions, Service Mocks |
| Accounts | ✅ All Passing | 9/9 | AccountForm, Responsive Design, Accessibility |
| Reports | ✅ All Passing | 18/18 | Balance Sheet, Income Statement, Cash Flow |

### ⚠️ Partially Passing Test Suites

| Test Suite | Status | Tests | Issues |
|------------|--------|-------|--------|
| Login | ⚠️ 17/22 Passing | 17/22 | localStorage, Development Mode Auto-fill |

### ❌ Failing Test Suites

| Test Suite | Status | Tests | Issues |
|------------|--------|-------|--------|
| BankReconciliation | ❌ 0/23 Passing | 0/23 | Missing ToastProvider |

### 🔄 Not Yet Tested

| Test Suite | Status | Notes |
|------------|--------|-------|
| Invoices | 🔄 Not Run | Needs test execution |
| Transactions | 🔄 Not Run | Needs test execution |

## Test Infrastructure

### Mock Setup

The application uses comprehensive mocking for:

```javascript
// Service Mocks
jest.mock('../services/analyticsService');
jest.mock('../services/accountService');
jest.mock('../services/journalEntryService');

// Context Mocks
jest.mock('../contexts/AuthContext');
jest.mock('../contexts/BusinessContext');
jest.mock('../contexts/ToastContext');

// API Mocks
jest.mock('../services/api');
```

### Test Utilities

```javascript
// Custom render function with providers
const renderWithProviders = (component) => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <ToastProvider>
              {component}
            </ToastProvider>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

// Mock data factories
const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
});

const createMockBusiness = (overrides = {}) => ({
  id: 'test-business-id',
  name: 'Test Business',
  type: 'Sole Proprietorship',
  ...overrides
});
```

## Writing Tests

### Test Structure

```javascript
describe('Component Name', () => {
  beforeEach(() => {
    // Setup mocks and test data
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('renders component correctly', () => {
      renderWithProviders(<Component />);
      expect(screen.getByRole('heading')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles user input correctly', async () => {
      renderWithProviders(<Component />);
      const input = screen.getByLabelText(/email/i);
      await userEvent.type(input, 'test@example.com');
      expect(input.value).toBe('test@example.com');
    });
  });

  describe('API Integration', () => {
    test('calls API service correctly', async () => {
      const mockService = jest.fn().mockResolvedValue({ data: [] });
      renderWithProviders(<Component />);
      
      await waitFor(() => {
        expect(mockService).toHaveBeenCalled();
      });
    });
  });
});
```

### Best Practices

1. **Test User Behavior**: Focus on what users see and do
2. **Use Semantic Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock External Dependencies**: Mock API calls and external services
4. **Test Error States**: Ensure graceful error handling
5. **Test Accessibility**: Verify keyboard navigation and ARIA labels
6. **Test Responsive Design**: Verify mobile adaptations

### Common Patterns

```javascript
// Testing async operations
test('loads data on mount', async () => {
  renderWithProviders(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });
});

// Testing form submissions
test('submits form with correct data', async () => {
  const mockSubmit = jest.fn();
  renderWithProviders(<Component onSubmit={mockSubmit} />);
  
  await userEvent.type(screen.getByLabelText(/name/i), 'Test Name');
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(mockSubmit).toHaveBeenCalledWith({ name: 'Test Name' });
});

// Testing error states
test('displays error message on API failure', async () => {
  const mockService = jest.fn().mockRejectedValue(new Error('API Error'));
  renderWithProviders(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Known Issues and Fixes

### 1. Login localStorage Tests

**Issue**: localStorage mock not working correctly
**Fix**: Update localStorage mock implementation

```javascript
// In test setup
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});
```

### 2. BankReconciliation ToastProvider

**Issue**: Missing ToastProvider in test setup
**Fix**: Add ToastProvider to render function

```javascript
const renderBankReconciliation = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <ToastProvider>
              <BankReconciliation />
            </ToastProvider>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};
```

### 3. React Act Warnings

**Issue**: State updates not wrapped in act()
**Fix**: Use waitFor for async state updates

```javascript
test('updates state correctly', async () => {
  renderWithProviders(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Updated State')).toBeInTheDocument();
  });
});
```

## Continuous Integration

### GitHub Actions Example

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
      - run: npm run test:all
      - run: npm run test:coverage
```

## Performance Testing

### Bundle Size Testing

```bash
# Analyze bundle size
npm run build:analyze

# Check bundle stats
npm run analyze
```

### Memory Leak Testing

```javascript
test('does not cause memory leaks', () => {
  const { unmount } = renderWithProviders(<Component />);
  
  // Perform operations
  unmount();
  
  // Verify cleanup
  expect(global.gc).toBeDefined();
});
```

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout for slow tests
2. **Mock Not Working**: Ensure mocks are set up before component renders
3. **Async Issues**: Use waitFor for async operations
4. **Provider Errors**: Ensure all required providers are included

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run single test file
npm test -- --testPathPattern=ComponentName.test.jsx

# Run tests with coverage
npm run test:coverage

# Debug specific test
npm test -- --testNamePattern="test name"
```

## Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Accessibility Testing](https://testing-library.com/docs/guides/accessibility-testing)

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Mock external dependencies
4. Test both success and error cases
5. Update this documentation
6. Ensure tests pass before submitting PR 