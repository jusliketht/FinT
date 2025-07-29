import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBackIcon, EditIcon, DownloadIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

const AccountDetail = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const api = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const fetchAccountDetails = useCallback(async () => {
    if (!accountId) return;
    
    setLoading(true);
    try {
      const [accountResponse, transactionsResponse] = await Promise.all([
        api.get(`/accounting/accounts/${accountId}`),
        api.get(`/accounting/accounts/${accountId}/transactions`, {
          params: { limit: 10 }
        })
      ]);
      
      setAccount(accountResponse.data);
      setRecentTransactions(transactionsResponse.data);
    } catch (error) {
      console.error('Error fetching account details:', error);
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
  }, [accountId, api, toast]);

  useEffect(() => {
    fetchAccountDetails();
  }, [accountId, fetchAccountDetails]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getAccountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'asset': return 'blue';
      case 'liability': return 'red';
      case 'equity': return 'green';
      case 'revenue': return 'purple';
      case 'expense': return 'orange';
      default: return 'gray';
    }
  };

  const getTransactionTypeColor = (type) => {
    return type === 'credit' ? 'green' : 'red';
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading Account Details...</Text>
      </Box>
    );
  }

  if (!account) {
    return (
      <Alert status="error">
        <AlertIcon />
        Account not found.
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={4}>
            <Button
              leftIcon={<ArrowBackIcon />}
              onClick={() => navigate('/ledgers')}
              variant="outline"
            >
              Back to Ledgers
            </Button>
            <Box>
              <Heading size="lg" mb={2}>{account.code} - {account.name}</Heading>
              <Text color="gray.600">Account Details</Text>
            </Box>
          </HStack>
          <HStack spacing={3}>
            <Button
              leftIcon={<EditIcon />}
              onClick={() => navigate(`/accounts/edit/${accountId}`)}
              colorScheme="blue"
              variant="outline"
            >
              Edit Account
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              onClick={() => navigate(`/ledgers/general-ledger?accountId=${accountId}`)}
              colorScheme="green"
            >
              View Ledger
            </Button>
          </HStack>
        </HStack>

        {/* Account Summary */}
        <Card>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <HStack justify="space-between">
                <Box>
                  <Text fontSize="lg" fontWeight="bold">{account.name}</Text>
                  <Text fontSize="sm" color="gray.600">Account Code: {account.code}</Text>
                </Box>
                <Badge colorScheme={getAccountTypeColor(account.type)} size="lg">
                  {account.type}
                </Badge>
              </HStack>

              <StatGroup>
                <Stat>
                  <StatLabel>Current Balance</StatLabel>
                  <StatNumber color={account.balance >= 0 ? 'green.500' : 'red.500'}>
                    {formatCurrency(account.balance || 0)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Account Type</StatLabel>
                  <StatNumber>
                    <Badge colorScheme={getAccountTypeColor(account.type)}>
                      {account.type}
                    </Badge>
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Created</StatLabel>
                  <StatNumber fontSize="sm">
                    {formatDate(account.createdAt)}
                  </StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Last Updated</StatLabel>
                  <StatNumber fontSize="sm">
                    {formatDate(account.updatedAt)}
                  </StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </CardBody>
        </Card>

        {/* Account Details Tabs */}
        <Card>
          <CardBody>
            <Tabs variant="enclosed">
              <TabList>
                <Tab>Recent Transactions</Tab>
                <Tab>Account History</Tab>
                <Tab>Settings</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold">Recent Transactions</Text>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/ledgers/general-ledger?accountId=${accountId}`)}
                        colorScheme="blue"
                        variant="outline"
                      >
                        View All
                      </Button>
                    </HStack>

                    {recentTransactions.length > 0 ? (
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Date</Th>
                            <Th>Description</Th>
                            <Th>Type</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Reference</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {recentTransactions.map((transaction) => (
                            <Tr key={transaction.id}>
                              <Td>{formatDate(transaction.date)}</Td>
                              <Td>{transaction.description}</Td>
                              <Td>
                                <Badge colorScheme={getTransactionTypeColor(transaction.type)} size="sm">
                                  {transaction.type.toUpperCase()}
                                </Badge>
                              </Td>
                              <Td isNumeric color={getTransactionTypeColor(transaction.type) + '.500'} fontWeight="medium">
                                {formatCurrency(transaction.amount)}
                              </Td>
                              <Td>
                                <Text fontSize="sm" color="gray.600">
                                  {transaction.referenceNumber || '-'}
                                </Text>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    ) : (
                      <Alert status="info">
                        <AlertIcon />
                        No recent transactions found for this account.
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="lg" fontWeight="bold">Account History</Text>
                    <Alert status="info">
                      <AlertIcon />
                      Account history and audit trail features coming soon.
                    </Alert>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="lg" fontWeight="bold">Account Settings</Text>
                    <Alert status="info">
                      <AlertIcon />
                      Account settings and configuration options coming soon.
                    </Alert>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AccountDetail; 