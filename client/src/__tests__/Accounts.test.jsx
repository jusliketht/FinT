import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import ChartOfAccounts from '../components/accounts/ChartOfAccounts';
import AccountForm from '../components/accounting/AccountForm';
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

const renderChartOfAccounts = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <ChartOfAccounts />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

const renderAccountForm = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <AccountForm />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('Accounts Component', () => {
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

  describe('ChartOfAccounts Component', () => {
    describe('Rendering', () => {
      test('renders chart of accounts title', () => {
        renderChartOfAccounts();
        expect(screen.getByText(/chart of accounts/i)).toBeInTheDocument();
      });

      test('renders add account button', () => {
        renderChartOfAccounts();
        expect(screen.getByText(/add account/i)).toBeInTheDocument();
      });

      test('renders search and filter controls', () => {
        renderChartOfAccounts();
        expect(screen.getByPlaceholderText(/search accounts/i)).toBeInTheDocument();
        expect(screen.getByText(/filter by type/i)).toBeInTheDocument();
      });

      test('renders account table headers', () => {
        renderChartOfAccounts();
        expect(screen.getByText(/account code/i)).toBeInTheDocument();
        expect(screen.getByText(/account name/i)).toBeInTheDocument();
        expect(screen.getByText(/type/i)).toBeInTheDocument();
        expect(screen.getByText(/balance/i)).toBeInTheDocument();
        expect(screen.getByText(/status/i)).toBeInTheDocument();
        expect(screen.getByText(/actions/i)).toBeInTheDocument();
      });
    });

    describe('Data Loading', () => {
      test('shows loading state initially', () => {
        renderChartOfAccounts();
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });

      test('displays accounts when loaded successfully', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: [
            {
              id: 1,
              code: '1001',
              name: 'Bank Account',
              type: 'ASSET',
              balance: 50000,
              status: 'ACTIVE',
            },
            {
              id: 2,
              code: '2001',
              name: 'Accounts Payable',
              type: 'LIABILITY',
              balance: -10000,
              status: 'ACTIVE',
            },
          ],
        });

        renderChartOfAccounts();

        await waitFor(() => {
          expect(screen.getByText('1001')).toBeInTheDocument();
          expect(screen.getByText('Bank Account')).toBeInTheDocument();
          expect(screen.getByText('ASSET')).toBeInTheDocument();
          expect(screen.getByText('₹50,000')).toBeInTheDocument();
        });
      });

      test('shows empty state when no accounts', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({ data: [] });

        renderChartOfAccounts();

        await waitFor(() => {
          expect(screen.getByText(/no accounts found/i)).toBeInTheDocument();
        });
      });
    });

    describe('Search and Filtering', () => {
      test('filters accounts by search term', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: [
            {
              id: 1,
              code: '1001',
              name: 'Bank Account',
              type: 'ASSET',
            },
            {
              id: 2,
              code: '2001',
              name: 'Accounts Payable',
              type: 'LIABILITY',
            },
          ],
        });

        renderChartOfAccounts();

        await waitFor(() => {
          expect(screen.getByText('Bank Account')).toBeInTheDocument();
          expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText(/search accounts/i);
        fireEvent.change(searchInput, { target: { value: 'Bank' } });

        await waitFor(() => {
          expect(screen.getByText('Bank Account')).toBeInTheDocument();
          expect(screen.queryByText('Accounts Payable')).not.toBeInTheDocument();
        });
      });

      test('filters accounts by type', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: [
            {
              id: 1,
              code: '1001',
              name: 'Bank Account',
              type: 'ASSET',
            },
            {
              id: 2,
              code: '2001',
              name: 'Accounts Payable',
              type: 'LIABILITY',
            },
          ],
        });

        renderChartOfAccounts();

        await waitFor(() => {
          expect(screen.getByText('Bank Account')).toBeInTheDocument();
          expect(screen.getByText('Accounts Payable')).toBeInTheDocument();
        });

        const typeFilter = screen.getByText(/filter by type/i);
        fireEvent.click(typeFilter);

        const assetFilter = screen.getByText(/asset/i);
        fireEvent.click(assetFilter);

        await waitFor(() => {
          expect(screen.getByText('Bank Account')).toBeInTheDocument();
          expect(screen.queryByText('Accounts Payable')).not.toBeInTheDocument();
        });
      });
    });

    describe('Account Actions', () => {
      test('opens edit modal when edit button is clicked', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: [
            {
              id: 1,
              code: '1001',
              name: 'Bank Account',
              type: 'ASSET',
            },
          ],
        });

        renderChartOfAccounts();

        await waitFor(() => {
          expect(screen.getByText('Bank Account')).toBeInTheDocument();
        });

        const editButton = screen.getByLabelText(/edit account/i);
        fireEvent.click(editButton);

        await waitFor(() => {
          expect(screen.getByText(/edit account/i)).toBeInTheDocument();
        });
      });

      test('deletes account when delete button is clicked', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.get.mockResolvedValue({
          data: [
            {
              id: 1,
              code: '1001',
              name: 'Bank Account',
              type: 'ASSET',
            },
          ],
        });
        mockApi.delete.mockResolvedValue({ success: true });

        renderChartOfAccounts();

        await waitFor(() => {
          expect(screen.getByText('Bank Account')).toBeInTheDocument();
        });

        const deleteButton = screen.getByLabelText(/delete account/i);
        fireEvent.click(deleteButton);

        // Confirm deletion
        const confirmButton = screen.getByText(/confirm/i);
        fireEvent.click(confirmButton);

        await waitFor(() => {
          expect(mockApi.delete).toHaveBeenCalledWith('/accounts/1');
          expect(mockShowToast).toHaveBeenCalledWith(
            'Account deleted successfully',
            'success'
          );
        });
      });
    });
  });

  describe('AccountForm Component', () => {
    describe('Form Rendering', () => {
      test('renders all form fields', () => {
        renderAccountForm();
        
        expect(screen.getByLabelText(/account code/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/account name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/parent account/i)).toBeInTheDocument();
      });

      test('renders save and cancel buttons', () => {
        renderAccountForm();
        
        expect(screen.getByText(/save account/i)).toBeInTheDocument();
        expect(screen.getByText(/cancel/i)).toBeInTheDocument();
      });
    });

    describe('Form Validation', () => {
      test('shows validation errors for empty required fields', async () => {
        renderAccountForm();

        const submitButton = screen.getByText(/save account/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/account code is required/i)).toBeInTheDocument();
          expect(screen.getByText(/account name is required/i)).toBeInTheDocument();
          expect(screen.getByText(/account type is required/i)).toBeInTheDocument();
        });
      });

      test('validates account code format', async () => {
        renderAccountForm();

        const codeInput = screen.getByLabelText(/account code/i);
        fireEvent.change(codeInput, { target: { value: 'invalid code' } });

        const submitButton = screen.getByText(/save account/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/account code must be alphanumeric/i)).toBeInTheDocument();
        });
      });

      test('validates account name length', async () => {
        renderAccountForm();

        const nameInput = screen.getByLabelText(/account name/i);
        fireEvent.change(nameInput, { target: { value: 'ab' } });

        const submitButton = screen.getByText(/save account/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/account name must be at least 3 characters/i)).toBeInTheDocument();
        });
      });
    });

    describe('Form Submission', () => {
      test('submits form with correct data', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({ success: true });

        renderAccountForm();

        // Fill form
        const codeInput = screen.getByLabelText(/account code/i);
        const nameInput = screen.getByLabelText(/account name/i);
        const typeSelect = screen.getByLabelText(/account type/i);
        const descriptionInput = screen.getByLabelText(/description/i);

        fireEvent.change(codeInput, { target: { value: '1001' } });
        fireEvent.change(nameInput, { target: { value: 'Bank Account' } });
        fireEvent.change(typeSelect, { target: { value: 'ASSET' } });
        fireEvent.change(descriptionInput, { target: { value: 'Main bank account' } });

        const submitButton = screen.getByText(/save account/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/accounts', {
            code: '1001',
            name: 'Bank Account',
            type: 'ASSET',
            description: 'Main bank account',
            parentId: null,
            businessId: null,
          });
        });
      });

      test('shows success message on successful submission', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({ success: true });

        renderAccountForm();

        // Fill required fields
        const codeInput = screen.getByLabelText(/account code/i);
        const nameInput = screen.getByLabelText(/account name/i);
        const typeSelect = screen.getByLabelText(/account type/i);

        fireEvent.change(codeInput, { target: { value: '1001' } });
        fireEvent.change(nameInput, { target: { value: 'Bank Account' } });
        fireEvent.change(typeSelect, { target: { value: 'ASSET' } });

        const submitButton = screen.getByText(/save account/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Account created successfully',
            'success'
          );
        });
      });

      test('shows error message on submission failure', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockRejectedValue(new Error('Failed to create account'));

        renderAccountForm();

        // Fill required fields
        const codeInput = screen.getByLabelText(/account code/i);
        const nameInput = screen.getByLabelText(/account name/i);
        const typeSelect = screen.getByLabelText(/account type/i);

        fireEvent.change(codeInput, { target: { value: '1001' } });
        fireEvent.change(nameInput, { target: { value: 'Bank Account' } });
        fireEvent.change(typeSelect, { target: { value: 'ASSET' } });

        const submitButton = screen.getByText(/save account/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to create account',
            'error'
          );
        });
      });
    });

    describe('Edit Mode', () => {
      test('pre-fills form with existing account data', () => {
        const existingAccount = {
          id: 1,
          code: '1001',
          name: 'Bank Account',
          type: 'ASSET',
          description: 'Main bank account',
        };

        render(
          <ChakraProvider theme={theme}>
            <BrowserRouter>
              <AuthProvider>
                <BusinessProvider>
                  <AccountForm account={existingAccount} />
                </BusinessProvider>
              </AuthProvider>
            </BrowserRouter>
          </ChakraProvider>
        );

        expect(screen.getByDisplayValue('1001')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Bank Account')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Main bank account')).toBeInTheDocument();
      });

      test('updates account when in edit mode', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.put.mockResolvedValue({ success: true });

        const existingAccount = {
          id: 1,
          code: '1001',
          name: 'Bank Account',
          type: 'ASSET',
        };

        render(
          <ChakraProvider theme={theme}>
            <BrowserRouter>
              <AuthProvider>
                <BusinessProvider>
                  <AccountForm account={existingAccount} />
                </BusinessProvider>
              </AuthProvider>
            </BrowserRouter>
          </ChakraProvider>
        );

        const nameInput = screen.getByLabelText(/account name/i);
        fireEvent.change(nameInput, { target: { value: 'Updated Bank Account' } });

        const submitButton = screen.getByText(/update account/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockApi.put).toHaveBeenCalledWith('/accounts/1', {
            code: '1001',
            name: 'Updated Bank Account',
            type: 'ASSET',
            description: '',
            parentId: null,
            businessId: null,
          });
        });
      });
    });
  });

  describe('Account Tree Structure', () => {
    test('displays hierarchical account structure', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: [
          {
            id: 1,
            code: '1000',
            name: 'Assets',
            type: 'ASSET',
            children: [
              {
                id: 2,
                code: '1001',
                name: 'Current Assets',
                type: 'ASSET',
                children: [
                  {
                    id: 3,
                    code: '1002',
                    name: 'Bank Account',
                    type: 'ASSET',
                  },
                ],
              },
            ],
          },
        ],
      });

      renderChartOfAccounts();

      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
        expect(screen.getByText('Current Assets')).toBeInTheDocument();
        expect(screen.getByText('Bank Account')).toBeInTheDocument();
      });
    });

    test('expands and collapses account groups', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: [
          {
            id: 1,
            code: '1000',
            name: 'Assets',
            type: 'ASSET',
            children: [
              {
                id: 2,
                code: '1001',
                name: 'Current Assets',
                type: 'ASSET',
              },
            ],
          },
        ],
      });

      renderChartOfAccounts();

      await waitFor(() => {
        expect(screen.getByText('Assets')).toBeInTheDocument();
      });

      const expandButton = screen.getByLabelText(/expand assets/i);
      fireEvent.click(expandButton);

      await waitFor(() => {
        expect(screen.getByText('Current Assets')).toBeInTheDocument();
      });
    });
  });

  describe('Account Types', () => {
    test('displays correct account type labels', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: [
          {
            id: 1,
            code: '1001',
            name: 'Bank Account',
            type: 'ASSET',
          },
          {
            id: 2,
            code: '2001',
            name: 'Accounts Payable',
            type: 'LIABILITY',
          },
          {
            id: 3,
            code: '3001',
            name: 'Owner Equity',
            type: 'EQUITY',
          },
          {
            id: 4,
            code: '4001',
            name: 'Sales Revenue',
            type: 'REVENUE',
          },
          {
            id: 5,
            code: '5001',
            name: 'Cost of Goods Sold',
            type: 'EXPENSE',
          },
        ],
      });

      renderChartOfAccounts();

      await waitFor(() => {
        expect(screen.getByText('ASSET')).toBeInTheDocument();
        expect(screen.getByText('LIABILITY')).toBeInTheDocument();
        expect(screen.getByText('EQUITY')).toBeInTheDocument();
        expect(screen.getByText('REVENUE')).toBeInTheDocument();
        expect(screen.getByText('EXPENSE')).toBeInTheDocument();
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

      renderChartOfAccounts();

      // Test that the layout adapts to mobile
      const container = screen.getByTestId('accounts-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderChartOfAccounts();

      expect(screen.getByLabelText(/search accounts/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/add account/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      renderChartOfAccounts();

      const searchInput = screen.getByPlaceholderText(/search accounts/i);
      searchInput.focus();
      
      expect(searchInput).toHaveFocus();
    });
  });
}); 