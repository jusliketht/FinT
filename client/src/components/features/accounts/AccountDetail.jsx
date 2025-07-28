import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Card,
  SimpleGrid,
  Stat,
  StatLabel,
  Table,
  Alert,
  IconButton
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon } from '@chakra-ui/icons';
import { useApi } from '../../../hooks/useApi';
import { useToast } from '../../../contexts/ToastContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import { accountService } from '../../../services/accountService';
import { transactionService } from '../../../services/transactionService';

const AccountDetail = ({ accountId, isOpen, onClose }) => {
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchAccountDetails = useCallback(async () => {
    if (!accountId) return;
    
    try {
      setLoading(true);
      setError(null);
      const [accountResponse, transactionsResponse] = await Promise.all([
        accountService.getById(accountId),
        transactionService.getByAccount(accountId)
      ]);
      setAccount(accountResponse.data || accountResponse);
      setTransactions(transactionsResponse.data || transactionsResponse);
    } catch (err) {
      setError('Failed to fetch account details');
      toast({
        title: 'Error',
        description: 'Failed to load account details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [accountId, toast]);

  useEffect(() => {
    if (isOpen && accountId) {
      fetchAccountDetails();
    }
  }, [isOpen, accountId, fetchAccountDetails]);

  const handleEdit = () => {
    navigate(`/accounts/${id}/edit`);
  };

  const getAccountStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'asset': return 'blue';
      case 'liability': return 'red';
      case 'equity': return 'purple';
      case 'revenue': return 'green';
      case 'expense': return 'orange';
      default: return 'gray';
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!account) return <ErrorMessage message="Account not found" />;

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/accounts')}
            variant="ghost"
            aria-label="Go back"
          />
          <Heading size="lg">{account.name}</Heading>
        </HStack>
        <Button
          leftIcon={<EditIcon />}
          colorScheme="brand"
          onClick={handleEdit}
        >
          Edit Account
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Account Information</Heading>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Account Number</Text>
              <Text>{account.accountNumber}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Type</Text>
              <Badge colorScheme={getAccountTypeColor(account.type)}>
                {account.type}
              </Badge>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Category</Text>
              <Text>{account.category}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Status</Text>
              <Badge colorScheme={getAccountStatusColor(account.status)}>
                {account.status}
              </Badge>
            </Box>
            
            {account.description && (
              <Box>
                <Text fontWeight="bold" color="gray.600">Description</Text>
                <Text>{account.description}</Text>
              </Box>
            )}
          </VStack>
        </Card>

        <Card>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Financial Summary</Heading>
            
            <Stat>
              <StatLabel>Current Balance</StatLabel>
              <Text fontSize="2xl" fontWeight="bold" color={account.balance >= 0 ? "green.500" : "red.500"}>
                ₹{account.balance?.toFixed(2)}{' '}
                {account.balance >= 0 ? '↑' : '↓'}
              </Text>
            </Stat>
            
            <Box borderBottom="1px" borderColor="gray.200" />
            
            <Stat>
              <StatLabel>Opening Balance</StatLabel>
              <Text fontSize="2xl" fontWeight="bold">₹{account.openingBalance?.toFixed(2)}</Text>
            </Stat>
            
            <Stat>
              <StatLabel>Total Transactions</StatLabel>
              <Text fontSize="2xl" fontWeight="bold">{transactions.length}</Text>
            </Stat>
          </VStack>
        </Card>
      </SimpleGrid>

      <Card>
        <VStack spacing={4} align="stretch">
          <Heading size="md">Recent Transactions</Heading>
          
          {transactions.length === 0 ? (
            <Alert status="info">
              No transactions found for this account
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.date).toLocaleDateString()}</td>
                      <td>{transaction.description}</td>
                      <td>
                        <Badge colorScheme={transaction.type === 'credit' ? 'green' : 'red'}>
                          {transaction.type}
                        </Badge>
                      </td>
                      <td style={{ color: transaction.type === 'credit' ? 'green' : 'red', textAlign: 'right' }}>
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right' }}>₹{transaction.balance.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          )}
        </VStack>
      </Card>
    </VStack>
  );
};

export default AccountDetail;