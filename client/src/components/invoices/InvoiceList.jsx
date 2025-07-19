import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useDisclosure,
  Select,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { invoiceService } from '../../services/invoiceService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import InvoiceForm from './InvoiceForm';

const InvoiceList = () => {
  const { selectedBusiness } = useBusiness();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        businessId: selectedBusiness.id,
        status: statusFilter || undefined,
      };

      const response = await invoiceService.getAll(params);
      setInvoices(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBusiness) {
      fetchInvoices();
    }
  }, [selectedBusiness, statusFilter]);

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    onOpen();
  };

  const handleFormSubmit = () => {
    onClose();
    fetchInvoices();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'green';
      case 'SENT':
        return 'blue';
      case 'OVERDUE':
        return 'red';
      case 'DRAFT':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Invoices</Heading>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={handleCreate}
              >
                Create Invoice
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                <Select
                  placeholder="Filter by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  width="200px"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </Select>
              </HStack>

              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Invoice #</Th>
                      <Th>Customer</Th>
                      <Th>Issue Date</Th>
                      <Th>Due Date</Th>
                      <Th>Total Amount</Th>
                      <Th>Balance</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {invoices.map((invoice) => (
                      <Tr key={invoice.id}>
                        <Td fontWeight="medium">{invoice.invoiceNumber}</Td>
                        <Td>{invoice.Customer?.name || '-'}</Td>
                        <Td>{new Date(invoice.issueDate).toLocaleDateString()}</Td>
                        <Td>{new Date(invoice.dueDate).toLocaleDateString()}</Td>
                        <Td>{formatCurrency(invoice.totalAmount)}</Td>
                        <Td>{formatCurrency(invoice.balanceAmount)}</Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(invoice.status)}
                            variant="subtle"
                          >
                            {invoice.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<ViewIcon />}
                              size="sm"
                              variant="ghost"
                              aria-label="View invoice"
                              onClick={() => handleEdit(invoice)}
                            />
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              aria-label="Edit invoice"
                              onClick={() => handleEdit(invoice)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {invoices.length === 0 && (
                <Text textAlign="center" color="gray.500">
                  No invoices found
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <InvoiceForm
        isOpen={isOpen}
        onClose={onClose}
        invoice={selectedInvoice}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};

export default InvoiceList; 