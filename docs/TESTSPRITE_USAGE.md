# TestSprite Usage Guide for FinT Application

This guide explains how to use TestSprite for comprehensive testing of the FinT financial management application, including visual regression testing, performance testing, and end-to-end testing.

## Table of Contents

1. [Installation and Setup](#installation-and-setup)
2. [Basic Usage](#basic-usage)
3. [Test Suites](#test-suites)
4. [Visual Regression Testing](#visual-regression-testing)
5. [Performance Testing](#performance-testing)
6. [Advanced Features](#advanced-features)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting](#troubleshooting)

## Installation and Setup

### 1. Install TestSprite Dependencies

```bash
# Install TestSprite packages
npm install --save-dev @testsprite/testsprite-mcp @testsprite/core @testsprite/playwright @testsprite/visual @testsprite/performance
```

### 2. Configuration

The TestSprite configuration is already set up in `testsprite.config.js`. This file defines:

- Test environments (development, staging, production)
- Test suites organization
- Visual regression settings
- Performance testing thresholds
- Browser configurations

### 3. Environment Setup

```bash
# Set up test environment
npm run test:sprite:setup

# Verify installation
npm run test:sprite:verify
```

## Basic Usage

### Running Tests

```bash
# Run all TestSprite tests
npm run test:sprite

# Run specific test suite
npm run test:sprite --suite=auth
npm run test:sprite --suite=dashboard
npm run test:sprite --suite=transactions

# Run tests in parallel
npm run test:sprite --parallel

# Run tests with UI mode
npm run test:sprite:ui
```

### Test Commands

```bash
# Record baseline images for visual regression
npm run test:sprite:record

# Compare current state with baseline
npm run test:sprite:compare

# Generate test reports
npm run test:sprite:report

# Run performance tests only
npm run test:sprite --performance-only

# Run visual tests only
npm run test:sprite --visual-only
```

## Test Suites

### 1. Authentication Suite (`auth`)

Tests user authentication and authorization flows.

```bash
npm run test:sprite --suite=auth
```

**Features:**
- Login functionality
- Registration process
- Password reset
- Session management
- Visual regression for auth pages
- Performance testing for auth flows

### 2. Dashboard Suite (`dashboard`)

Tests main dashboard functionality and data display.

```bash
npm run test:sprite --suite=dashboard
```

**Features:**
- Dashboard overview
- Financial metrics display
- Recent transactions
- Account balances
- Quick actions
- Responsive design testing

### 3. Transaction Management Suite (`transactions`)

Tests transaction CRUD operations and management.

```bash
npm run test:sprite --suite=transactions
```

**Features:**
- Create transactions
- List and filter transactions
- Edit transactions
- Delete transactions
- Transaction validation
- Account balance updates

### 4. Account Management Suite (`accounts`)

Tests account management functionality.

```bash
npm run test:sprite --suite=accounts
```

**Features:**
- Chart of accounts
- Account balances
- Account types
- Account creation and editing

### 5. Bank Reconciliation Suite (`reconciliation`)

Tests bank statement reconciliation features.

```bash
npm run test:sprite --suite=reconciliation
```

**Features:**
- Statement upload
- Transaction matching
- Reconciliation reports
- PDF processing

### 6. Billing Suite (`billing`)

Tests invoice and bill management.

```bash
npm run test:sprite --suite=billing
```

**Features:**
- Invoice creation
- Bill management
- Payment tracking
- Document generation

### 7. Reports Suite (`reports`)

Tests financial reporting functionality.

```bash
npm run test:sprite --suite=reports
```

**Features:**
- Balance sheet
- Income statement
- Cash flow statement
- Report export

### 8. API Suite (`api`)

Tests backend API endpoints.

```bash
npm run test:sprite --suite=api
```

**Features:**
- Authentication endpoints
- Transaction endpoints
- Account endpoints
- Report endpoints

### 9. Performance Suite (`performance`)

Tests application performance and load handling.

```bash
npm run test:sprite --suite=performance
```

**Features:**
- Load testing
- Stress testing
- Memory usage testing
- Performance benchmarks

## Visual Regression Testing

### Recording Baselines

```bash
# Record baseline images for all test suites
npm run test:sprite:record

# Record baselines for specific suite
npm run test:sprite:record --suite=dashboard

# Record baselines for specific test
npm run test:sprite:record --test="dashboard-overview"
```

### Comparing Visual Changes

```bash
# Compare current state with baseline
npm run test:sprite:compare

# Compare specific suite
npm run test:sprite:compare --suite=auth

# Generate visual diff report
npm run test:sprite:compare --report
```

### Visual Test Configuration

The visual testing is configured in `testsprite.config.js`:

```javascript
visual: {
  enabled: true,
  browser: 'chromium',
  viewport: { width: 1920, height: 1080 },
  devices: [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 },
  ],
  thresholds: {
    pixelDiff: 0.1, // 0.1% pixel difference threshold
    structuralSimilarity: 0.95, // 95% structural similarity
  },
}
```

### Writing Visual Tests

```javascript
// In your test file
const { visualTest } = require('@testsprite/core');

test('should display login form correctly', async ({ page }) => {
  await page.goto('/login');
  
  await visualTest(page, 'login-form', {
    description: 'Login form should render correctly',
    viewport: { width: 1920, height: 1080 },
  });
});
```

## Performance Testing

### Lighthouse Performance Testing

```bash
# Run Lighthouse performance tests
npm run test:sprite --lighthouse

# Run with specific categories
npm run test:sprite --lighthouse --categories=performance,accessibility
```

### Web Vitals Testing

```bash
# Test Core Web Vitals
npm run test:sprite --web-vitals

# Test specific metrics
npm run test:sprite --web-vitals --metrics=LCP,FID,CLS
```

### Load Testing

```bash
# Run load tests
npm run test:sprite --load-test

# Run with specific scenario
npm run test:sprite --load-test --scenario="dashboard-load"
```

### Performance Test Configuration

```javascript
performance: {
  lighthouse: {
    enabled: true,
    categories: ['performance', 'accessibility', 'best-practices', 'seo'],
    thresholds: {
      performance: 0.8,
      accessibility: 0.9,
      'best-practices': 0.8,
      seo: 0.8,
    },
  },
  webVitals: {
    enabled: true,
    metrics: ['LCP', 'FID', 'CLS', 'FCP', 'TTFB'],
    thresholds: {
      LCP: 2500, // 2.5 seconds
      FID: 100, // 100 milliseconds
      CLS: 0.1,
      FCP: 1800, // 1.8 seconds
      TTFB: 600, // 600 milliseconds
    },
  },
}
```

### Writing Performance Tests

```javascript
// In your test file
const { performanceTest } = require('@testsprite/core');

test('dashboard should load quickly', async ({ page }) => {
  await performanceTest(page, 'dashboard-load', {
    description: 'Dashboard should load within performance thresholds',
    metrics: ['LCP', 'FID', 'CLS'],
  });
  
  await page.goto('/dashboard');
});
```

## Advanced Features

### 1. Custom Test Data

TestSprite provides built-in test data management:

```javascript
// Use predefined test data
const testData = require('@testsprite/core').testData;

test('should create transaction', async ({ page }) => {
  const transaction = testData.transactions[0];
  // Use transaction data in test
});
```

### 2. Test Utilities

```javascript
// Custom test helpers
const { testUtils } = require('@testsprite/core');

test('should handle API errors', async ({ page }) => {
  // Mock API error
  await testUtils.mockApiError(page, '/api/transactions', 500);
  
  // Test error handling
  await page.goto('/transactions');
  await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
});
```

### 3. Parallel Testing

```bash
# Run tests in parallel
npm run test:sprite --parallel --workers=4

# Run specific suites in parallel
npm run test:sprite --parallel --suites=auth,dashboard,transactions
```

### 4. Test Reporting

```bash
# Generate comprehensive report
npm run test:sprite:report

# Generate report in specific format
npm run test:sprite:report --format=html
npm run test:sprite:report --format=json
npm run test:sprite:report --format=junit
```

## CI/CD Integration

### GitHub Actions

```yaml
name: TestSprite Tests
on: [push, pull_request]

jobs:
  testsprite:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:sprite
      - run: npm run test:sprite:report
      - uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: tests/reports/
```

### Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:sprite --staged",
      "pre-push": "npm run test:sprite"
    }
  }
}
```

### Slack Notifications

Configure Slack notifications in `testsprite.config.js`:

```javascript
reporting: {
  slackNotifications: {
    enabled: true,
    webhook: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    channel: '#fint-testing',
    onFailure: true,
    onSuccess: false,
  },
}
```

## Troubleshooting

### Common Issues

#### 1. Visual Test Failures

```bash
# Update baselines after intentional changes
npm run test:sprite:record

# Review visual differences
npm run test:sprite:compare --interactive

# Adjust thresholds if needed
# Edit testsprite.config.js visual.thresholds
```

#### 2. Performance Test Failures

```bash
# Check performance metrics
npm run test:sprite:report --performance

# Adjust performance thresholds
# Edit testsprite.config.js performance.thresholds
```

#### 3. Test Environment Issues

```bash
# Reset test environment
npm run test:sprite:reset

# Clear test cache
npm run test:sprite:clear-cache

# Verify environment setup
npm run test:sprite:verify
```

#### 4. Browser Issues

```bash
# Install browser dependencies
npx playwright install

# Update browsers
npx playwright install --with-deps
```

### Debug Mode

```bash
# Run tests in debug mode
npm run test:sprite --debug

# Run with verbose output
npm run test:sprite --verbose

# Run with browser visible
npm run test:sprite --headed
```

### Test Isolation

```bash
# Run tests in isolation
npm run test:sprite --isolate

# Clean test data between runs
npm run test:sprite --clean
```

## Best Practices

### 1. Test Organization

- Group related tests in suites
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Visual Testing

- Record baselines after UI changes
- Use meaningful test names for visual tests
- Test across different screen sizes
- Ignore dynamic content in visual comparisons

### 3. Performance Testing

- Set realistic performance thresholds
- Test on representative hardware
- Monitor performance trends over time
- Focus on user-critical paths

### 4. Test Data Management

- Use consistent test data
- Clean up test data after tests
- Use factories for test data creation
- Avoid hardcoded values

### 5. Reporting

- Generate reports after each test run
- Archive reports for historical analysis
- Set up automated reporting
- Monitor test trends over time

## Conclusion

TestSprite provides a comprehensive testing solution for the FinT application, combining visual regression testing, performance testing, and end-to-end testing in a single framework. By following this guide, you can effectively use TestSprite to ensure the quality and reliability of your financial management application.

For additional support:
- [TestSprite Documentation](https://testsprite.dev/docs)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Visual Regression Testing Guide](https://testsprite.dev/docs/visual-testing)
- [Performance Testing Guide](https://testsprite.dev/docs/performance-testing) 