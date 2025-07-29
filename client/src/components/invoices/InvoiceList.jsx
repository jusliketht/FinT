import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  IconButton,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  SettingsIcon,
  EmailIcon,
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../contexts/BusinessContext';
import { useToast } from '../../contexts/ToastContext';
import InvoiceForm from './InvoiceForm';

const InvoiceList = () => {
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with actual API call
      const response = await fetch(`/api/businesses/${selectedBusiness.id}/invoices`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.data || []);
      } else {
        throw new Error('Failed to fetch invoices');
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchInvoices();
    }
  }, [selectedBusiness, fetchInvoices]);

  const handleCreate = () => {
    setSelectedInvoice(null);
    onOpen();
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  const handleDelete = async (invoiceId) => {
    try {
      const response = await fetch(`/api/businesses/${selectedBusiness.id}/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast('Invoice deleted successfully', 'success');
        fetchInvoices();
      } else {
        throw new Error('Failed to delete invoice');
      }
    } catch (error) {
      showToast('Failed to delete invoice', 'error');
    }
  };

  const handleSendEmail = async (invoiceId) => {
    try {
      const response = await fetch(`/api/businesses/${selectedBusiness.id}/invoices/${invoiceId}/send`, {
        method: 'POST',
      });
      if (response.ok) {
        showToast('Invoice sent successfully', 'success');
      } else {
        throw new Error('Failed to send invoice');
      }
    } catch (error) {
      showToast('Failed to send invoice', 'error');
    }
  };

  const handleDownload = async (invoiceId) => {
    try {
      const response = await fetch(`/api/businesses/${selectedBusiness.id}/invoices/${invoiceId}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download invoice');
      }
    } catch (error) {
      showToast('Failed to download invoice', 'error');
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'gray',
      sent: 'blue',
      paid: 'green',
      overdue: 'red',
      cancelled: 'gray'
    };
    return colors[status] || 'gray';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading invoices...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>Error loading invoices</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              Invoices
            </Text>
            <Text color="gray.600">
              Manage customer invoices and payments
            </Text>
          </Box>
          <Button colorScheme="blue" onClick={handleCreate}>
            Create Invoice
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </HStack>

        {/* Invoice Table */}
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Invoice #</Th>
                <Th>Customer</Th>
                <Th>Date</Th>
                <Th>Due Date</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredInvoices.length === 0 ? (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
                    <Text color="gray.500">No invoices found</Text>
                  </Td>
                </Tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <Tr key={invoice.id}>
                    <Td>
                      <Text fontWeight="medium">{invoice.invoiceNumber}</Text>
                    </Td>
                    <Td>{invoice.customerName}</Td>
                    <Td>{formatDate(invoice.date)}</Td>
                    <Td>{formatDate(invoice.dueDate)}</Td>
                    <Td>
                      <Text fontWeight="medium">
                        {formatCurrency(invoice.totalAmount)}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={1}>
                        <IconButton
                          icon={<SettingsIcon />}
                          variant="ghost"
                          size="sm"
                          aria-label="Edit invoice"
                          onClick={() => handleEdit(invoice)}
                        />
                        <IconButton
                          icon={<EmailIcon />}
                          variant="ghost"
                          size="sm"
                          aria-label="Send invoice"
                          onClick={() => handleSendEmail(invoice.id)}
                        />
                        <IconButton
                          icon={<DownloadIcon />}
                          variant="ghost"
                          size="sm"
                          aria-label="Download invoice"
                          onClick={() => handleDownload(invoice.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </VStack>

      {/* Invoice Form Modal */}
      <InvoiceForm
        isOpen={isOpen}
        onClose={onClose}
        invoice={selectedInvoice}
        onSuccess={() => {
          onClose();
          fetchInvoices();
        }}
      />
    </Box>
  );
};

export default InvoiceList; 