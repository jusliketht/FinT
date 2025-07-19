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
} from '@chakra-ui/react';
import {
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ChevronDownIcon,
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20
  });

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
    setSelectedTransaction(transaction);
    onOpen();
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

  const handleFormSuccess = () => {
    onClose();
    setSelectedTransaction(null);
    loadTransactions();
  };

  const handleFormCancel = () => {
    onClose();
    setSelectedTransaction(null);
  };

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
    <Box>
      {/* Transaction Table */}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Description</Th>
            <Th>Category</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
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
                {transaction.description}
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
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => handleEdit(transaction)}
                  >
                    View
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

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

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={isOpen}
        onClose={handleFormCancel}
        transaction={selectedTransaction}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default TransactionList; 