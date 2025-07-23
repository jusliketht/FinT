import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import BankReconciliation from '../pages/bankStatements/BankReconciliation';
import BankStatementUpload from '../components/bankStatements/BankStatementUpload';
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

const renderBankReconciliation = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <BankReconciliation />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

const renderBankStatementUpload = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <BankStatementUpload />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('Bank Reconciliation Component', () => {
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

  describe('BankReconciliation Component', () => {
    describe('Rendering', () => {
      test('renders bank reconciliation title', () => {
        renderBankReconciliation();
        expect(screen.getByText(/bank reconciliation/i)).toBeInTheDocument();
      });

      test('renders upload statement button', () => {
        renderBankReconciliation();
        expect(screen.getByText(/upload statement/i)).toBeInTheDocument();
      });

      test('renders reconciliation summary', () => {
        renderBankReconciliation();
        expect(screen.getByText(/reconciliation summary/i)).toBeInTheDocument();
        expect(screen.getByText(/matched transactions/i)).toBeInTheDocument();
        expect(screen.getByText(/unmatched transactions/i)).toBeInTheDocument();
        expect(screen.getByText(/difference/i)).toBeInTheDocument();
      });

      test('renders statement transactions and journal entries sections', () => {
        renderBankReconciliation();
        expect(screen.getByText(/bank statement transactions/i)).toBeInTheDocument();
        expect(screen.getByText(/journal entries/i)).toBeInTheDocument();
      });
    });

    describe('Data Loading', () => {
      test('shows loading state initially', () => {
        renderBankReconciliation();
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });

      test('displays reconciliation data when loaded successfully', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            summary: {
              matchedCount: 15,
              unmatchedStatementCount: 3,
              unmatchedJournalCount: 2,
              difference: 500,
            },
            statementTransactions: [
              {
                id: 1,
                date: '2024-01-01',
                description: 'Salary Credit',
                amount: 5000,
                type: 'CREDIT',
                matched: true,
              },
              {
                id: 2,
                date: '2024-01-02',
                description: 'ATM Withdrawal',
                amount: 200,
                type: 'DEBIT',
                matched: false,
              },
            ],
            journalEntries: [
              {
                id: 1,
                date: '2024-01-01',
                description: 'Salary Payment',
                amount: 5000,
                type: 'CREDIT',
                matched: true,
              },
              {
                id: 2,
                date: '2024-01-02',
                description: 'Cash Withdrawal',
                amount: 200,
                type: 'DEBIT',
                matched: false,
              },
            ],
          },
        });

        renderBankReconciliation();

        await waitFor(() => {
          expect(screen.getByText('15')).toBeInTheDocument(); // matched count
          expect(screen.getByText('3')).toBeInTheDocument(); // unmatched statement
          expect(screen.getByText('2')).toBeInTheDocument(); // unmatched journal
          expect(screen.getByText('₹500')).toBeInTheDocument(); // difference
        });
      });

      test('shows empty state when no reconciliation data', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            summary: {
              matchedCount: 0,
              unmatchedStatementCount: 0,
              unmatchedJournalCount: 0,
              difference: 0,
            },
            statementTransactions: [],
            journalEntries: [],
          },
        });

        renderBankReconciliation();

        await waitFor(() => {
          expect(screen.getByText(/no reconciliation data available/i)).toBeInTheDocument();
        });
      });
    });

    describe('Transaction Matching', () => {
      test('allows manual matching of transactions', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            summary: {
              matchedCount: 0,
              unmatchedStatementCount: 1,
              unmatchedJournalCount: 1,
              difference: 0,
            },
            statementTransactions: [
              {
                id: 1,
                date: '2024-01-01',
                description: 'ATM Withdrawal',
                amount: 200,
                type: 'DEBIT',
                matched: false,
              },
            ],
            journalEntries: [
              {
                id: 1,
                date: '2024-01-01',
                description: 'Cash Withdrawal',
                amount: 200,
                type: 'DEBIT',
                matched: false,
              },
            ],
          },
        });
        mockApi.post.mockResolvedValue({ success: true });

        renderBankReconciliation();

        await waitFor(() => {
          expect(screen.getByText('ATM Withdrawal')).toBeInTheDocument();
          expect(screen.getByText('Cash Withdrawal')).toBeInTheDocument();
        });

        const matchButton = screen.getByLabelText(/match transaction/i);
        fireEvent.click(matchButton);

        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/reconciliation/match', {
            statementTransactionId: 1,
            journalEntryId: 1,
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Transactions matched successfully',
            'success'
          );
        });
      });

      test('allows unmatching of transactions', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            summary: {
              matchedCount: 1,
              unmatchedStatementCount: 0,
              unmatchedJournalCount: 0,
              difference: 0,
            },
            statementTransactions: [
              {
                id: 1,
                date: '2024-01-01',
                description: 'Salary Credit',
                amount: 5000,
                type: 'CREDIT',
                matched: true,
                matchedWith: 1,
              },
            ],
            journalEntries: [
              {
                id: 1,
                date: '2024-01-01',
                description: 'Salary Payment',
                amount: 5000,
                type: 'CREDIT',
                matched: true,
                matchedWith: 1,
              },
            ],
          },
        });
        mockApi.delete.mockResolvedValue({ success: true });

        renderBankReconciliation();

        await waitFor(() => {
          expect(screen.getByText('Salary Credit')).toBeInTheDocument();
          expect(screen.getByText('Salary Payment')).toBeInTheDocument();
        });

        const unmatchButton = screen.getByLabelText(/unmatch transaction/i);
        fireEvent.click(unmatchButton);

        await waitFor(() => {
          expect(mockApi.delete).toHaveBeenCalledWith('/reconciliation/match/1');
          expect(mockShowToast).toHaveBeenCalledWith(
            'Transaction unmatch successful',
            'success'
          );
        });
      });
    });

    describe('Filtering and Search', () => {
      test('filters transactions by match status', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            summary: {
              matchedCount: 1,
              unmatchedStatementCount: 1,
              unmatchedJournalCount: 1,
              difference: 0,
            },
            statementTransactions: [
              {
                id: 1,
                description: 'Matched Transaction',
                amount: 1000,
                matched: true,
              },
              {
                id: 2,
                description: 'Unmatched Transaction',
                amount: 500,
                matched: false,
              },
            ],
            journalEntries: [],
          },
        });

        renderBankReconciliation();

        await waitFor(() => {
          expect(screen.getByText('Matched Transaction')).toBeInTheDocument();
          expect(screen.getByText('Unmatched Transaction')).toBeInTheDocument();
        });

        const matchedFilter = screen.getByText(/show matched only/i);
        fireEvent.click(matchedFilter);

        await waitFor(() => {
          expect(screen.getByText('Matched Transaction')).toBeInTheDocument();
          expect(screen.queryByText('Unmatched Transaction')).not.toBeInTheDocument();
        });
      });

      test('searches transactions by description', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: {
            summary: {
              matchedCount: 0,
              unmatchedStatementCount: 2,
              unmatchedJournalCount: 0,
              difference: 0,
            },
            statementTransactions: [
              {
                id: 1,
                description: 'Salary Credit',
                amount: 5000,
                matched: false,
              },
              {
                id: 2,
                description: 'ATM Withdrawal',
                amount: 200,
                matched: false,
              },
            ],
            journalEntries: [],
          },
        });

        renderBankReconciliation();

        await waitFor(() => {
          expect(screen.getByText('Salary Credit')).toBeInTheDocument();
          expect(screen.getByText('ATM Withdrawal')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/search transactions/i);
        fireEvent.change(searchInput, { target: { value: 'Salary' } });

        await waitFor(() => {
          expect(screen.getByText('Salary Credit')).toBeInTheDocument();
          expect(screen.queryByText('ATM Withdrawal')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('BankStatementUpload Component', () => {
    describe('File Upload', () => {
      test('renders file upload area', () => {
        renderBankStatementUpload();
        expect(screen.getByText(/upload bank statement/i)).toBeInTheDocument();
        expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
        expect(screen.getByText(/or click to browse/i)).toBeInTheDocument();
      });

      test('accepts PDF files', () => {
        renderBankStatementUpload();
        
        const fileInput = screen.getByLabelText(/upload statement/i);
        const file = new File(['test content'], 'statement.pdf', { type: 'application/pdf' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByText('statement.pdf')).toBeInTheDocument();
      });

      test('rejects non-PDF files', () => {
        renderBankStatementUpload();
        
        const fileInput = screen.getByLabelText(/upload statement/i);
        const file = new File(['test content'], 'statement.txt', { type: 'text/plain' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(mockShowToast).toHaveBeenCalledWith(
          'Please upload a PDF file',
          'error'
        );
      });

      test('uploads statement successfully', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({ success: true });

        renderBankStatementUpload();
        
        const fileInput = screen.getByLabelText(/upload statement/i);
        const file = new File(['test content'], 'statement.pdf', { type: 'application/pdf' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByText(/upload statement/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/bank-statements/upload', expect.any(FormData));
          expect(mockShowToast).toHaveBeenCalledWith(
            'Statement uploaded successfully',
            'success'
          );
        });
      });

      test('handles upload error', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockRejectedValue(new Error('Upload failed'));

        renderBankStatementUpload();
        
        const fileInput = screen.getByLabelText(/upload statement/i);
        const file = new File(['test content'], 'statement.pdf', { type: 'application/pdf' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByText(/upload statement/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to upload statement',
            'error'
          );
        });
      });
    });

    describe('Statement Processing', () => {
      test('shows processing status during upload', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true }), 100)));

        renderBankStatementUpload();
        
        const fileInput = screen.getByLabelText(/upload statement/i);
        const file = new File(['test content'], 'statement.pdf', { type: 'application/pdf' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByText(/upload statement/i);
        fireEvent.click(uploadButton);

        expect(screen.getByText(/processing/i)).toBeInTheDocument();
        expect(uploadButton).toBeDisabled();
      });

      test('displays parsed transactions after upload', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({
          success: true,
          data: {
            transactions: [
              {
                date: '2024-01-01',
                description: 'Salary Credit',
                amount: 5000,
                type: 'CREDIT',
              },
              {
                date: '2024-01-02',
                description: 'ATM Withdrawal',
                amount: 200,
                type: 'DEBIT',
              },
            ],
          },
        });

        renderBankStatementUpload();
        
        const fileInput = screen.getByLabelText(/upload statement/i);
        const file = new File(['test content'], 'statement.pdf', { type: 'application/pdf' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByText(/upload statement/i);
        fireEvent.click(uploadButton);

        await waitFor(() => {
          expect(screen.getByText('Salary Credit')).toBeInTheDocument();
          expect(screen.getByText('ATM Withdrawal')).toBeInTheDocument();
          expect(screen.getByText('₹5,000')).toBeInTheDocument();
          expect(screen.getByText('₹200')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Reconciliation Reports', () => {
    test('generates reconciliation report', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: {
          summary: {
            matchedCount: 15,
            unmatchedStatementCount: 3,
            unmatchedJournalCount: 2,
            difference: 500,
          },
        },
      });
      mockApi.post.mockResolvedValue({ data: 'report-data' });

      renderBankReconciliation();

      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument();
      });

      const generateReportButton = screen.getByText(/generate report/i);
      fireEvent.click(generateReportButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/reconciliation/report');
        expect(mockShowToast).toHaveBeenCalledWith(
          'Report generated successfully',
          'success'
        );
      });
    });

    test('exports reconciliation data', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: {
          summary: {
            matchedCount: 15,
            unmatchedStatementCount: 3,
            unmatchedJournalCount: 2,
            difference: 500,
          },
        },
      });
      mockApi.post.mockResolvedValue({ data: 'export-data' });

      renderBankReconciliation();

      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument();
      });

      const exportButton = screen.getByText(/export data/i);
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/reconciliation/export');
        expect(mockShowToast).toHaveBeenCalledWith(
          'Data exported successfully',
          'success'
        );
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

      renderBankReconciliation();

      // Test that the layout adapts to mobile
      const container = screen.getByTestId('reconciliation-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderBankReconciliation();

      expect(screen.getByLabelText(/upload statement/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/search transactions/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      renderBankReconciliation();

      const searchInput = screen.getByPlaceholderText(/search transactions/i);
      searchInput.focus();
      
      expect(searchInput).toHaveFocus();
    });
  });
}); 