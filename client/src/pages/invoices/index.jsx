import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, DownloadIcon, ViewIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import CreateInvoiceModal from '../../components/invoices/CreateInvoiceModal';
import InvoiceDetailsModal from '../../components/invoices/InvoiceDetailsModal';
import { apiService } from '../../services/apiService';

const InvoicesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const {
    isOpen: isCreateOpen,
    onOpen: onCreateOpen,
    onClose: onCreateClose,
  } = useDisclosure();

  const {
    isOpen: isDetailsOpen,
    onOpen: onDetailsOpen,
    onClose: onDetailsClose,
  } = useDisclosure();

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [currentPage, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await apiService.get(`/invoices?${params}`);
      setInvoices(response.invoices);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      showToast('Error fetching invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/invoices/stats');
      setStats(response);
    } catch (error) {
      showToast('Error fetching invoice statistics', 'error');
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      await apiService.post('/invoices', invoiceData);
      showToast('Invoice created successfully', 'success');
      onCreateClose();
      fetchInvoices();
      fetchStats();
    } catch (error) {
      showToast('Error creating invoice', 'error');
    }
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      await apiService.put(`/invoices/${invoiceId}/status`, { status: newStatus });
      showToast('Invoice status updated successfully', 'success');
      fetchInvoices();
      fetchStats();
    } catch (error) {
      showToast('Error updating invoice status', 'error');
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      await apiService.put(`/invoices/${invoiceId}/mark-paid`);
      showToast('Invoice marked as paid successfully', 'success');
      fetchInvoices();
      fetchStats();
    } catch (error) {
      showToast('Error marking invoice as paid', 'error');
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await apiService.delete(`/invoices/${invoiceId}`);
        showToast('Invoice deleted successfully', 'success');
        fetchInvoices();
        fetchStats();
      } catch (error) {
        showToast('Error deleting invoice', 'error');
      }
    }
  };

  const openInvoiceDetails = (invoice) => {
    setSelectedInvoice(invoice);
    onDetailsOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'SENT': return 'blue';
      case 'PAID': return 'green';
      case 'OVERDUE': return 'red';
      case 'VOID': return 'blackAlpha';
      default: return 'gray';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Invoices</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onCreateOpen}
          >
            Create Invoice
          </Button>
        </Flex>

        {/* Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <GridItem>
            <Stat>
              <StatLabel>Total Invoices</StatLabel>
              <StatNumber>{stats.totalInvoices || 0}</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Paid Invoices</StatLabel>
              <StatNumber color="green.500">{stats.paidInvoices || 0}</StatNumber>
              <StatHelpText>Collection Rate: {stats.collectionRate?.toFixed(1) || 0}%</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Overdue Invoices</StatLabel>
              <StatNumber color="red.500">{stats.overdueInvoices || 0}</StatNumber>
              <StatHelpText>₹{stats.overdueAmount?.toLocaleString() || 0}</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Total Amount</StatLabel>
              <StatNumber>₹{stats.totalAmount?.toLocaleString() || 0}</StatNumber>
              <StatHelpText>₹{stats.paidAmount?.toLocaleString() || 0} collected</StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        {/* Filters */}
        <HStack spacing={4}>
          <InputGroup maxW="300px">
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
            maxW="200px"
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="VOID">Void</option>
          </Select>
        </HStack>

        {/* Invoices Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Invoice #</Th>
                <Th>Customer</Th>
                <Th>Issue Date</Th>
                <Th>Due Date</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredInvoices.map((invoice) => (
                <Tr key={invoice.id}>
                  <Td fontWeight="bold">{invoice.invoiceNumber}</Td>
                  <Td>{invoice.customerName}</Td>
                  <Td>{new Date(invoice.issueDate).toLocaleDateString()}</Td>
                  <Td>{new Date(invoice.dueDate).toLocaleDateString()}</Td>
                  <Td fontWeight="bold">₹{invoice.totalAmount.toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="View Details">
                        <IconButton
                          size="sm"
                          icon={<ViewIcon />}
                          onClick={() => openInvoiceDetails(invoice)}
                        />
                      </Tooltip>
                      {invoice.status === 'SENT' && (
                        <Tooltip label="Mark as Paid">
                          <IconButton
                            size="sm"
                            colorScheme="green"
                            icon={<DownloadIcon />}
                            onClick={() => handleMarkAsPaid(invoice.id)}
                          />
                        </Tooltip>
                      )}
                      {invoice.status === 'DRAFT' && (
                        <>
                          <Tooltip label="Edit">
                            <IconButton
                              size="sm"
                              colorScheme="blue"
                              icon={<EditIcon />}
                            />
                          </Tooltip>
                          <Tooltip label="Delete">
                            <IconButton
                              size="sm"
                              colorScheme="red"
                              icon={<DeleteIcon />}
                              onClick={() => handleDeleteInvoice(invoice.id)}
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <HStack justify="center" spacing={2}>
            <Button
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text>Page {currentPage} of {totalPages}</Text>
            <Button
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSubmit={handleCreateInvoice}
      />

      <InvoiceDetailsModal
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        invoice={selectedInvoice}
        onStatusUpdate={handleStatusUpdate}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </Container>
  );
};

export default InvoicesPage; 