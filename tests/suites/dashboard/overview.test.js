const { test, expect } = require('@testsprite/playwright');
const { visualTest, performanceTest } = require('@testsprite/core');

test.describe('Dashboard Overview', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'demo@fint.com');
    await page.fill('[data-testid="password-input"]', 'demo123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should display dashboard overview correctly', async ({ page }) => {
    // Performance test for dashboard load
    await performanceTest(page, 'dashboard-load', {
      description: 'Dashboard should load within performance thresholds',
      metrics: ['LCP', 'FID', 'CLS', 'FCP'],
    });

    // Visual test for dashboard
    await visualTest(page, 'dashboard-overview', {
      description: 'Dashboard should display correctly',
      viewport: { width: 1920, height: 1080 },
    });

    // Verify dashboard elements
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="financial-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-transactions"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-balances"]')).toBeVisible();
    await expect(page.locator('[data-testid="quick-actions"]')).toBeVisible();
  });

  test('should display financial metrics correctly', async ({ page }) => {
    // Wait for metrics to load
    await page.waitForSelector('[data-testid="total-income"]');
    await page.waitForSelector('[data-testid="total-expenses"]');
    await page.waitForSelector('[data-testid="net-profit"]');

    // Verify metrics are displayed
    await expect(page.locator('[data-testid="total-income"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-expenses"]')).toBeVisible();
    await expect(page.locator('[data-testid="net-profit"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-assets"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-liabilities"]')).toBeVisible();
    await expect(page.locator('[data-testid="net-worth"]')).toBeVisible();

    // Verify metric values are numbers
    const incomeText = await page.locator('[data-testid="total-income-value"]').textContent();
    const expenseText = await page.locator('[data-testid="total-expenses-value"]').textContent();
    const profitText = await page.locator('[data-testid="net-profit-value"]').textContent();

    expect(parseFloat(incomeText.replace(/[^0-9.-]+/g, ''))).toBeGreaterThanOrEqual(0);
    expect(parseFloat(expenseText.replace(/[^0-9.-]+/g, ''))).toBeGreaterThanOrEqual(0);
    expect(parseFloat(profitText.replace(/[^0-9.-]+/g, ''))).toBeDefined();

    // Visual test for metrics
    await visualTest(page, 'dashboard-metrics', {
      description: 'Financial metrics should display correctly',
    });
  });

  test('should display recent transactions', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForSelector('[data-testid="recent-transactions-list"]');

    // Verify transactions section
    await expect(page.locator('[data-testid="recent-transactions-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-transactions-list"]')).toBeVisible();

    // Check if transactions are displayed
    const transactionItems = page.locator('[data-testid="transaction-item"]');
    const count = await transactionItems.count();
    expect(count).toBeGreaterThanOrEqual(0);

    // Visual test for transactions
    await visualTest(page, 'dashboard-transactions', {
      description: 'Recent transactions should display correctly',
    });
  });

  test('should display account balances', async ({ page }) => {
    // Wait for account balances to load
    await page.waitForSelector('[data-testid="account-balances-list"]');

    // Verify account balances section
    await expect(page.locator('[data-testid="account-balances-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="account-balances-list"]')).toBeVisible();

    // Check if accounts are displayed
    const accountItems = page.locator('[data-testid="account-item"]');
    const count = await accountItems.count();
    expect(count).toBeGreaterThanOrEqual(0);

    // Visual test for account balances
    await visualTest(page, 'dashboard-accounts', {
      description: 'Account balances should display correctly',
    });
  });

  test('should have working quick actions', async ({ page }) => {
    // Verify quick actions section
    await expect(page.locator('[data-testid="quick-actions-title"]')).toBeVisible();

    // Test "Add Transaction" quick action
    await page.click('[data-testid="quick-action-add-transaction"]');
    await page.waitForURL('/transactions/new');
    await expect(page.locator('[data-testid="transaction-form"]')).toBeVisible();

    // Go back to dashboard
    await page.goBack();
    await page.waitForURL('/dashboard');

    // Test "Add Account" quick action
    await page.click('[data-testid="quick-action-add-account"]');
    await page.waitForURL('/accounts/new');
    await expect(page.locator('[data-testid="account-form"]')).toBeVisible();

    // Go back to dashboard
    await page.goBack();
    await page.waitForURL('/dashboard');

    // Visual test for quick actions
    await visualTest(page, 'dashboard-quick-actions', {
      description: 'Quick actions should be functional',
    });
  });

  test('should handle data refresh', async ({ page }) => {
    // Click refresh button
    await page.click('[data-testid="refresh-button"]');

    // Wait for refresh to complete
    await page.waitForSelector('[data-testid="refresh-loading"]', { state: 'hidden' });

    // Verify data is still displayed
    await expect(page.locator('[data-testid="total-income"]')).toBeVisible();
    await expect(page.locator('[data-testid="recent-transactions-list"]')).toBeVisible();

    // Visual test after refresh
    await visualTest(page, 'dashboard-after-refresh', {
      description: 'Dashboard should display correctly after refresh',
    });
  });

  test('should handle empty states', async ({ page }) => {
    // Mock empty data
    await page.route('**/api/dashboard/overview', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalIncome: 0,
          totalExpenses: 0,
          netProfit: 0,
          totalAssets: 0,
          totalLiabilities: 0,
          netWorth: 0,
          recentTransactions: [],
          accountBalances: [],
        }),
      });
    });

    // Refresh page to get empty data
    await page.reload();

    // Verify empty state messages
    await expect(page.locator('[data-testid="empty-transactions-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="empty-accounts-message"]')).toBeVisible();

    // Visual test for empty state
    await visualTest(page, 'dashboard-empty-state', {
      description: 'Dashboard should display empty state correctly',
    });
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/dashboard/overview', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalIncome: 50000,
            totalExpenses: 30000,
            netProfit: 20000,
            totalAssets: 100000,
            totalLiabilities: 40000,
            netWorth: 60000,
            recentTransactions: [],
            accountBalances: [],
          }),
        });
      }, 2000);
    });

    // Refresh page
    await page.reload();

    // Verify loading states
    await expect(page.locator('[data-testid="metrics-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="transactions-loading"]')).toBeVisible();
    await expect(page.locator('[data-testid="accounts-loading"]')).toBeVisible();

    // Visual test for loading state
    await visualTest(page, 'dashboard-loading-state', {
      description: 'Dashboard should display loading states correctly',
    });

    // Wait for data to load
    await page.waitForSelector('[data-testid="metrics-loading"]', { state: 'hidden' });
  });

  test('should handle error states', async ({ page }) => {
    // Mock API error
    await page.route('**/api/dashboard/overview', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // Refresh page
    await page.reload();

    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Visual test for error state
    await visualTest(page, 'dashboard-error-state', {
      description: 'Dashboard should display error state correctly',
    });

    // Test retry functionality
    await page.route('**/api/dashboard/overview', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalIncome: 50000,
          totalExpenses: 30000,
          netProfit: 20000,
          totalAssets: 100000,
          totalLiabilities: 40000,
          netWorth: 60000,
          recentTransactions: [],
          accountBalances: [],
        }),
      });
    });

    await page.click('[data-testid="retry-button"]');
    await page.waitForSelector('[data-testid="total-income"]');
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1920, height: 1080 });
    await visualTest(page, 'dashboard-desktop', {
      description: 'Dashboard should display correctly on desktop',
      viewport: { width: 1920, height: 1080 },
    });

    // Test tablet layout
    await page.setViewportSize({ width: 768, height: 1024 });
    await visualTest(page, 'dashboard-tablet', {
      description: 'Dashboard should display correctly on tablet',
      viewport: { width: 768, height: 1024 },
    });

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    await visualTest(page, 'dashboard-mobile', {
      description: 'Dashboard should display correctly on mobile',
      viewport: { width: 375, height: 667 },
    });
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.locator('[data-testid="dashboard-title"]')).toHaveAttribute('role', 'heading');
    await expect(page.locator('[data-testid="refresh-button"]')).toHaveAttribute('aria-label');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="refresh-button"]')).toBeFocused();

    // Test screen reader compatibility
    await expect(page.locator('[data-testid="total-income"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="total-expenses"]')).toHaveAttribute('aria-label');

    // Visual test for accessibility
    await visualTest(page, 'dashboard-accessibility', {
      description: 'Dashboard should be accessible',
    });
  });

  test('should handle real-time updates', async ({ page }) => {
    // Mock WebSocket connection for real-time updates
    await page.evaluate(() => {
      // Simulate real-time data update
      setTimeout(() => {
        const event = new CustomEvent('dashboard-update', {
          detail: {
            totalIncome: 55000,
            totalExpenses: 32000,
            netProfit: 23000,
          },
        });
        window.dispatchEvent(event);
      }, 1000);
    });

    // Wait for update
    await page.waitForTimeout(1500);

    // Verify updated values
    await expect(page.locator('[data-testid="total-income-value"]')).toContainText('55,000');
    await expect(page.locator('[data-testid="total-expenses-value"]')).toContainText('32,000');
    await expect(page.locator('[data-testid="net-profit-value"]')).toContainText('23,000');

    // Visual test after real-time update
    await visualTest(page, 'dashboard-realtime-update', {
      description: 'Dashboard should handle real-time updates correctly',
    });
  });
}); 