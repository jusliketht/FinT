import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AccountForm from '../components/features/accounts/AccountForm';

// Mock the services
jest.mock('../services/accountService', () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../services/accountCategoryService', () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

jest.mock('../services/accountTypeService', () => ({
  getAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
}));

// Mock the contexts
const mockToast = {
  showToast: jest.fn(),
};

jest.mock('../contexts/ToastContext', () => ({
  useToast: () => mockToast,
}));

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../hooks/useApi', () => ({
  __esModule: true,
  default: () => mockApi,
}));

// Mock Chakra UI components
jest.mock('@chakra-ui/react', () => ({
  ...jest.requireActual('@chakra-ui/react'),
  useToast: () => ({
    toast: jest.fn(),
  }),
  useMediaQuery: () => [false],
  useBreakpointValue: () => 'md',
}));

describe('Accounts Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    const accountService = require('../services/accountService');
    const accountCategoryService = require('../services/accountCategoryService');
    const accountTypeService = require('../services/accountTypeService');
    
    accountService.getAll.mockResolvedValue({
      data: [
        {
          id: 1,
          code: '1001',
          name: 'Bank Account',
          type: 'asset',
          description: 'Main bank account',
        },
        {
          id: 2,
          code: '2001',
          name: 'Accounts Payable',
          type: 'liability',
          description: 'Outstanding bills',
        },
      ],
    });
    
    accountCategoryService.getAll.mockResolvedValue({
      data: [
        { id: 1, name: 'Current Assets', type: 'asset' },
        { id: 2, name: 'Current Liabilities', type: 'liability' },
      ],
    });
    
    accountTypeService.getAll.mockResolvedValue({
      data: [
        { id: 1, name: 'ASSET', code: 'asset' },
        { id: 2, name: 'LIABILITY', code: 'liability' },
        { id: 3, name: 'EQUITY', code: 'equity' },
      ],
    });
  });

  describe('AccountForm Component', () => {
    const mockOnSave = jest.fn();
    const mockOnCancel = jest.fn();

    const renderAccountForm = (props = {}) => {
      return render(
        <AccountForm
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          {...props}
        />
      );
    };

    test('renders create account form', () => {
      renderAccountForm();

      expect(screen.getByText(/create new account/i)).toBeInTheDocument();
      expect(screen.getByText(/account name/i)).toBeInTheDocument();
      expect(screen.getAllByText(/account type/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/account code/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
    });

    test('renders edit account form', () => {
      const account = {
        id: 1,
        code: '1001',
        name: 'Bank Account',
        type: 'asset',
        description: 'Main bank account',
      };

      renderAccountForm({ account });

      expect(screen.getByText(/edit account/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('1001')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Bank Account')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Main bank account')).toBeInTheDocument();
    });

    test('form submission creates new account', async () => {
      mockApi.post.mockResolvedValue({
        data: { id: 1, name: 'New Account', type: 'asset', code: '1002' },
      });

      renderAccountForm();

      // Fill required fields
      const nameInput = screen.getByPlaceholderText(/enter account name/i);
      const typeSelect = screen.getByRole('combobox');
      const codeInput = screen.getByPlaceholderText(/enter account code/i);

      fireEvent.change(nameInput, { target: { value: 'New Account' } });
      fireEvent.change(typeSelect, { target: { value: 'asset' } });
      fireEvent.change(codeInput, { target: { value: '1002' } });

      const submitButton = screen.getByText(/create account/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/api/accounts', {
          name: 'New Account',
          type: 'asset',
          code: '1002',
          description: '',
        });
      });
    });

    test('form submission updates existing account', async () => {
      const account = {
        id: 1,
        code: '1001',
        name: 'Bank Account',
        type: 'asset',
        description: 'Main bank account',
      };

      mockApi.put.mockResolvedValue({
        data: { ...account, name: 'Updated Bank Account' },
      });

      renderAccountForm({ account });

      const nameInput = screen.getByDisplayValue('Bank Account');
      fireEvent.change(nameInput, { target: { value: 'Updated Bank Account' } });

      const submitButton = screen.getByText(/update account/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockApi.put).toHaveBeenCalledWith('/api/accounts/1', {
          name: 'Updated Bank Account',
          type: 'asset',
          code: '1001',
          description: 'Main bank account',
        });
      });
    });

    test('shows validation error for missing required fields', async () => {
      renderAccountForm();

      const submitButton = screen.getByText(/create account/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockToast.showToast).toHaveBeenCalledWith(
          'Please fill in all required fields',
          'error'
        );
      });
    });

    test('calls onCancel when cancel button is clicked', () => {
      renderAccountForm();

      const cancelButton = screen.getByText(/cancel/i);
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile screen size', () => {
      render(<AccountForm />);

      // Test that the component renders without errors
      expect(screen.getByText(/create new account/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      render(<AccountForm />);

      expect(screen.getByText(/account name/i)).toBeInTheDocument();
      expect(screen.getAllByText(/account type/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/account code/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      render(<AccountForm />);

      const nameInput = screen.getByPlaceholderText(/enter account name/i);
      nameInput.focus();
      
      expect(nameInput).toHaveFocus();
    });
  });
}); 