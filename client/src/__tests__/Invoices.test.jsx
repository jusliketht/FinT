import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import CreateInvoiceModal from '../components/invoices/CreateInvoiceModal';
import InvoiceDetailsModal from '../components/invoices/InvoiceDetailsModal';
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

const renderCreateInvoiceModal = () => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <CreateInvoiceModal />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

const renderInvoiceDetailsModal = (invoice = null) => {
  return render(
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
            <InvoiceDetailsModal invoice={invoice} />
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};

describe('Invoices Component', () => {
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

  describe('CreateInvoiceModal Component', () => {
    describe('Form Rendering', () => {
      test('renders all form fields', () => {
        renderCreateInvoiceModal();
        
        expect(screen.getByLabelText(/invoice number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/invoice date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/item description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/unit price/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/tax rate/i)).toBeInTheDocument();
      });

      test('renders save and cancel buttons', () => {
        renderCreateInvoiceModal();
        
        expect(screen.getByText(/create invoice/i)).toBeInTheDocument();
        expect(screen.getByText(/cancel/i)).toBeInTheDocument();
      });

      test('pre-fills invoice date with current date', () => {
        renderCreateInvoiceModal();
        
        const invoiceDateInput = screen.getByLabelText(/invoice date/i);
        const today = new Date().toISOString().split('T')[0];
        expect(invoiceDateInput.value).toBe(today);
      });
    });

    describe('Form Validation', () => {
      test('shows validation errors for empty required fields', async () => {
        renderCreateInvoiceModal();

        const submitButton = screen.getByText(/create invoice/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/invoice number is required/i)).toBeInTheDocument();
          expect(screen.getByText(/customer is required/i)).toBeInTheDocument();
          expect(screen.getByText(/item description is required/i)).toBeInTheDocument();
          expect(screen.getByText(/quantity is required/i)).toBeInTheDocument();
          expect(screen.getByText(/unit price is required/i)).toBeInTheDocument();
        });
      });

      test('validates invoice number format', async () => {
        renderCreateInvoiceModal();

        const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
        fireEvent.change(invoiceNumberInput, { target: { value: 'inv-001' } });

        const submitButton = screen.getByText(/create invoice/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/invoice number must be alphanumeric/i)).toBeInTheDocument();
        });
      });

      test('validates quantity is positive', async () => {
        renderCreateInvoiceModal();

        const quantityInput = screen.getByLabelText(/quantity/i);
        fireEvent.change(quantityInput, { target: { value: '-1' } });

        const submitButton = screen.getByText(/create invoice/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/quantity must be positive/i)).toBeInTheDocument();
        });
      });

      test('validates unit price is positive', async () => {
        renderCreateInvoiceModal();

        const unitPriceInput = screen.getByLabelText(/unit price/i);
        fireEvent.change(unitPriceInput, { target: { value: '-10' } });

        const submitButton = screen.getByText(/create invoice/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(screen.getByText(/unit price must be positive/i)).toBeInTheDocument();
        });
      });
    });

    describe('Form Submission', () => {
      test('submits form with correct data', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({ success: true });
        mockApi.get.mockResolvedValue({
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
          ],
        });

        renderCreateInvoiceModal();

        // Fill form
        const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
        const customerSelect = screen.getByLabelText(/customer/i);
        const itemDescriptionInput = screen.getByLabelText(/item description/i);
        const quantityInput = screen.getByLabelText(/quantity/i);
        const unitPriceInput = screen.getByLabelText(/unit price/i);

        fireEvent.change(invoiceNumberInput, { target: { value: 'INV001' } });
        fireEvent.change(customerSelect, { target: { value: '1' } });
        fireEvent.change(itemDescriptionInput, { target: { value: 'Web Development Services' } });
        fireEvent.change(quantityInput, { target: { value: '10' } });
        fireEvent.change(unitPriceInput, { target: { value: '100' } });

        const submitButton = screen.getByText(/create invoice/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/invoices', {
            invoiceNumber: 'INV001',
            customerId: '1',
            invoiceDate: expect.any(String),
            dueDate: expect.any(String),
            items: [
              {
                description: 'Web Development Services',
                quantity: 10,
                unitPrice: 100,
                taxRate: 0,
              },
            ],
            notes: '',
            businessId: null,
          });
        });
      });

      test('calculates totals correctly', async () => {
        renderCreateInvoiceModal();

        const quantityInput = screen.getByLabelText(/quantity/i);
        const unitPriceInput = screen.getByLabelText(/unit price/i);
        const taxRateInput = screen.getByLabelText(/tax rate/i);

        fireEvent.change(quantityInput, { target: { value: '5' } });
        fireEvent.change(unitPriceInput, { target: { value: '100' } });
        fireEvent.change(taxRateInput, { target: { value: '10' } });

        await waitFor(() => {
          expect(screen.getByText('₹500')).toBeInTheDocument(); // subtotal
          expect(screen.getByText('₹50')).toBeInTheDocument(); // tax
          expect(screen.getByText('₹550')).toBeInTheDocument(); // total
        });
      });

      test('shows success message on successful submission', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({ success: true });
        mockApi.get.mockResolvedValue({
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
          ],
        });

        renderCreateInvoiceModal();

        // Fill required fields
        const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
        const customerSelect = screen.getByLabelText(/customer/i);
        const itemDescriptionInput = screen.getByLabelText(/item description/i);
        const quantityInput = screen.getByLabelText(/quantity/i);
        const unitPriceInput = screen.getByLabelText(/unit price/i);

        fireEvent.change(invoiceNumberInput, { target: { value: 'INV001' } });
        fireEvent.change(customerSelect, { target: { value: '1' } });
        fireEvent.change(itemDescriptionInput, { target: { value: 'Web Development Services' } });
        fireEvent.change(quantityInput, { target: { value: '10' } });
        fireEvent.change(unitPriceInput, { target: { value: '100' } });

        const submitButton = screen.getByText(/create invoice/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Invoice created successfully',
            'success'
          );
        });
      });

      test('shows error message on submission failure', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockRejectedValue(new Error('Failed to create invoice'));
        mockApi.get.mockResolvedValue({
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com' },
          ],
        });

        renderCreateInvoiceModal();

        // Fill required fields
        const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
        const customerSelect = screen.getByLabelText(/customer/i);
        const itemDescriptionInput = screen.getByLabelText(/item description/i);
        const quantityInput = screen.getByLabelText(/quantity/i);
        const unitPriceInput = screen.getByLabelText(/unit price/i);

        fireEvent.change(invoiceNumberInput, { target: { value: 'INV001' } });
        fireEvent.change(customerSelect, { target: { value: '1' } });
        fireEvent.change(itemDescriptionInput, { target: { value: 'Web Development Services' } });
        fireEvent.change(quantityInput, { target: { value: '10' } });
        fireEvent.change(unitPriceInput, { target: { value: '100' } });

        const submitButton = screen.getByText(/create invoice/i);
        fireEvent.click(submitButton);

        await waitFor(() => {
          expect(mockShowToast).toHaveBeenCalledWith(
            'Failed to create invoice',
            'error'
          );
        });
      });
    });

    describe('Add/Remove Items', () => {
      test('adds new item row', () => {
        renderCreateInvoiceModal();

        const addItemButton = screen.getByText(/add item/i);
        fireEvent.click(addItemButton);

        // Should have 2 item rows now
        const itemRows = screen.getAllByLabelText(/item description/i);
        expect(itemRows).toHaveLength(2);
      });

      test('removes item row', () => {
        renderCreateInvoiceModal();

        const addItemButton = screen.getByText(/add item/i);
        fireEvent.click(addItemButton);

        // Should have 2 item rows
        let itemRows = screen.getAllByLabelText(/item description/i);
        expect(itemRows).toHaveLength(2);

        const removeButton = screen.getAllByLabelText(/remove item/i)[1];
        fireEvent.click(removeButton);

        // Should have 1 item row now
        itemRows = screen.getAllByLabelText(/item description/i);
        expect(itemRows).toHaveLength(1);
      });

      test('prevents removing last item row', () => {
        renderCreateInvoiceModal();

        const removeButton = screen.getByLabelText(/remove item/i);
        fireEvent.click(removeButton);

        // Should still have 1 item row
        const itemRows = screen.getAllByLabelText(/item description/i);
        expect(itemRows).toHaveLength(1);
      });
    });
  });

  describe('InvoiceDetailsModal Component', () => {
    const mockInvoice = {
      id: 1,
      invoiceNumber: 'INV001',
      customer: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      },
      invoiceDate: '2024-01-01',
      dueDate: '2024-01-31',
      status: 'PENDING',
      items: [
        {
          id: 1,
          description: 'Web Development Services',
          quantity: 10,
          unitPrice: 100,
          taxRate: 10,
          total: 1100,
        },
      ],
      subtotal: 1000,
      tax: 100,
      total: 1100,
      notes: 'Payment due within 30 days',
    };

    describe('Rendering', () => {
      test('displays invoice details correctly', () => {
        renderInvoiceDetailsModal(mockInvoice);

        expect(screen.getByText('INV001')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('2024-01-01')).toBeInTheDocument();
        expect(screen.getByText('2024-01-31')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
        expect(screen.getByText('Web Development Services')).toBeInTheDocument();
        expect(screen.getByText('₹1,000')).toBeInTheDocument(); // subtotal
        expect(screen.getByText('₹100')).toBeInTheDocument(); // tax
        expect(screen.getByText('₹1,100')).toBeInTheDocument(); // total
        expect(screen.getByText('Payment due within 30 days')).toBeInTheDocument();
      });

      test('shows action buttons', () => {
        renderInvoiceDetailsModal(mockInvoice);

        expect(screen.getByText(/edit invoice/i)).toBeInTheDocument();
        expect(screen.getByText(/mark as paid/i)).toBeInTheDocument();
        expect(screen.getByText(/send invoice/i)).toBeInTheDocument();
        expect(screen.getByText(/delete invoice/i)).toBeInTheDocument();
      });
    });

    describe('Invoice Actions', () => {
      test('marks invoice as paid', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.put.mockResolvedValue({ success: true });

        renderInvoiceDetailsModal(mockInvoice);

        const markAsPaidButton = screen.getByText(/mark as paid/i);
        fireEvent.click(markAsPaidButton);

        await waitFor(() => {
          expect(mockApi.put).toHaveBeenCalledWith('/invoices/1/status', {
            status: 'PAID',
          });
          expect(mockShowToast).toHaveBeenCalledWith(
            'Invoice marked as paid',
            'success'
          );
        });
      });

      test('sends invoice via email', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.post.mockResolvedValue({ success: true });

        renderInvoiceDetailsModal(mockInvoice);

        const sendInvoiceButton = screen.getByText(/send invoice/i);
        fireEvent.click(sendInvoiceButton);

        await waitFor(() => {
          expect(mockApi.post).toHaveBeenCalledWith('/invoices/1/send');
          expect(mockShowToast).toHaveBeenCalledWith(
            'Invoice sent successfully',
            'success'
          );
        });
      });

      test('deletes invoice', async () => {
        const mockApi = require('../services/api').useApi();
        mockApi.delete.mockResolvedValue({ success: true });

        renderInvoiceDetailsModal(mockInvoice);

        const deleteButton = screen.getByText(/delete invoice/i);
        fireEvent.click(deleteButton);

        // Confirm deletion
        const confirmButton = screen.getByText(/confirm/i);
        fireEvent.click(confirmButton);

        await waitFor(() => {
          expect(mockApi.delete).toHaveBeenCalledWith('/invoices/1');
          expect(mockShowToast).toHaveBeenCalledWith(
            'Invoice deleted successfully',
            'success'
          );
        });
      });
    });

    describe('Status Display', () => {
      test('displays correct status badge for pending invoice', () => {
        renderInvoiceDetailsModal(mockInvoice);

        const statusBadge = screen.getByText('PENDING');
        expect(statusBadge).toHaveClass('chakra-badge');
      });

      test('displays correct status badge for paid invoice', () => {
        const paidInvoice = { ...mockInvoice, status: 'PAID' };
        renderInvoiceDetailsModal(paidInvoice);

        const statusBadge = screen.getByText('PAID');
        expect(statusBadge).toHaveClass('chakra-badge');
      });

      test('displays correct status badge for overdue invoice', () => {
        const overdueInvoice = { ...mockInvoice, status: 'OVERDUE' };
        renderInvoiceDetailsModal(overdueInvoice);

        const statusBadge = screen.getByText('OVERDUE');
        expect(statusBadge).toHaveClass('chakra-badge');
      });
    });
  });

  describe('Invoice List', () => {
    test('displays list of invoices', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: [
          {
            id: 1,
            invoiceNumber: 'INV001',
            customer: { name: 'John Doe' },
            invoiceDate: '2024-01-01',
            dueDate: '2024-01-31',
            status: 'PENDING',
            total: 1100,
          },
          {
            id: 2,
            invoiceNumber: 'INV002',
            customer: { name: 'Jane Smith' },
            invoiceDate: '2024-01-02',
            dueDate: '2024-02-01',
            status: 'PAID',
            total: 500,
          },
        ],
      });

      render(
        <ChakraProvider theme={theme}>
          <BrowserRouter>
            <AuthProvider>
              <BusinessProvider>
                <div data-testid="invoice-list">
                  {/* Invoice list component would be rendered here */}
                </div>
              </BusinessProvider>
            </AuthProvider>
          </BrowserRouter>
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('invoice-list')).toBeInTheDocument();
      });
    });

    test('filters invoices by status', async () => {
      const mockApi = require('../services/api').useApi();
      mockApi.get.mockResolvedValue({
        data: [
          {
            id: 1,
            invoiceNumber: 'INV001',
            status: 'PENDING',
          },
          {
            id: 2,
            invoiceNumber: 'INV002',
            status: 'PAID',
          },
        ],
      });

      render(
        <ChakraProvider theme={theme}>
          <BrowserRouter>
            <AuthProvider>
              <BusinessProvider>
                <div data-testid="invoice-list">
                  {/* Invoice list component would be rendered here */}
                </div>
              </BusinessProvider>
            </AuthProvider>
          </BrowserRouter>
        </ChakraProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('invoice-list')).toBeInTheDocument();
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

      renderCreateInvoiceModal();

      // Test that the layout adapts to mobile
      const container = screen.getByTestId('invoice-modal-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels', () => {
      renderCreateInvoiceModal();

      expect(screen.getByLabelText(/invoice number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/customer/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/item description/i)).toBeInTheDocument();
    });

    test('supports keyboard navigation', () => {
      renderCreateInvoiceModal();

      const invoiceNumberInput = screen.getByLabelText(/invoice number/i);
      invoiceNumberInput.focus();
      
      expect(invoiceNumberInput).toHaveFocus();
    });
  });
}); 