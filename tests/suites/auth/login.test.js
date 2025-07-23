const { test, expect } = require('@testsprite/playwright');
const { visualTest, performanceTest } = require('@testsprite/core');

test.describe('User Authentication - Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login form correctly', async ({ page }) => {
    // Visual regression test
    await visualTest(page, 'login-form', {
      description: 'Login form should render correctly',
      viewport: { width: 1920, height: 1080 },
    });

    // Functional test
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="remember-me-checkbox"]')).toBeVisible();
  });

  test('should handle successful login', async ({ page }) => {
    // Performance test
    await performanceTest(page, 'login-success', {
      description: 'Login should complete within performance thresholds',
      metrics: ['LCP', 'FID', 'CLS'],
    });

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'demo@fint.com');
    await page.fill('[data-testid="password-input"]', 'demo123');
    await page.check('[data-testid="remember-me-checkbox"]');

    // Submit form
    await page.click('[data-testid="login-button"]');

    // Wait for navigation
    await page.waitForURL('/dashboard');

    // Verify successful login
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();

    // Visual test after login
    await visualTest(page, 'dashboard-after-login', {
      description: 'Dashboard should display correctly after login',
    });
  });

  test('should handle invalid credentials', async ({ page }) => {
    // Fill with invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Wait for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');

    // Visual test for error state
    await visualTest(page, 'login-error-state', {
      description: 'Login form should display error state correctly',
    });
  });

  test('should handle empty form submission', async ({ page }) => {
    // Submit empty form
    await page.click('[data-testid="login-button"]');

    // Verify validation messages
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

    // Visual test for validation state
    await visualTest(page, 'login-validation-state', {
      description: 'Login form should display validation errors correctly',
    });
  });

  test('should remember user credentials', async ({ page, context }) => {
    // Login with remember me checked
    await page.fill('[data-testid="email-input"]', 'demo@fint.com');
    await page.fill('[data-testid="password-input"]', 'demo123');
    await page.check('[data-testid="remember-me-checkbox"]');
    await page.click('[data-testid="login-button"]');

    // Wait for successful login
    await page.waitForURL('/dashboard');

    // Close browser and reopen
    await context.close();
    const newContext = await browser.newContext();
    const newPage = await newContext.newPage();

    // Navigate to login page
    await newPage.goto('/login');

    // Check if credentials are pre-filled
    await expect(newPage.locator('[data-testid="email-input"]')).toHaveValue('demo@fint.com');
    await expect(newPage.locator('[data-testid="remember-me-checkbox"]')).toBeChecked();

    // Visual test for pre-filled form
    await visualTest(newPage, 'login-prefilled-form', {
      description: 'Login form should show pre-filled credentials',
    });
  });

  test('should handle password visibility toggle', async ({ page }) => {
    // Check initial state
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'password');

    // Toggle password visibility
    await page.click('[data-testid="password-toggle"]');

    // Check if password is visible
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'text');

    // Toggle back
    await page.click('[data-testid="password-toggle"]');

    // Check if password is hidden again
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('type', 'password');

    // Visual test for password toggle
    await visualTest(page, 'login-password-toggle', {
      description: 'Password visibility toggle should work correctly',
    });
  });

  test('should handle forgot password link', async ({ page }) => {
    // Click forgot password link
    await page.click('[data-testid="forgot-password-link"]');

    // Verify navigation to forgot password page
    await page.waitForURL('/forgot-password');
    await expect(page.locator('[data-testid="forgot-password-title"]')).toBeVisible();

    // Visual test for forgot password page
    await visualTest(page, 'forgot-password-page', {
      description: 'Forgot password page should display correctly',
    });
  });

  test('should handle sign up link', async ({ page }) => {
    // Click sign up link
    await page.click('[data-testid="sign-up-link"]');

    // Verify navigation to registration page
    await page.waitForURL('/register');
    await expect(page.locator('[data-testid="register-title"]')).toBeVisible();

    // Visual test for registration page
    await visualTest(page, 'register-page', {
      description: 'Registration page should display correctly',
    });
  });

  test('should be accessible', async ({ page }) => {
    // Accessibility test
    await expect(page.locator('[data-testid="email-input"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="password-input"]')).toHaveAttribute('aria-label');
    await expect(page.locator('[data-testid="login-button"]')).toHaveAttribute('aria-label');

    // Keyboard navigation test
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="email-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="password-input"]')).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="login-button"]')).toBeFocused();

    // Visual test for accessibility
    await visualTest(page, 'login-accessibility', {
      description: 'Login form should be accessible',
    });
  });

  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Visual test for mobile layout
    await visualTest(page, 'login-mobile', {
      description: 'Login form should display correctly on mobile',
      viewport: { width: 375, height: 667 },
    });

    // Test mobile interactions
    await page.fill('[data-testid="email-input"]', 'demo@fint.com');
    await page.fill('[data-testid="password-input"]', 'demo123');
    await page.click('[data-testid="login-button"]');

    await page.waitForURL('/dashboard');
    await expect(page.locator('[data-testid="dashboard-title"]')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network error
    await page.route('**/api/auth/login', route => {
      route.abort('failed');
    });

    // Attempt login
    await page.fill('[data-testid="email-input"]', 'demo@fint.com');
    await page.fill('[data-testid="password-input"]', 'demo123');
    await page.click('[data-testid="login-button"]');

    // Wait for error message
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();

    // Visual test for network error state
    await visualTest(page, 'login-network-error', {
      description: 'Login form should handle network errors gracefully',
    });
  });
}); 