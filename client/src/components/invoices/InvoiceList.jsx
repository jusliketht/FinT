import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  SimpleGrid,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import invoiceService from '../../services/invoiceService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import InvoiceForm from './InvoiceForm';

const InvoiceList = () => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await invoiceService.getAll();
      setInvoices(response.data || response);
    } catch (err) {
      setError('Failed to fetch invoices');
      toast({
        title: 'Error',
        description: 'Failed to load invoices',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchInvoices();
    }
  }, [selectedBusiness, fetchInvoices]);

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
    toast({
      title: 'Success',
      description: 'Invoice saved successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSendEmail = (invoice) => {
    toast({
      title: 'Email Sent',
      description: `Invoice ${invoice.invoiceNumber} sent to ${invoice.customer}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDownloadPDF = (invoice) => {
    toast({
      title: 'PDF Downloaded',
      description: `Invoice ${invoice.invoiceNumber} downloaded as PDF`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
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

  // Calculate summary stats
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOutstanding = totalAmount - totalPaid;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>Invoice Management</Heading>
            <Text color="gray.600">
              Create, manage, and track your invoices
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            size="lg"
            onClick={handleCreate}
          >
            Create Invoice
          </Button>
        </HStack>

        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Badge
                colorScheme="blue"
                size="sm"
                mb={2}
              >
                Total Invoices
              </Badge>
              <Heading size="md">{totalInvoices}</Heading>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Badge
                colorScheme="purple"
                size="sm"
                mb={2}
              >
                Total Amount
              </Badge>
              <Heading size="md">{formatCurrency(totalAmount)}</Heading>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Badge
                colorScheme="green"
                size="sm"
                mb={2}
              >
                Total Paid
              </Badge>
              <Heading size="md" color="green.500">{formatCurrency(totalPaid)}</Heading>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Badge
                colorScheme="red"
                size="sm"
                mb={2}
              >
                Outstanding
              </Badge>
              <Heading size="md" color="red.500">{formatCurrency(totalOutstanding)}</Heading>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Invoice List */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Search and Filter */}
              <HStack spacing={4}>
                <Box maxW="400px">
                  <Badge
                    colorScheme="blue"
                    size="sm"
                    mb={2}
                  >
                    Search Invoices
                  </Badge>
                  <InputGroup maxW="400px">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search invoices by number, customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </Box>

                <Select
                  placeholder="All Status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  maxW="200px"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </Select>

                <Button
                  leftIcon={<SettingsIcon />}
                  variant="outline"
                  size="md"
                >
                  More Filters
                </Button>
              </HStack>

              {/* Invoice Table */}
              <TableContainer>
                <Table variant="simple">
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
                        <Td>{invoice.customer}</Td>
                        <Td>{new Date(invoice.issueDate).toLocaleDateString()}</Td>
                        <Td>{new Date(invoice.dueDate).toLocaleDateString()}</Td>
                        <Td fontFamily="mono">{formatCurrency(invoice.totalAmount)}</Td>
                        <Td fontFamily="mono">{formatCurrency(invoice.balanceAmount)}</Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(invoice.status)}
                            size="sm"
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
                              colorScheme="blue"
                              aria-label="View invoice"
                              onClick={() => handleEdit(invoice)}
                            />
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="green"
                              aria-label="Edit invoice"
                              onClick={() => handleEdit(invoice)}
                            />
                            <IconButton
                              icon={<EmailIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="purple"
                              aria-label="Send email"
                              onClick={() => handleSendEmail(invoice)}
                            />
                            <IconButton
                              icon={<DownloadIcon />}
                              size="sm"
                              variant="ghost"
                              colorScheme="orange"
                              aria-label="Download PDF"
                              onClick={() => handleDownloadPDF(invoice)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Invoice Form Modal */}
      <InvoiceForm
        isOpen={isOpen}
        onClose={onClose}
        invoice={selectedInvoice}
        onSuccess={handleFormSubmit}
      />
    </Box>
  );
};

export default InvoiceList; 