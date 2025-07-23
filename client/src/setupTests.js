// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Import API mocks
import {
  mockApiService,
  mockUserService,
  mockAccountService,
  mockTransactionService,
  mockBusinessService,
  mockInvoiceService,
  mockBillService,
  mockReconciliationService
} from './__tests__/mocks/apiMocks';

// Mock all API services that exist in the project
jest.mock('./services/api', () => mockApiService);
jest.mock('./services/userService', () => mockUserService);
jest.mock('./services/accountService', () => ({
  default: {
    getAll: jest.fn().mockResolvedValue([
      { id: 1, name: 'Bank Account', balance: 50000, type: 'ASSET' },
      { id: 2, name: 'Credit Card', balance: -2000, type: 'LIABILITY' }
    ]),
    getById: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
    getBalance: jest.fn().mockResolvedValue({}),
    getTransactions: jest.fn().mockResolvedValue({}),
    getChartOfAccounts: jest.fn().mockResolvedValue([]),
    getByTypeId: jest.fn().mockResolvedValue([]),
    getByCategoryId: jest.fn().mockResolvedValue([])
  }
}));
jest.mock('./services/transactionService', () => mockTransactionService);
jest.mock('./services/journalEntryService', () => ({
  default: {
    getAll: jest.fn().mockResolvedValue([
      { id: 1, description: 'Test Transaction', amount: 1000, type: 'Income', date: '2024-01-01' }
    ]),
    getById: jest.fn().mockResolvedValue({}),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({})
  }
}));
jest.mock('./services/businessService', () => mockBusinessService);
jest.mock('./services/invoiceService', () => mockInvoiceService);
jest.mock('./services/billsService', () => mockBillService);
jest.mock('./services/reconciliationService', () => mockReconciliationService);
jest.mock('./services/analyticsService', () => ({
  analyticsService: {
    getKPIs: jest.fn().mockResolvedValue({
      revenue: 50000,
      expenses: 30000,
      profit: 20000,
      cashFlow: 100000
    }),
    getCashFlowReport: jest.fn().mockResolvedValue({}),
    getProfitabilityAnalysis: jest.fn().mockResolvedValue({}),
    getTrendAnalysis: jest.fn().mockResolvedValue({}),
    getBusinessMetrics: jest.fn().mockResolvedValue({}),
    exportAnalyticsReport: jest.fn().mockResolvedValue({})
  }
}));
jest.mock('./services/financialReportsService', () => ({
  getBalanceSheet: jest.fn().mockResolvedValue({
    assets: [{ name: 'Current Assets', amount: 50000 }],
    liabilities: [{ name: 'Current Liabilities', amount: 20000 }],
    equity: [{ name: 'Retained Earnings', amount: 30000 }]
  }),
  getIncomeStatement: jest.fn().mockResolvedValue({
    revenue: [{ name: 'Sales', amount: 100000 }],
    expenses: [{ name: 'Cost of Goods Sold', amount: 60000 }]
  }),
  getCashFlow: jest.fn().mockResolvedValue({
    operating: [{ name: 'Net Income', amount: 20000 }],
    investing: [{ name: 'Equipment Purchase', amount: -10000 }],
    financing: [{ name: 'Loan Proceeds', amount: 15000 }]
  })
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Chakra UI's media query hooks
jest.mock('@chakra-ui/media-query', () => ({
  useMediaQuery: jest.fn(() => [false]),
  useBreakpointValue: jest.fn(() => 'default'),
}));

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock console.error to reduce noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
}); 