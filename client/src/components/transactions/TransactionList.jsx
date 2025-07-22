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

const TransactionList = () => {
  const { selectedBusiness } = useBusiness();
  const { openEditTransaction } = useTransaction();
  const toast = useToast();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20
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

  // Sample data to match reference design
  const sampleTransactions = [
    {
      id: 1,
      date: '2024-04-24',
      description: 'Office Supplies',
      amount: 150,
      category: 'Supplies',
      status: 'paid'
    },
    {
      id: 2,
      date: '2024-02-28',
      description: 'Web Design Services',
      amount: 2000,
      category: 'Services',
      status: 'paid'
    },
    {
      id: 3,
      date: '2024-01-15',
      description: 'Software Subscription',
      amount: 99,
      category: 'Technology',
      status: 'pending'
    },
    {
      id: 4,
      date: '2024-01-10',
      description: 'Utilities',
      amount: 250,
      category: 'Utilities',
      status: 'paid'
    },
    {
      id: 5,
      date: '2024-01-05',
      description: 'Advertising',
      amount: 500,
      category: 'Marketing',
      status: 'overdue'
    }
  ];

  useEffect(() => {
    loadTransactions();
  }, [selectedBusiness]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      // For now, use sample data to match reference design
      setTransactions(sampleTransactions);
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
    openEditTransaction(transaction);
  };

  const handleDelete = async (transaction) => {
    if (!window.confirm(`Are you sure you want to delete this transaction: "${transaction.description}"?`)) {
      return;
    }

    try {
      // Remove from local state for now
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
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

  // Filter and sort transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = !searchQuery || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.referenceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.personEntity?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !transactionType || transaction.type === transactionType;
    const matchesCategory = !category || transaction.category === category;
    const matchesPerson = !personEntity || transaction.personEntity === personEntity;
    const matchesStatus = !reconciliationStatus || transaction.reconciliationStatus === reconciliationStatus;
    
    return matchesSearch && matchesType && matchesCategory && matchesPerson && matchesStatus;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'overdue':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" py={10}>
        <Spinner size="lg" />
      </Flex>
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
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
              <option value="Transfer">Transfer</option>
              <option value="Adjustment">Adjustment</option>
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
              {sortedTransactions.map((transaction) => (
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
                    {transaction.category}
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
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => handleEdit(transaction)}
                      >
                        Edit
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {/* Pagination */}
      <Flex justify="center" py={4}>
        <HStack spacing={2}>
          <Button size="sm" variant="outline">‹</Button>
          <Button size="sm" variant="outline">1</Button>
          <Button size="sm" variant="outline">2</Button>
          <Button size="sm" variant="outline">3</Button>
          <Button size="sm" variant="outline">›</Button>
        </HStack>
      </Flex>
    </VStack>
  );
};

export default TransactionList; 