import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  IconButton,
  useDisclosure,
  Input,
  Select,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useToast
} from '@chakra-ui/react';
import {
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ChevronDownIcon,
  SearchIcon,
  FilterIcon
} from '@chakra-ui/icons';
import TransactionForm from './TransactionForm';
import transactionService from '../../services/transactionService';
import { useBusiness } from '../../contexts/BusinessContext';

const TransactionList = () => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    transactionType: '',
    paymentMethod: '',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20
  });
  const [totalPages, setTotalPages] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, [filters, pagination, selectedBusiness]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        ...pagination,
        businessId: selectedBusiness?.id
      };

      const response = await transactionService.getAll(params);
      setTransactions(response.transactions);
      setTotalPages(response.totalPages);
      setTotalTransactions(response.total);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    onOpen();
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Are you sure you want to delete this transaction: "${transaction.description}"?`)) {
      return;
    }

    try {
      await transactionService.delete(transaction.id);
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      loadTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFormSuccess = () => {
    onClose();
    setSelectedTransaction(null);
    loadTransactions();
  };

  const handleFormCancel = () => {
    onClose();
    setSelectedTransaction(null);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'income':
        return 'green';
      case 'expense':
        return 'red';
      case 'transfer':
        return 'blue';
      case 'adjustment':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Cash',
      check: 'Check',
      bank_transfer: 'Bank Transfer',
      credit_card: 'Credit Card',
      debit_card: 'Debit Card',
      other: 'Other'
    };
    return labels[method] || method;
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      transactionType: '',
      paymentMethod: '',
      startDate: '',
      endDate: '',
      search: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text fontSize="2xl" fontWeight="bold">
          Transactions
        </Text>
        <Button
          colorScheme="blue"
          onClick={() => {
            setSelectedTransaction(null);
            onOpen();
          }}
        >
          Add Transaction
        </Button>
      </Flex>

      {/* Filters */}
      <Box mb={6} p={4} bg="gray.50" borderRadius="md">
        <Text fontSize="lg" fontWeight="semibold" mb={3}>
          Filters
        </Text>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>Search</Text>
              <Input
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                leftIcon={<SearchIcon />}
              />
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>Category</Text>
              <Select
                placeholder="All categories"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="Salary">Salary</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Housing">Housing</option>
                <option value="Utilities">Utilities</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Travel">Travel</option>
                <option value="Education">Education</option>
                <option value="Insurance">Insurance</option>
                <option value="Taxes">Taxes</option>
                <option value="Other Expenses">Other Expenses</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>Type</Text>
              <Select
                placeholder="All types"
                value={filters.transactionType}
                onChange={(e) => handleFilterChange('transactionType', e.target.value)}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="transfer">Transfer</option>
                <option value="adjustment">Adjustment</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>Payment Method</Text>
              <Select
                placeholder="All methods"
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="other">Other</option>
              </Select>
            </Box>
          </HStack>
          <HStack spacing={4}>
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>Start Date</Text>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>End Date</Text>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </Box>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Transactions Table */}
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        {loading ? (
          <Box p={8} textAlign="center">
            <Spinner size="lg" />
            <Text mt={2}>Loading transactions...</Text>
          </Box>
        ) : transactions.length === 0 ? (
          <Box p={8} textAlign="center">
            <Text color="gray.500">No transactions found</Text>
          </Box>
        ) : (
          <>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Description</Th>
                    <Th>Category</Th>
                    <Th>Type</Th>
                    <Th>Amount</Th>
                    <Th>Payment Method</Th>
                    <Th>Reference</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions.map((transaction) => (
                    <Tr key={transaction.id}>
                      <Td>{formatDate(transaction.date)}</Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{transaction.description}</Text>
                          {transaction.notes && (
                            <Text fontSize="sm" color="gray.600">
                              {transaction.notes}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="gray">{transaction.category}</Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={getTransactionTypeColor(transaction.transactionType)}>
                          {transaction.transactionType}
                        </Badge>
                      </Td>
                      <Td>
                        <Text
                          color={transaction.transactionType === 'income' ? 'green.600' : 'red.600'}
                          fontWeight="semibold"
                        >
                          {formatAmount(transaction.amount)}
                        </Text>
                      </Td>
                      <Td>
                        {transaction.paymentMethod && (
                          <Text fontSize="sm">{getPaymentMethodLabel(transaction.paymentMethod)}</Text>
                        )}
                      </Td>
                      <Td>
                        {transaction.reference && (
                          <Text fontSize="sm" color="gray.600">
                            {transaction.reference}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View details">
                            <IconButton
                              size="sm"
                              icon={<ViewIcon />}
                              onClick={() => handleEdit(transaction)}
                              aria-label="View transaction"
                            />
                          </Tooltip>
                          <Tooltip label="Edit transaction">
                            <IconButton
                              size="sm"
                              icon={<EditIcon />}
                              onClick={() => handleEdit(transaction)}
                              aria-label="Edit transaction"
                            />
                          </Tooltip>
                          <Tooltip label="Delete transaction">
                            <IconButton
                              size="sm"
                              icon={<DeleteIcon />}
                              onClick={() => handleDelete(transaction)}
                              colorScheme="red"
                              aria-label="Delete transaction"
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box p={4} borderTopWidth="1px">
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, totalTransactions)} of{' '}
                    {totalTransactions} transactions
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      isDisabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Text fontSize="sm">
                      Page {pagination.page} of {totalPages}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      isDisabled={pagination.page === totalPages}
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Transaction Form Modal */}
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="white"
            borderRadius="lg"
            p={6}
            maxW="90vw"
            w="full"
            maxH="90vh"
            overflowY="auto"
          >
            <TransactionForm
              transaction={selectedTransaction}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default TransactionList; 