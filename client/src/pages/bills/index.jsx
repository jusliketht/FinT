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
import CreateBillModal from '../../components/bills/CreateBillModal';
import BillDetailsModal from '../../components/bills/BillDetailsModal';
import { apiService } from '../../services/apiService';

const BillsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bills, setBills] = useState([]);
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

  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchBills();
    fetchStats();
  }, [currentPage, statusFilter]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await apiService.get(`/bills?${params}`);
      setBills(response.bills);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      showToast('Error fetching bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.get('/bills/stats');
      setStats(response);
    } catch (error) {
      showToast('Error fetching bill statistics', 'error');
    }
  };

  const handleCreateBill = async (billData) => {
    try {
      await apiService.post('/bills', billData);
      showToast('Bill created successfully', 'success');
      onCreateClose();
      fetchBills();
      fetchStats();
    } catch (error) {
      showToast('Error creating bill', 'error');
    }
  };

  const handleStatusUpdate = async (billId, newStatus) => {
    try {
      await apiService.put(`/bills/${billId}/status`, { status: newStatus });
      showToast('Bill status updated successfully', 'success');
      fetchBills();
      fetchStats();
    } catch (error) {
      showToast('Error updating bill status', 'error');
    }
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      await apiService.put(`/bills/${billId}/mark-paid`);
      showToast('Bill marked as paid successfully', 'success');
      fetchBills();
      fetchStats();
    } catch (error) {
      showToast('Error marking bill as paid', 'error');
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await apiService.delete(`/bills/${billId}`);
        showToast('Bill deleted successfully', 'success');
        fetchBills();
        fetchStats();
      } catch (error) {
        showToast('Error deleting bill', 'error');
      }
    }
  };

  const openBillDetails = (bill) => {
    setSelectedBill(bill);
    onDetailsOpen();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'RECEIVED': return 'blue';
      case 'PAID': return 'green';
      case 'OVERDUE': return 'red';
      case 'VOID': return 'blackAlpha';
      default: return 'gray';
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg">Bills</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onCreateOpen}
          >
            Create Bill
          </Button>
        </Flex>

        {/* Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
          <GridItem>
            <Stat>
              <StatLabel>Total Bills</StatLabel>
              <StatNumber>{stats.totalBills || 0}</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Paid Bills</StatLabel>
              <StatNumber color="green.500">{stats.paidBills || 0}</StatNumber>
              <StatHelpText>Payment Rate: {stats.paymentRate?.toFixed(1) || 0}%</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Overdue Bills</StatLabel>
              <StatNumber color="red.500">{stats.overdueBills || 0}</StatNumber>
              <StatHelpText>₹{stats.overdueAmount?.toLocaleString() || 0}</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Total Amount</StatLabel>
              <StatNumber>₹{stats.totalAmount?.toLocaleString() || 0}</StatNumber>
              <StatHelpText>₹{stats.paidAmount?.toLocaleString() || 0} paid</StatHelpText>
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
              placeholder="Search bills..."
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
            <option value="RECEIVED">Received</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="VOID">Void</option>
          </Select>
        </HStack>

        {/* Bills Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Bill #</Th>
                <Th>Vendor</Th>
                <Th>Issue Date</Th>
                <Th>Due Date</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredBills.map((bill) => (
                <Tr key={bill.id}>
                  <Td fontWeight="bold">{bill.billNumber}</Td>
                  <Td>{bill.vendorName}</Td>
                  <Td>{new Date(bill.issueDate).toLocaleDateString()}</Td>
                  <Td>{new Date(bill.dueDate).toLocaleDateString()}</Td>
                  <Td fontWeight="bold">₹{bill.totalAmount.toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(bill.status)}>
                      {bill.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Tooltip label="View Details">
                        <IconButton
                          size="sm"
                          icon={<ViewIcon />}
                          onClick={() => openBillDetails(bill)}
                        />
                      </Tooltip>
                      {bill.status === 'RECEIVED' && (
                        <Tooltip label="Mark as Paid">
                          <IconButton
                            size="sm"
                            colorScheme="green"
                            icon={<DownloadIcon />}
                            onClick={() => handleMarkAsPaid(bill.id)}
                          />
                        </Tooltip>
                      )}
                      {bill.status === 'DRAFT' && (
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
                              onClick={() => handleDeleteBill(bill.id)}
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
      <CreateBillModal
        isOpen={isCreateOpen}
        onClose={onCreateClose}
        onSubmit={handleCreateBill}
      />

      <BillDetailsModal
        isOpen={isDetailsOpen}
        onClose={onDetailsClose}
        bill={selectedBill}
        onStatusUpdate={handleStatusUpdate}
        onMarkAsPaid={handleMarkAsPaid}
      />
    </Container>
  );
};

export default BillsPage; 