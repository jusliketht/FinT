module.exports = {
  // TestSprite configuration for FinT application
  name: 'FinT Financial Management System',
  version: '1.0.0',
  
  // Test environments
  environments: {
    development: {
      baseUrl: 'http://localhost:3000',
      apiUrl: 'http://localhost:5000',
      database: 'sqlite:./test.db',
    },
    staging: {
      baseUrl: 'https://staging.fint.app',
      apiUrl: 'https://api-staging.fint.app',
      database: 'postgresql://staging:password@localhost:5432/fint_staging',
    },
    production: {
      baseUrl: 'https://fint.app',
      apiUrl: 'https://api.fint.app',
      database: 'postgresql://prod:password@localhost:5432/fint_prod',
    },
  },

  // Test suites configuration
  suites: {
    // Authentication tests
    auth: {
      name: 'Authentication Suite',
      description: 'Tests for user authentication and authorization',
      tests: [
        'tests/suites/auth/login.test.js',
        'tests/suites/auth/register.test.js',
        'tests/suites/auth/password-reset.test.js',
        'tests/suites/auth/session-management.test.js',
      ],
      visual: true,
      performance: true,
    },

    // Dashboard tests
    dashboard: {
      name: 'Dashboard Suite',
      description: 'Tests for main dashboard functionality',
      tests: [
        'tests/suites/dashboard/overview.test.js',
        'tests/suites/dashboard/metrics.test.js',
        'tests/suites/dashboard/charts.test.js',
        'tests/suites/dashboard/quick-actions.test.js',
      ],
      visual: true,
      performance: true,
    },

    // Transaction management tests
    transactions: {
      name: 'Transaction Management Suite',
      description: 'Tests for transaction CRUD operations',
      tests: [
        'tests/suites/transactions/create.test.js',
        'tests/suites/transactions/list.test.js',
        'tests/suites/transactions/edit.test.js',
        'tests/suites/transactions/delete.test.js',
        'tests/suites/transactions/filtering.test.js',
      ],
      visual: true,
      performance: true,
    },

    // Account management tests
    accounts: {
      name: 'Account Management Suite',
      description: 'Tests for account management functionality',
      tests: [
        'tests/suites/accounts/chart-of-accounts.test.js',
        'tests/suites/accounts/account-balances.test.js',
        'tests/suites/accounts/account-types.test.js',
      ],
      visual: true,
      performance: false,
    },

    // Bank reconciliation tests
    reconciliation: {
      name: 'Bank Reconciliation Suite',
      description: 'Tests for bank statement reconciliation',
      tests: [
        'tests/suites/reconciliation/upload.test.js',
        'tests/suites/reconciliation/matching.test.js',
        'tests/suites/reconciliation/reports.test.js',
      ],
      visual: true,
      performance: true,
    },

    // Invoice and billing tests
    billing: {
      name: 'Billing Suite',
      description: 'Tests for invoice and bill management',
      tests: [
        'tests/suites/billing/invoices.test.js',
        'tests/suites/billing/bills.test.js',
        'tests/suites/billing/payments.test.js',
      ],
      visual: true,
      performance: false,
    },

    // Reports tests
    reports: {
      name: 'Reports Suite',
      description: 'Tests for financial reporting',
      tests: [
        'tests/suites/reports/balance-sheet.test.js',
        'tests/suites/reports/income-statement.test.js',
        'tests/suites/reports/cash-flow.test.js',
        'tests/suites/reports/export.test.js',
      ],
      visual: true,
      performance: true,
    },

    // API tests
    api: {
      name: 'API Suite',
      description: 'Tests for backend API endpoints',
      tests: [
        'tests/suites/api/auth.test.js',
        'tests/suites/api/transactions.test.js',
        'tests/suites/api/accounts.test.js',
        'tests/suites/api/reports.test.js',
      ],
      visual: false,
      performance: true,
    },

    // Performance tests
    performance: {
      name: 'Performance Suite',
      description: 'Tests for application performance',
      tests: [
        'tests/suites/performance/load.test.js',
        'tests/suites/performance/stress.test.js',
        'tests/suites/performance/memory.test.js',
      ],
      visual: false,
      performance: true,
    },
  },

  // Visual regression testing configuration
  visual: {
    enabled: true,
    browser: 'chromium',
    viewport: {
      width: 1920,
      height: 1080,
    },
    devices: [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
    ],
    thresholds: {
      pixelDiff: 0.1, // 0.1% pixel difference threshold
      structuralSimilarity: 0.95, // 95% structural similarity
    },
    baselineDir: './tests/baselines/visual',
    outputDir: './tests/outputs/visual',
    ignoreSelectors: [
      '.timestamp',
      '.random-id',
      '[data-testid="dynamic-content"]',
    ],
  },

  // Performance testing configuration
  performance: {
    enabled: true,
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
        CLS: 0.1, // 0.1
        FCP: 1800, // 1.8 seconds
        TTFB: 600, // 600 milliseconds
      },
    },
    loadTesting: {
      enabled: true,
      scenarios: [
        {
          name: 'Dashboard Load',
          url: '/dashboard',
          users: 10,
          duration: '30s',
        },
        {
          name: 'Transaction Creation',
          url: '/transactions/new',
          users: 5,
          duration: '60s',
        },
      ],
    },
  },

  // Test data configuration
  testData: {
    users: {
      admin: {
        email: 'admin@fint.com',
        password: 'admin123',
        role: 'admin',
      },
      user: {
        email: 'user@fint.com',
        password: 'user123',
        role: 'user',
      },
      demo: {
        email: 'demo@fint.com',
        password: 'demo123',
        role: 'user',
      },
    },
    businesses: {
      default: {
        name: 'Test Business',
        type: 'Sole Proprietorship',
        gstin: '22AAAAA0000A1Z5',
        pan: 'AAAAA0000A',
      },
    },
    accounts: [
      {
        name: 'Cash Account',
        type: 'asset',
        balance: 50000,
      },
      {
        name: 'Bank Account',
        type: 'asset',
        balance: 100000,
      },
      {
        name: 'Sales Revenue',
        type: 'income',
        balance: 0,
      },
      {
        name: 'Office Expenses',
        type: 'expense',
        balance: 0,
      },
    ],
    transactions: [
      {
        description: 'Sales Revenue',
        amount: 10000,
        type: 'income',
        category: 'Sales',
        account: 'Sales Revenue',
      },
      {
        description: 'Office Supplies',
        amount: 500,
        type: 'expense',
        category: 'Office',
        account: 'Office Expenses',
      },
    ],
  },

  // Reporting configuration
  reporting: {
    enabled: true,
    formats: ['html', 'json', 'junit'],
    outputDir: './tests/reports',
    includeScreenshots: true,
    includeVideos: true,
    includeLogs: true,
    emailNotifications: {
      enabled: false,
      recipients: ['team@fint.com'],
      onFailure: true,
      onSuccess: false,
    },
    slackNotifications: {
      enabled: false,
      webhook: 'https://hooks.slack.com/services/...',
      channel: '#fint-testing',
      onFailure: true,
      onSuccess: false,
    },
  },

  // CI/CD integration
  ci: {
    enabled: true,
    parallel: true,
    maxWorkers: 4,
    retries: 2,
    timeout: 300000, // 5 minutes
    artifacts: {
      enabled: true,
      retention: '7d',
      include: ['screenshots', 'videos', 'logs', 'reports'],
    },
  },

  // Database configuration for testing
  database: {
    type: 'sqlite',
    file: './test.db',
    migrations: true,
    seed: true,
    cleanup: true,
  },

  // Browser configuration
  browsers: {
    chromium: {
      enabled: true,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
      ],
    },
    firefox: {
      enabled: false,
      headless: true,
    },
    webkit: {
      enabled: false,
      headless: true,
    },
  },

  // Custom test utilities
  utilities: {
    customHelpers: './tests/helpers',
    fixtures: './tests/fixtures',
    mocks: './tests/mocks',
  },
}; 