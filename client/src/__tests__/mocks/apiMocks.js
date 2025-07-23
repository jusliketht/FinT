// Comprehensive API mocks for testing
export const mockApiResponses = {
  // Auth endpoints
  '/auth/login': {
    user: { id: 1, email: 'test@example.com', name: 'Test User' },
    access_token: 'mock-token-123'
  },
  '/auth/register': {
    user: { id: 2, email: 'new@example.com', name: 'New User' },
    access_token: 'mock-token-456'
  },
  '/auth/me': {
    id: 1,
    email: 'test@example.com',
    name: 'Test User'
  },

  // Dashboard endpoints
  '/dashboard': {
    totalRevenue: 50000,
    totalExpenses: 30000,
    netIncome: 20000,
    totalAssets: 100000,
    totalLiabilities: 40000,
    recentTransactions: [
      { id: 1, description: 'Salary', amount: 5000, type: 'income', date: '2025-01-15' },
      { id: 2, description: 'Rent', amount: -1500, type: 'expense', date: '2025-01-14' }
    ],
    accountBalances: [
      { id: 1, name: 'Bank Account', balance: 25000 },
      { id: 2, name: 'Credit Card', balance: -5000 }
    ]
  },

  // Accounts endpoints
  '/accounts': [
    {
      id: 1,
      code: '1001',
      name: 'Bank Account',
      type: 'ASSET',
      balance: 25000,
      parentId: null,
      children: []
    },
    {
      id: 2,
      code: '2001',
      name: 'Credit Card',
      type: 'LIABILITY',
      balance: -5000,
      parentId: null,
      children: []
    }
  ],

  // Chart of accounts
  '/accounts/chart': [
    {
      id: 1,
      code: '1000',
      name: 'Assets',
      type: 'ASSET',
      balance: 100000,
      parentId: null,
      children: [
        {
          id: 2,
          code: '1100',
          name: 'Current Assets',
          type: 'ASSET',
          balance: 50000,
          parentId: 1,
          children: [
            {
              id: 3,
              code: '1101',
              name: 'Bank Account',
              type: 'ASSET',
              balance: 25000,
              parentId: 2,
              children: []
            }
          ]
        }
      ]
    }
  ],

  // Transactions endpoints
  '/transactions': [
    {
      id: 1,
      description: 'Salary Payment',
      amount: 5000,
      type: 'income',
      date: '2025-01-15',
      accountId: 1,
      category: 'Salary'
    },
    {
      id: 2,
      description: 'Rent Payment',
      amount: -1500,
      type: 'expense',
      date: '2025-01-14',
      accountId: 2,
      category: 'Housing'
    }
  ],

  // Reports endpoints
  '/reports/balance-sheet': {
    assets: [
      { name: 'Current Assets', amount: 50000 },
      { name: 'Fixed Assets', amount: 50000 }
    ],
    liabilities: [
      { name: 'Current Liabilities', amount: 20000 },
      { name: 'Long-term Liabilities', amount: 20000 }
    ],
    equity: [
      { name: 'Retained Earnings', amount: 60000 }
    ]
  },

  '/reports/income-statement': {
    revenue: [
      { name: 'Sales', amount: 100000 },
      { name: 'Other Income', amount: 5000 }
    ],
    expenses: [
      { name: 'Cost of Goods Sold', amount: 60000 },
      { name: 'Operating Expenses', amount: 25000 }
    ]
  },

  '/reports/cash-flow': {
    operating: [
      { name: 'Net Income', amount: 20000 },
      { name: 'Depreciation', amount: 5000 }
    ],
    investing: [
      { name: 'Equipment Purchase', amount: -10000 }
    ],
    financing: [
      { name: 'Loan Proceeds', amount: 15000 }
    ]
  },

  // Business endpoints
  '/business': [
    {
      id: 1,
      name: 'Test Business',
      type: 'Sole Proprietorship',
      gstNumber: 'GST123456789',
      panNumber: 'ABCDE1234F'
    }
  ],

  // Invoices endpoints
  '/invoices': [
    {
      id: 1,
      invoiceNumber: 'INV-001',
      customerName: 'Test Customer',
      amount: 1000,
      status: 'pending',
      dueDate: '2025-02-15'
    }
  ],

  // Bills endpoints
  '/bills': [
    {
      id: 1,
      billNumber: 'BILL-001',
      vendorName: 'Test Vendor',
      amount: 500,
      status: 'pending',
      dueDate: '2025-02-10'
    }
  ],

  // Bank reconciliation
  '/bank-reconciliation': {
    bankStatements: [
      {
        id: 1,
        date: '2025-01-15',
        description: 'Salary',
        amount: 5000,
        type: 'credit'
      }
    ],
    internalTransactions: [
      {
        id: 1,
        date: '2025-01-15',
        description: 'Salary Payment',
        amount: 5000,
        type: 'income'
      }
    ]
  }
};

// Mock API service
export const mockApiService = {
  useApi: () => ({
    get: jest.fn((url) => {
      const response = mockApiResponses[url];
      if (response) {
        return Promise.resolve({ data: response, status: 200 });
      }
      return Promise.reject(new Error('Not found'));
    }),

    post: jest.fn((url, data) => {
      const response = mockApiResponses[url];
      if (response) {
        return Promise.resolve({ data: response, status: 201 });
      }
      return Promise.reject(new Error('Not found'));
    }),

    put: jest.fn((url, data) => {
      const response = mockApiResponses[url];
      if (response) {
        return Promise.resolve({ data: response, status: 200 });
      }
      return Promise.reject(new Error('Not found'));
    }),

    delete: jest.fn((url) => {
      return Promise.resolve({ status: 204 });
    })
  })
};

// Mock user service
export const mockUserService = {
  login: jest.fn().mockResolvedValue({
    user: { id: 1, email: 'test@example.com' },
    access_token: 'mock-token'
  }),
  createUser: jest.fn().mockResolvedValue({
    user: { id: 2, email: 'new@example.com' },
    access_token: 'mock-token'
  }),
  getCurrentUser: jest.fn().mockResolvedValue({
    id: 1,
    email: 'test@example.com',
    name: 'Test User'
  })
};

// Mock account service
export const mockAccountService = {
  getAccounts: jest.fn().mockResolvedValue(mockApiResponses['/accounts']),
  getChartOfAccounts: jest.fn().mockResolvedValue(mockApiResponses['/accounts/chart']),
  createAccount: jest.fn().mockResolvedValue({ id: 3, name: 'New Account' }),
  updateAccount: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Account' }),
  deleteAccount: jest.fn().mockResolvedValue({ success: true })
};

// Mock transaction service
export const mockTransactionService = {
  getTransactions: jest.fn().mockResolvedValue(mockApiResponses['/transactions']),
  createTransaction: jest.fn().mockResolvedValue({ id: 3, description: 'New Transaction' }),
  updateTransaction: jest.fn().mockResolvedValue({ id: 1, description: 'Updated Transaction' }),
  deleteTransaction: jest.fn().mockResolvedValue({ success: true })
};

// Mock dashboard service
export const mockDashboardService = {
  getDashboardData: jest.fn().mockResolvedValue(mockApiResponses['/dashboard'])
};

// Mock report service
export const mockReportService = {
  getBalanceSheet: jest.fn().mockResolvedValue(mockApiResponses['/reports/balance-sheet']),
  getIncomeStatement: jest.fn().mockResolvedValue(mockApiResponses['/reports/income-statement']),
  getCashFlow: jest.fn().mockResolvedValue(mockApiResponses['/reports/cash-flow'])
};

// Mock business service
export const mockBusinessService = {
  getBusinesses: jest.fn().mockResolvedValue(mockApiResponses['/business']),
  createBusiness: jest.fn().mockResolvedValue({ id: 2, name: 'New Business' }),
  updateBusiness: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Business' }),
  deleteBusiness: jest.fn().mockResolvedValue({ success: true })
};

// Mock invoice service
export const mockInvoiceService = {
  getInvoices: jest.fn().mockResolvedValue(mockApiResponses['/invoices']),
  createInvoice: jest.fn().mockResolvedValue({ id: 2, invoiceNumber: 'INV-002' }),
  updateInvoice: jest.fn().mockResolvedValue({ id: 1, status: 'paid' }),
  deleteInvoice: jest.fn().mockResolvedValue({ success: true })
};

// Mock bill service
export const mockBillService = {
  getBills: jest.fn().mockResolvedValue(mockApiResponses['/bills']),
  createBill: jest.fn().mockResolvedValue({ id: 2, billNumber: 'BILL-002' }),
  updateBill: jest.fn().mockResolvedValue({ id: 1, status: 'paid' }),
  deleteBill: jest.fn().mockResolvedValue({ success: true })
};

// Mock reconciliation service
export const mockReconciliationService = {
  getReconciliationData: jest.fn().mockResolvedValue(mockApiResponses['/bank-reconciliation']),
  matchTransactions: jest.fn().mockResolvedValue({ success: true }),
  unmatchTransactions: jest.fn().mockResolvedValue({ success: true })
}; 