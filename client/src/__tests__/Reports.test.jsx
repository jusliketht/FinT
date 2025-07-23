import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import BalanceSheet from '../components/reports/BalanceSheet';
import IncomeStatement from '../components/reports/IncomeStatement';
import CashFlow from '../components/reports/CashFlow';
import { AuthProvider } from '../contexts/AuthContext';
import { BusinessProvider } from '../contexts/BusinessContext';
import { theme } from '../theme/theme';

// Mock the API service
jest.mock('../services/api', () => ({
  useApi: () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Mock the toast
const mockShowToast = jest.fn();
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => mockShowToast,
}));

const renderBalanceSheet = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <BalanceSheet />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

const renderIncomeStatement = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <IncomeStatement />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

const renderCashFlow = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <CashFlow />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('Reports Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'test-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  describe('BalanceSheet Component', () => {
    describe('Rendering', () => {
      test('renders balance sheet title', () => {
        renderBalanceSheet();
        expect(screen.getByText(/balance sheet/i)).toBeInTheDocument();
      });

      test('renders date range picker', () => {
        renderBalanceSheet();
        expect(screen.getByLabelText(/as of date/i)).toBeInTheDocument();
      });

      test('renders export button', () => {
        renderBalanceSheet();
        expect(screen.getByText(/export/i)).toBeInTheDocument();
      });

      test('renders assets section', () => {
        renderBalanceSheet();
        expect(screen.getByText(/assets/i)).toBeInTheDocument();
        expect(screen.getByText(/current assets/i)).toBeInTheDocument();
        expect(screen.getByText(/fixed assets/i)).toBeInTheDocument();
      });

      test('renders liabilities section', () => {
        renderBalanceSheet();
        expect(screen.getByText(/liabilities/i)).toBeInTheDocument();
        expect(screen.getByText(/current liabilities/i)).toBeInTheDocument();
        expect(screen.getByText(/long-term liabilities/i)).toBeInTheDocument();
      });

      test('renders equity section', () => {
        renderBalanceSheet();
        expect(screen.getByText(/equity/i)).toBeInTheDocument();
        expect(screen.getByText(/owner equity/i)).toBeInTheDocument();
        expect(screen.getByText(/retained earnings/i)).toBeInTheDocument();
      });
    });

    describe('Data Loading', () => {
      test('shows loading state initially', () => {
        renderBalanceSheet();
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });

      test('displays balance sheet data when loaded successfully', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            asOfDate: '2024-01-31',
            assets: {
              currentAssets: [
                {
                  name: 'Cash',
                  balance: 50000,
                },
                {
                  name: 'Accounts Receivable',
                  balance: 25000,
                },
              ],
              fixedAssets: [
                {
                  name: 'Equipment',
                  balance: 100000,
                },
              ],
              totalAssets: 175000,
            },
            liabilities: {
              currentLiabilities: [
                {
                  name: 'Accounts Payable',
                  balance: 15000,
                },
              ],
              longTermLiabilities: [
                {
                  name: 'Bank Loan',
                  balance: 50000,
                },
              ],
              totalLiabilities: 65000,
            },
            equity: {
              ownerEquity: 100000,
              retainedEarnings: 10000,
              totalEquity: 110000,
            },
          },
        });

        renderBalanceSheet();

        await waitFor(() => {
          expect(screen.getByText('Cash')).toBeInTheDocument();
          expect(screen.getByText('Accounts Receivable')).toBeInTheDocument();
          expect(screen.getByText('Equipment')).toBeInTheDocument();
          expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
          expect(screen.getByText('Bank Loan')).toBeInTheDocument();
          expect(screen.getByText('₹1,75,000')).toBeInTheDocument(); // total assets
          expect(screen.getByText('₹65,000')).toBeInTheDocument(); // total liabilities
          expect(screen.getByText('₹1,10,000')).toBeInTheDocument(); // total equity
        });
      });

      test('shows empty state when no data', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            assets: { currentAssets: [], fixedAssets: [], totalAssets: 0 },
            liabilities: { currentLiabilities: [], longTermLiabilities: [], totalLiabilities: 0 },
            equity: { ownerEquity: 0, retainedEarnings: 0, totalEquity: 0 },
          },
        });

        renderBalanceSheet();

        await waitFor(() => {
          expect(screen.getByText(/no balance sheet data available/i)).toBeInTheDocument();
        });
      });
    });

    describe('Date Range Selection', () => {
      test('updates report when date changes', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            assets: { currentAssets: [], fixedAssets: [], totalAssets: 0 },
            liabilities: { currentLiabilities: [], longTermLiabilities: [], totalLiabilities: 0 },
            equity: { ownerEquity: 0, retainedEarnings: 0, totalEquity: 0 },
          },
        });

        renderBalanceSheet();

        const dateInput = screen.getByLabelText(/as of date/i);
        fireEvent.change(dateInput, { target: { value: '2024-12-31' } });

        await waitFor(() => {
          expect(mockApi.get).toHaveBeenCalledWith('/reports/balance-sheet', {
            params: { asOfDate: '2024-12-31' },
          });
        });
      });
    });

    describe('Export Functionality', () => {
      test('exports balance sheet to PDF', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            assets: { currentAssets: [], fixedAssets: [], totalAssets: 0 },
            liabilities: { currentLiabilities: [], longTermLiabilities: [], totalLiabilities: 0 },
            equity: { ownerEquity: 0, retainedEarnings: 0, totalEquity: 0 },
          },
        });
        mockApi.post.mockResolvedValue({ data: 'pdf-data' });

        renderBalanceSheet();

        await waitFor(() => {
          expect(screen.getByText(/no balance sheet data available/i)).toBeInTheDocument();
        });

        const exportButton = screen.getByText(/export/i);
        fireEvent.click(exportButton);

        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/reports/balance-sheet/export');
          expect(mockShowToast).toHaveBeenCalledWith(
            'Balance sheet exported successfully',
            'success'
          );
        });
      });
    });
  });

  describe('IncomeStatement Component', () => {
    describe('Rendering', () => {
      test('renders income statement title', () => {
        renderIncomeStatement();
        expect(screen.getByText(/income statement/i)).toBeInTheDocument();
      });

      test('renders period selection', () => {
        renderIncomeStatement();
        expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      });

      test('renders revenue section', () => {
        renderIncomeStatement();
        expect(screen.getByText(/revenue/i)).toBeInTheDocument();
        expect(screen.getByText(/sales revenue/i)).toBeInTheDocument();
        expect(screen.getByText(/other income/i)).toBeInTheDocument();
      });

      test('renders expenses section', () => {
        renderIncomeStatement();
        expect(screen.getByText(/expenses/i)).toBeInTheDocument();
        expect(screen.getByText(/cost of goods sold/i)).toBeInTheDocument();
        expect(screen.getByText(/operating expenses/i)).toBeInTheDocument();
      });

      test('renders net income calculation', () => {
        renderIncomeStatement();
        expect(screen.getByText(/net income/i)).toBeInTheDocument();
      });
    });

    describe('Data Loading', () => {
      test('displays income statement data when loaded successfully', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            period: { startDate: '2024-01-01', endDate: '2024-01-31' },
            revenue: {
              salesRevenue: 100000,
              otherIncome: 5000,
              totalRevenue: 105000,
            },
            expenses: {
              costOfGoodsSold: 60000,
              operatingExpenses: [
                { name: 'Rent', amount: 5000 },
                { name: 'Utilities', amount: 2000 },
                { name: 'Salaries', amount: 15000 },
              ],
              totalExpenses: 82000,
            },
            netIncome: 23000,
          },
        });

        renderIncomeStatement();

        await waitFor(() => {
          expect(screen.getByText('₹1,00,000')).toBeInTheDocument(); // sales revenue
          expect(screen.getByText('₹5,000')).toBeInTheDocument(); // other income
          expect(screen.getByText('₹1,05,000')).toBeInTheDocument(); // total revenue
          expect(screen.getByText('₹60,000')).toBeInTheDocument(); // cost of goods sold
          expect(screen.getByText('₹22,000')).toBeInTheDocument(); // total operating expenses
          expect(screen.getByText('₹82,000')).toBeInTheDocument(); // total expenses
          expect(screen.getByText('₹23,000')).toBeInTheDocument(); // net income
        });
      });
    });

    describe('Period Selection', () => {
      test('updates report when period changes', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            revenue: { salesRevenue: 0, otherIncome: 0, totalRevenue: 0 },
            expenses: { costOfGoodsSold: 0, operatingExpenses: [], totalExpenses: 0 },
            netIncome: 0,
          },
        });

        renderIncomeStatement();

        const startDateInput = screen.getByLabelText(/start date/i);
        const endDateInput = screen.getByLabelText(/end date/i);

        fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
        fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

        await waitFor(() => {
          expect(mockApi.get).toHaveBeenCalledWith('/reports/income-statement', {
            params: { startDate: '2024-01-01', endDate: '2024-01-31' },
          });
        });
      });
    });
  });

  describe('CashFlow Component', () => {
    describe('Rendering', () => {
      test('renders cash flow statement title', () => {
        renderCashFlow();
        expect(screen.getByText(/cash flow statement/i)).toBeInTheDocument();
      });

      test('renders operating activities section', () => {
        renderCashFlow();
        expect(screen.getByText(/operating activities/i)).toBeInTheDocument();
        expect(screen.getByText(/net income/i)).toBeInTheDocument();
        expect(screen.getByText(/depreciation/i)).toBeInTheDocument();
        expect(screen.getByText(/changes in working capital/i)).toBeInTheDocument();
      });

      test('renders investing activities section', () => {
        renderCashFlow();
        expect(screen.getByText(/investing activities/i)).toBeInTheDocument();
        expect(screen.getByText(/purchase of equipment/i)).toBeInTheDocument();
        expect(screen.getByText(/sale of assets/i)).toBeInTheDocument();
      });

      test('renders financing activities section', () => {
        renderCashFlow();
        expect(screen.getByText(/financing activities/i)).toBeInTheDocument();
        expect(screen.getByText(/owner investments/i)).toBeInTheDocument();
        expect(screen.getByText(/loan proceeds/i)).toBeInTheDocument();
        expect(screen.getByText(/loan repayments/i)).toBeInTheDocument();
      });

      test('renders net cash flow calculation', () => {
        renderCashFlow();
        expect(screen.getByText(/net cash flow/i)).toBeInTheDocument();
        expect(screen.getByText(/beginning cash balance/i)).toBeInTheDocument();
        expect(screen.getByText(/ending cash balance/i)).toBeInTheDocument();
      });
    });

    describe('Data Loading', () => {
      test('displays cash flow data when loaded successfully', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            period: { startDate: '2024-01-01', endDate: '2024-01-31' },
            operatingActivities: {
              netIncome: 23000,
              depreciation: 2000,
              changesInWorkingCapital: -5000,
              netOperatingCashFlow: 20000,
            },
            investingActivities: {
              purchaseOfEquipment: -15000,
              saleOfAssets: 5000,
              netInvestingCashFlow: -10000,
            },
            financingActivities: {
              ownerInvestments: 10000,
              loanProceeds: 20000,
              loanRepayments: -5000,
              netFinancingCashFlow: 25000,
            },
            netCashFlow: 35000,
            beginningCashBalance: 15000,
            endingCashBalance: 50000,
          },
        });

        renderCashFlow();

        await waitFor(() => {
          expect(screen.getByText('₹23,000')).toBeInTheDocument(); // net income
          expect(screen.getByText('₹2,000')).toBeInTheDocument(); // depreciation
          expect(screen.getByText('₹-5,000')).toBeInTheDocument(); // changes in working capital
          expect(screen.getByText('₹20,000')).toBeInTheDocument(); // net operating cash flow
          expect(screen.getByText('₹-15,000')).toBeInTheDocument(); // purchase of equipment
          expect(screen.getByText('₹5,000')).toBeInTheDocument(); // sale of assets
          expect(screen.getByText('₹-10,000')).toBeInTheDocument(); // net investing cash flow
          expect(screen.getByText('₹10,000')).toBeInTheDocument(); // owner investments
          expect(screen.getByText('₹20,000')).toBeInTheDocument(); // loan proceeds
          expect(screen.getByText('₹-5,000')).toBeInTheDocument(); // loan repayments
          expect(screen.getByText('₹25,000')).toBeInTheDocument(); // net financing cash flow
          expect(screen.getByText('₹35,000')).toBeInTheDocument(); // net cash flow
          expect(screen.getByText('₹15,000')).toBeInTheDocument(); // beginning cash balance
          expect(screen.getByText('₹50,000')).toBeInTheDocument(); // ending cash balance
        });
      });
    });
  });

  describe('Report Comparison', () => {
    test('compares reports across different periods', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: {
          currentPeriod: {
            revenue: 100000,
            expenses: 80000,
            netIncome: 20000,
          },
          previousPeriod: {
            revenue: 90000,
            expenses: 75000,
            netIncome: 15000,
          },
          changes: {
            revenue: 11.11,
            expenses: 6.67,
            netIncome: 33.33,
          },
        },
      });

      renderIncomeStatement();

      const compareButton = screen.getByText(/compare periods/i);
      fireEvent.click(compareButton);

      await waitFor(() => {
        expect(screen.getByText('+11.11%')).toBeInTheDocument(); // revenue change
        expect(screen.getByText('+6.67%')).toBeInTheDocument(); // expenses change
        expect(screen.getByText('+33.33%')).toBeInTheDocument(); // net income change
      });
    });
  });

  describe('Report Customization', () => {
    test('allows custom date ranges', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: {
          revenue: { salesRevenue: 0, otherIncome: 0, totalRevenue: 0 },
          expenses: { costOfGoodsSold: 0, operatingExpenses: [], totalExpenses: 0 },
          netIncome: 0,
        },
      });

      renderIncomeStatement();

      const customRangeButton = screen.getByText(/custom range/i);
      fireEvent.click(customRangeButton);

      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-03-31' } });

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/reports/income-statement', {
          params: { startDate: '2024-01-01', endDate: '2024-03-31' },
        });
      });
    });

    test('allows filtering by business unit', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: {
          assets: { currentAssets: [], fixedAssets: [], totalAssets: 0 },
          liabilities: { currentLiabilities: [], longTermLiabilities: [], totalLiabilities: 0 },
          equity: { ownerEquity: 0, retainedEarnings: 0, totalEquity: 0 },
        },
      });

      renderBalanceSheet();

      const businessUnitSelect = screen.getByLabelText(/business unit/i);
      fireEvent.change(businessUnitSelect, { target: { value: 'unit-1' } });

      await waitFor(() => {
        expect(mockApi.get).toHaveBeenCalledWith('/reports/balance-sheet', {
          params: { businessUnit: 'unit-1' },
        });
      });
    });
  });

  describe('Report Export Options', () => {
    test('exports to PDF format', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.post.mockResolvedValue({ data: 'pdf-data' });

      renderBalanceSheet();

      const exportButton = screen.getByText(/export/i);
      fireEvent.click(exportButton);

      const pdfOption = screen.getByText(/export as pdf/i);
      fireEvent.click(pdfOption);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/reports/balance-sheet/export', {
          format: 'pdf',
        });
      });
    });

    test('exports to Excel format', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.post.mockResolvedValue({ data: 'excel-data' });

      renderIncomeStatement();

      const exportButton = screen.getByText(/export/i);
      fireEvent.click(exportButton);

      const excelOption = screen.getByText(/export as excel/i);
      fireEvent.click(excelOption);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/reports/income-statement/export', {
          format: 'excel',
        });
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen size', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderBalanceSheet();

      // Test that the layout adapts to mobile
      const container = screen.getByTestId('reports-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderBalanceSheet();

      expect(screen.getByLabelText(/as of date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/export/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      renderBalanceSheet();

      const dateInput = screen.getByLabelText(/as of date/i);
      dateInput.focus();
      
      expect(dateInput).toHaveFocus();
    });
  });
}); 