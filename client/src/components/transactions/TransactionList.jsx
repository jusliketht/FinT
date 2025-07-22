import React, { useState, useEffect, useCallback } from 'react';
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
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Pagination,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import {
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ChevronDownIcon,
  SearchIcon,
  FilterIcon,
} from '@chakra-ui/icons';
import { useTransaction } from '../../contexts/TransactionContext';
import { useBusiness } from '../../contexts/BusinessContext';
import transactionService from '../../services/transactionService';
import journalEntryService from '../../services/journalEntryService';

const TransactionList = () => {
  const { selectedBusiness } = useBusiness();
  const { openEditTransaction } = useTransaction();
  const toast = useToast();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [category, setCategory] = useState('');
  const [personEntity, setPersonEntity] = useState('');
  const [reconciliationStatus, setReconciliationStatus] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchQuery, dateRange, transactionType, category, personEntity, reconciliationStatus, sortBy, sortOrder]);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const businessId = selectedBusiness?.id;
      
      if (!businessId) {
        setTransactions([]);
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
        return;
      }

      // Build filters object
      const filters = {
        businessId,
        search: searchQuery || undefined,
        dateRange: dateRange || undefined,
        type: transactionType || undefined,
        category: category || undefined,
        personEntity: personEntity || undefined,
        reconciliationStatus: reconciliationStatus || undefined,
        sortBy,
        sortOrder,
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const response = await transactionService.getAll(filters, {
        page: pagination.page,
        limit: pagination.limit
      });

      setTransactions(response.transactions || response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        totalPages: response.totalPages || Math.ceil((response.total || 0) / pagination.limit)
      }));
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Failed to load transactions');
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
  }, [selectedBusiness, searchQuery, dateRange, transactionType, category, personEntity, reconciliationStatus, sortBy, sortOrder, pagination.page, pagination.limit, toast]);

  const handleEdit = (transaction) => {
    openEditTransaction(transaction);
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Are you sure you want to delete this transaction: "${transaction.description}"?`)) {
      return;
    }

    try {
      await transactionService.delete(transaction.id);
      
      // Refresh the list
      loadTransactions();
      
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    if (typeof amount !== 'number') return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'posted':
      case 'paid':
        return 'green';
      case 'pending':
      case 'draft':
        return 'yellow';
      case 'overdue':
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const LoadingSkeleton = () => (
    <VStack spacing={4} align="stretch">
      {Array.from({ length: 5 }).map((_, index) => (
        <Flex key={index} align="center" p={4}>
          <Skeleton borderRadius="full" boxSize={8} mr={4} />
          <Box flex="1">
            <SkeletonText noOfLines={2} spacing={2} />
          </Box>
          <VStack align="end" spacing={1}>
            <Skeleton height="16px" width="80px" />
            <Skeleton height="16px" width="60px" />
          </VStack>
        </Flex>
      ))}
    </VStack>
  );

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Filter Bar */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>
            
            <Select
              placeholder="Date Range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </Select>
            
            <Select
              placeholder="Transaction Type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
              <option value="TRANSFER">Transfer</option>
              <option value="ADJUSTMENT">Adjustment</option>
            </Select>
            
            <Select
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Supplies">Supplies</option>
              <option value="Services">Services</option>
              <option value="Technology">Technology</option>
              <option value="Utilities">Utilities</option>
              <option value="Marketing">Marketing</option>
            </Select>
            
            <Select
              placeholder="Reconciliation Status"
              value={reconciliationStatus}
              onChange={(e) => setReconciliationStatus(e.target.value)}
            >
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </Select>
            
            <Select
              placeholder="Sort By"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <option value="date-desc">Date (Newest)</option>
              <option value="date-asc">Date (Oldest)</option>
              <option value="amount-desc">Amount (High to Low)</option>
              <option value="amount-asc">Amount (Low to High)</option>
              <option value="description-asc">Description (A-Z)</option>
              <option value="description-desc">Description (Z-A)</option>
            </Select>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Transaction Table */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody p={0}>
          {loading ? (
            <LoadingSkeleton />
          ) : transactions.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Category</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Reconciliation</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((transaction) => (
                  <Tr key={transaction.id}>
                    <Td fontSize="sm">
                      {formatDate(transaction.date)}
                    </Td>
                    <Td fontSize="sm">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{transaction.description}</Text>
                        {transaction.referenceNumber && (
                          <Text fontSize="xs" color="gray.500">
                            Ref: {transaction.referenceNumber}
                          </Text>
                        )}
                        {transaction.personEntity && (
                          <Text fontSize="xs" color="blue.500">
                            {transaction.personEntity}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td fontSize="sm">
                      {transaction.category || transaction.accountName}
                    </Td>
                    <Td fontSize="sm" fontFamily="mono">
                      {formatAmount(transaction.amount)}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getStatusColor(transaction.status)}
                        size="sm"
                      >
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={transaction.reconciliationStatus === 'verified' ? 'green' : 'orange'}
                        size="sm"
                        variant="subtle"
                      >
                        {transaction.reconciliationStatus === 'verified' ? 'Verified' : 'Unverified'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          icon={<EditIcon />}
                          onClick={() => handleEdit(transaction)}
                          aria-label="Edit transaction"
                        />
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          icon={<DeleteIcon />}
                          onClick={() => handleDelete(transaction)}
                          aria-label="Delete transaction"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Box p={8} textAlign="center">
              <Text color="gray.500" fontSize="lg" mb={2}>
                No transactions found
              </Text>
              <Text color="gray.400" fontSize="sm">
                {selectedBusiness ? 'Start by adding your first transaction' : 'Please select a business to view transactions'}
              </Text>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Flex justify="center" py={4}>
          <HStack spacing={2}>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              isDisabled={pagination.page <= 1}
            >
              ‹
            </Button>
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  size="sm"
                  variant={pagination.page === page ? "solid" : "outline"}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              isDisabled={pagination.page >= pagination.totalPages}
            >
              ›
            </Button>
          </HStack>
        </Flex>
      )}
    </VStack>
  );
};

export default TransactionList; 