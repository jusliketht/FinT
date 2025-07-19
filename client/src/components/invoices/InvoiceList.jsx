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
  Heading,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useDisclosure,
  Select,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useToast,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  AddIcon, 
  EditIcon, 
  ViewIcon, 
  DownloadIcon,
  EmailIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { invoiceService } from '../../services/invoiceService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import InvoiceForm from './InvoiceForm';

const InvoiceList = () => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Sample data for demonstration
  const sampleInvoices = [
    {
      id: 1,
      invoiceNumber: 'INV-001',
      customer: 'Acme Corp',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      totalAmount: 5000,
      balanceAmount: 5000,
      status: 'SENT',
    },
    {
      id: 2,
      invoiceNumber: 'INV-002',
      customer: 'Tech Solutions',
      issueDate: '2024-01-20',
      dueDate: '2024-02-20',
      totalAmount: 7500,
      balanceAmount: 0,
      status: 'PAID',
    },
    {
      id: 3,
      invoiceNumber: 'INV-003',
      customer: 'Global Industries',
      issueDate: '2024-01-10',
      dueDate: '2024-02-10',
      totalAmount: 12000,
      balanceAmount: 12000,
      status: 'OVERDUE',
    },
  ];

  const fetchInvoices = async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError(null);

    try {
      // For now, use sample data
      setInvoices(sampleInvoices);
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
        <Flex justify="space-between" align="center">
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
        </Flex>

        {/* Summary Stats */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Invoices</StatLabel>
                <StatNumber>{totalInvoices}</StatNumber>
                <StatHelpText>All time</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Amount</StatLabel>
                <StatNumber>{formatCurrency(totalAmount)}</StatNumber>
                <StatHelpText>Gross amount</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Paid</StatLabel>
                <StatNumber color="green.500">{formatCurrency(totalPaid)}</StatNumber>
                <StatHelpText>Received payments</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Outstanding</StatLabel>
                <StatNumber color="red.500">{formatCurrency(totalOutstanding)}</StatNumber>
                <StatHelpText>Pending payments</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Invoice List */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Search and Filter */}
              <HStack spacing={4}>
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