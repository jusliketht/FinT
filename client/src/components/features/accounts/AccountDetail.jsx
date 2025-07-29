import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  IconButton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DownloadIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../../contexts/BusinessContext';
import { useToast } from '../../../contexts/ToastContext';

const AccountDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAccountDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockAccount = {
        id: id,
        code: '1000',
        name: 'Cash',
        type: 'ASSET',
        category: 'CURRENT_ASSET',
        description: 'Cash on hand and in bank accounts',
        balance: 15000.00,
        openingBalance: 10000.00,
        isActive: true,
        parentAccount: null,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };
      
      const mockTransactions = [
        {
          id: '1',
          date: '2025-01-01',
          description: 'Opening balance',
          reference: 'OB-001',
          debit: 10000.00,
          credit: 0.00,
          balance: 10000.00
        },
        {
          id: '2',
          date: '2025-01-15',
          description: 'Cash sale',
          reference: 'INV-001',
          debit: 5000.00,
          credit: 0.00,
          balance: 15000.00
        },
        {
          id: '3',
          date: '2025-01-20',
          description: 'Payment to supplier',
          reference: 'PAY-001',
          debit: 0.00,
          credit: 3000.00,
          balance: 12000.00
        },
        {
          id: '4',
          date: '2025-01-25',
          description: 'Customer payment',
          reference: 'REC-001',
          debit: 3000.00,
          credit: 0.00,
          balance: 15000.00
        }
      ];
      
      setAccount(mockAccount);
      setTransactions(mockTransactions);
    } catch (err) {
      setError('Failed to fetch account details');
      showToast('error', 'Failed to fetch account details');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    if (id && selectedBusiness) {
      fetchAccountDetails();
    }
  }, [id, selectedBusiness, fetchAccountDetails]);

  const handleEdit = () => {
    navigate(`/accounts/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/accounts');
  };

  const handleExport = (format) => {
    // Mock export functionality
    showToast('info', `Exporting account details in ${format} format...`);
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading account details...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!account) {
    return (
      <Alert status="info">
        <AlertIcon />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Account not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={4}>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={handleBack}
              variant="ghost"
              aria-label="Go back"
            />
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                {account.name}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Account Code: {account.code}
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            <Button
              leftIcon={<EditIcon />}
              colorScheme="blue"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              variant="outline"
              onClick={() => handleExport('PDF')}
            >
              Export
            </Button>
          </HStack>
        </HStack>

        {/* Account Summary */}
        <VStack spacing={4} align="stretch">
          <Stat>
            <StatLabel>Current Balance</StatLabel>
            <StatNumber>₹{account.balance.toLocaleString()}</StatNumber>
            <StatHelpText>
              {account.balance >= 0 ? 'Positive' : 'Negative'} balance
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Opening Balance</StatLabel>
            <StatNumber>₹{account.openingBalance.toLocaleString()}</StatNumber>
            <StatHelpText>
              Balance at start of period
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel>Net Change</StatLabel>
            <StatNumber color={account.balance - account.openingBalance >= 0 ? 'green.500' : 'red.500'}>
              ₹{(account.balance - account.openingBalance).toLocaleString()}
            </StatNumber>
            <StatHelpText>
              Change from opening balance
            </StatHelpText>
          </Stat>
        </VStack>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Account Information
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Account Code:</Text>
                <Text>{account.code}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Account Name:</Text>
                <Text>{account.name}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Type:</Text>
                <Badge
                  colorScheme={
                    account.type === 'ASSET' ? 'green' :
                    account.type === 'LIABILITY' ? 'red' :
                    account.type === 'EQUITY' ? 'blue' :
                    account.type === 'REVENUE' ? 'purple' : 'gray'
                  }
                  variant="subtle"
                >
                  {account.type}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Category:</Text>
                <Text>{account.category}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Status:</Text>
                <Badge
                  colorScheme={account.isActive ? 'green' : 'gray'}
                  variant="subtle"
                >
                  {account.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </HStack>
              
              {account.description && (
                <HStack justify="space-between">
                  <Text fontWeight="medium">Description:</Text>
                  <Text fontSize="sm" color="gray.600" maxW="300px">
                    {account.description}
                  </Text>
                </HStack>
              )}
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Created:</Text>
                <Text>{new Date(account.createdAt).toLocaleDateString()}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="semibold">
                Transaction History ({transactions.length})
              </Text>
              <Badge colorScheme="blue">
                Last 30 days
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Reference</Th>
                  <Th isNumeric>Debit</Th>
                  <Th isNumeric>Credit</Th>
                  <Th isNumeric>Balance</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((transaction) => (
                  <Tr key={transaction.id}>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">
                        {transaction.description}
                      </Text>
                    </Td>
                    <Td>
                      <Badge variant="outline" colorScheme="gray">
                        {transaction.reference}
                      </Badge>
                    </Td>
                    <Td isNumeric>
                      {transaction.debit > 0 ? (
                        <Text color="green.600" fontWeight="semibold">
                          ₹{transaction.debit.toLocaleString()}
                        </Text>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td isNumeric>
                      {transaction.credit > 0 ? (
                        <Text color="red.600" fontWeight="semibold">
                          ₹{transaction.credit.toLocaleString()}
                        </Text>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td isNumeric>
                      <Text fontWeight="bold">
                        ₹{transaction.balance.toLocaleString()}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default AccountDetail;