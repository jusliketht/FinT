import React from 'react';

import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '../contexts/AuthContext';
import { BusinessProvider } from '../contexts/BusinessContext';
import { TransactionProvider, useTransaction } from '../contexts/TransactionContext';
import GlobalTransactionModal from '../components/transactions/GlobalTransactionModal';

import TransactionsPage from '../pages/TransactionsPage';
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

const renderTransactions = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <TransactionProvider>
              <TransactionsPage />
            </TransactionProvider>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

const renderTransactionModal = () => {
  const { result } = renderHook(() => {
    const transactionContext = useTransaction();
    return transactionContext;
  }, {
    wrapper: ({ children }) => (
      <ChakraProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <BusinessProvider>
              <TransactionProvider>
                {children}
                <GlobalTransactionModal />
              </TransactionProvider>
            </BusinessProvider>
          </AuthProvider>
        </BrowserRouter>
      </ChakraProvider>
    ),
  });
  
  // Open the modal
  act(() => {
    result.current.openAddTransaction();
  });
  
  return result;
};

describe('Transactions Component', () => {
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

  describe('TransactionList Component', () => {
    describe('Rendering', () => {
      test('renders transactions page title', () => {
        renderTransactions();
        expect(screen.getByText(/transactions/i)).toBeInTheDocument();
      });

      test('renders add transaction button', () => {
        renderTransactions();
        expect(screen.getByText(/add transaction/i)).toBeInTheDocument();
      });

      test('renders search and filter controls', () => {
        renderTransactions();
        expect(screen.getByPlaceholderText(/search or filter/i)).toBeInTheDocument();
      });

      test('renders transaction summary sidebar', () => {
        renderTransactions();
        expect(screen.getByText(/transaction summary/i)).toBeInTheDocument();
      });
    });

    describe('Data Loading', () => {
      test('shows loading state for summary stats', () => {
        renderTransactions();
        // The loading state is in the sidebar, so we need to check for the spinner
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      test('displays summary stats when loaded successfully', async () => {
        const mockTransactionService = require('../services/transactionService').default;
        const mockAnalyticsService = require('../services/analyticsService').analyticsService;
        
        mockTransactionService.getStats.mockResolvedValue({
          totalIncome: 5000,
          totalExpenses: 2000,
          paidTransactions: 10,
          pendingTransactions: 5,
          overdueTransactions: 2,
        });
        
        mockAnalyticsService.getKPIs.mockResolvedValue({
          revenue: 5000,
          expenses: 2000,
          profit: 3000,
        });

        renderTransactions();

        await waitFor(() => {
          expect(screen.getByText(/₹5,000.00/)).toBeInTheDocument();
        });
      });

      test('shows empty state when no business selected', () => {
        renderTransactions();
        expect(screen.getByText(/please select a business/i)).toBeInTheDocument();
      });
    });

    describe('Search and Filtering', () => {
      test('updates search query when typing', () => {
        renderTransactions();
        
        const searchInput = screen.getByPlaceholderText(/search or filter/i);
        fireEvent.change(searchInput, { target: { value: 'Salary' } });
        
        expect(searchInput.value).toBe('Salary');
      });

      test('displays bulk actions dropdown', () => {
        renderTransactions();
        
        const bulkActionsSelect = screen.getByDisplayValue(/bulk actions/i);
        expect(bulkActionsSelect).toBeInTheDocument();
      });
    });

    describe('Transaction Actions', () => {
      test('opens add transaction modal when button is clicked', () => {
        renderTransactions();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);
        
        expect(screen.getByText(/save transaction/i)).toBeInTheDocument();
      });

      test('deletes transaction when delete button is clicked', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: [
            {
              id: 1,
              description: 'Salary',
              amount: 5000,
              type: 'Income',
            },
          ],
        });
        mockApi.delete.mockResolvedValue({ success: true });

        renderTransactions();

        await waitFor(() => {
          expect(screen.getByText('Salary')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText(/delete transaction/i);
        fireEvent.click(deleteButton);

        // Confirm deletion
        const confirmButton = screen.getByText(/confirm/i);
        fireEvent.click(confirmButton);

        await waitFor(() => {
          expect(mockApi.delete).toHaveBeenCalledWith('/transactions/1');
        });
        
        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Transaction deleted successfully',
            'success'
          );
        });
      });
    });
  });

  describe('GlobalTransactionModal Component', () => {
    describe('Form Rendering', () => {
      test('renders all form fields when opened', () => {
        renderTransactionModal();
        
        // Open the modal
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/transaction type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/account/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
      });

      test('pre-fills form with current date', () => {
        renderTransactionModal();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        const dateInput = screen.getByLabelText(/date/i);
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput.value).toBe(today);
      });
    });

    describe('Form Validation', () => {
      test('shows validation errors for empty required fields', async () => {
        renderTransactionModal();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        const submitButton = screen.getByText(/save transaction/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
        });
        
        await waitFor(() => {
          expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        });
        
        await waitFor(() => {
          expect(screen.getByText(/category is required/i)).toBeInTheDocument();
        });
        
        await waitFor(() => {
          expect(screen.getByText(/account is required/i)).toBeInTheDocument();
        });
      });

      test('validates amount is positive', async () => {
        renderTransactionModal();

        const amountInput = screen.getByLabelText(/amount/i);
        fireEvent.change(amountInput, { target: { value: '-100' } });

        const submitButton = screen.getByText(/save transaction/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/amount must be positive/i)).toBeInTheDocument();
        });
      });

      test('validates description length', async () => {
        renderTransactionModal();

        const descriptionInput = screen.getByLabelText(/description/i);
        fireEvent.change(descriptionInput, { target: { value: 'ab' } });

        const submitButton = screen.getByText(/save transaction/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/description must be at least 3 characters/i)).toBeInTheDocument();
        });
      });
    });

    describe('Form Submission', () => {
      test('submits form with correct data', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({ success: true });
        mockApi.get.mockResolvedValue({
          data: [
            { id: 1, name: 'Bank Account', type: 'ASSET' },
            { id: 2, name: 'Salary', type: 'REVENUE' },
          ],
        });

        renderTransactionModal();

        // Fill form
        const amountInput = screen.getByLabelText(/amount/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const categorySelect = screen.getByLabelText(/category/i);
        const accountSelect = screen.getByLabelText(/account/i);

        fireEvent.change(amountInput, { target: { value: '5000' } });
        fireEvent.change(descriptionInput, { target: { value: 'Salary Payment' } });
        fireEvent.change(categorySelect, { target: { value: '2' } });
        fireEvent.change(accountSelect, { target: { value: '1' } });

        const submitButton = screen.getByText(/save transaction/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/transactions', {
            amount: 5000,
            description: 'Salary Payment',
            category: '2',
            accountId: '1',
            date: expect.any(String),
            transactionType: 'Income',
            paymentMethod: 'Cash',
            personEntity: '',
            referenceNumber: '',
            notes: '',
            businessId: null,
            attachments: [],
          });
        });
      });

      test('shows success message on successful submission', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({ success: true });
        mockApi.get.mockResolvedValue({
          data: [
            { id: 1, name: 'Bank Account', type: 'ASSET' },
            { id: 2, name: 'Salary', type: 'REVENUE' },
          ],
        });

        renderTransactionModal();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        // Fill required fields
        const amountInput = screen.getByLabelText(/amount/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const categorySelect = screen.getByLabelText(/category/i);
        const accountSelect = screen.getByLabelText(/account/i);

        fireEvent.change(amountInput, { target: { value: '5000' } });
        fireEvent.change(descriptionInput, { target: { value: 'Salary Payment' } });
        fireEvent.change(categorySelect, { target: { value: '2' } });
        fireEvent.change(accountSelect, { target: { value: '1' } });

        const submitButton = screen.getByText(/save transaction/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Transaction created successfully',
            'success'
          );
        });
      });

      test('shows error message on submission failure', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockRejectedValue(new Error('Failed to create transaction'));
        mockApi.get.mockResolvedValue({
          data: [
            { id: 1, name: 'Bank Account', type: 'ASSET' },
            { id: 2, name: 'Salary', type: 'REVENUE' },
          ],
        });

        renderTransactionModal();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        // Fill required fields
        const amountInput = screen.getByLabelText(/amount/i);
        const descriptionInput = screen.getByLabelText(/description/i);
        const categorySelect = screen.getByLabelText(/category/i);
        const accountSelect = screen.getByLabelText(/account/i);

        fireEvent.change(amountInput, { target: { value: '5000' } });
        fireEvent.change(descriptionInput, { target: { value: 'Salary Payment' } });
        fireEvent.change(categorySelect, { target: { value: '2' } });
        fireEvent.change(accountSelect, { target: { value: '1' } });

        const submitButton = screen.getByText(/save transaction/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to create transaction',
            'error'
          );
        });
      });
    });

    describe('Add Account Feature', () => {
      test('shows add account form when add account button is clicked', () => {
        renderTransactionModal();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        const addAccountButton = screen.getByText(/add new account/i);
        fireEvent.click(addAccountButton);

        expect(screen.getByText(/add new account/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/account code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
      });

      test('creates new account successfully', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({
          id: 3,
          name: 'New Account',
          code: 'NA001',
          type: 'ASSET',
        });

        renderTransactionModal();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        const addAccountButton = screen.getByText(/add new account/i);
        fireEvent.click(addAccountButton);

        // Fill account form
        const nameInput = screen.getByLabelText(/account name/i);
        const codeInput = screen.getByLabelText(/account code/i);
        const typeSelect = screen.getByLabelText(/account type/i);

        fireEvent.change(nameInput, { target: { value: 'New Account' } });
        fireEvent.change(codeInput, { target: { value: 'NA001' } });
        fireEvent.change(typeSelect, { target: { value: 'ASSET' } });

        const saveAccountButton = screen.getByText(/save account/i);
        fireEvent.click(saveAccountButton);

        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/accounts', {
            name: 'New Account',
            code: 'NA001',
            type: 'ASSET',
            description: '',
            businessId: null,
          });
        });
        
        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Account created successfully',
            'success'
          );
        });
      });
    });

    describe('File Attachments', () => {
      test('allows file upload', () => {
        renderTransactionModal();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        const fileInput = screen.getByLabelText(/attachments/i);
        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByText('test.pdf')).toBeInTheDocument();
      });

      test('removes attached file when remove button is clicked', () => {
        renderTransactionModal();
        
        const addButton = screen.getByText(/add transaction/i);
        fireEvent.click(addButton);

        const fileInput = screen.getByLabelText(/attachments/i);
        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByText('test.pdf')).toBeInTheDocument();

        const removeButton = screen.getByLabelText(/remove test.pdf/i);
        fireEvent.click(removeButton);

        expect(screen.queryByText('test.pdf')).not.toBeInTheDocument();
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

      renderTransactions();

      // Test that the layout adapts to mobile
      const container = screen.getByTestId('transactions-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderTransactions();

      expect(screen.getByLabelText(/search transactions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/add transaction/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      renderTransactions();

      const searchInput = screen.getByPlaceholderText(/search transactions/i);
      searchInput.focus();
      
      expect(searchInput).toHaveFocus();
    });
  });
}); 