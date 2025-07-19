import React, { useState, useEffect } from 'react';
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
  Input,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  Pagination,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon, ViewIcon, RepeatIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

const GeneralLedger = () => {
  const api = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [ledgerData, setLedgerData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchAccounts = async () => {
    try {
      const response = await api.get('/accounting/accounts');
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchLedger = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const response = await api.get('/accounting/reports/general-ledger', {
        params: {
          accountId: selectedAccount,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          page: currentPage,
          limit: pageSize,
          search: searchTerm
        }
      });
      setLedgerData(response.data);
    } catch (error) {
      console.error('Error fetching general ledger:', error);
      toast({
        title: 'Error',
        description: 'Failed to load general ledger',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchLedger();
    }
  }, [selectedAccount, dateRange, currentPage, pageSize, searchTerm]);

  const handleGenerate = () => {
    fetchLedger();
  };

  const handleExport = async (format) => {
    if (!selectedAccount) {
      toast({
        title: 'No Account Selected',
        description: 'Please select an account to export',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await api.get('/accounting/reports/general-ledger/export', {
        params: {
          accountId: selectedAccount,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `general-ledger-${selectedAccount}-${dateRange.startDate}-${dateRange.endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export ledger',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getTransactionTypeColor = (type) => {
    return type === 'credit' ? 'green' : 'red';
  };

  const calculateRunningBalance = (transactions) => {
    if (!transactions) return [];
    
    let balance = 0;
    return transactions.map((transaction, index) => {
      if (transaction.type === 'credit') {
        balance += transaction.amount;
      } else {
        balance -= transaction.amount;
      }
      return {
        ...transaction,
        runningBalance: balance
      };
    });
  };

  const filteredAccounts = accounts.filter(account =>
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAccountData = accounts.find(acc => acc.id === selectedAccount);

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading General Ledger...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>General Ledger</Heading>
            <Text color="gray.600">
              Detailed transaction history for selected account
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={handleGenerate}
              colorScheme="blue"
              variant="outline"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              onClick={() => handleExport('pdf')}
              colorScheme="green"
              isDisabled={!selectedAccount}
            >
              Export PDF
            </Button>
            <Button
              leftIcon={<ViewIcon />}
              onClick={() => window.print()}
              colorScheme="purple"
            >
              Print
            </Button>
          </HStack>
        </HStack>

        {/* Controls */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Account Selection */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>Select Account</Text>
                <Select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  placeholder="Choose an account"
                >
                  {filteredAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* Date Range */}
              <HStack spacing={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Start Date</Text>
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    size="sm"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>End Date</Text>
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    size="sm"
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1}>Page Size</Text>
                  <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    size="sm"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Select>
                </Box>
              </HStack>

              {/* Search */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Search Transactions</Text>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search by description, reference, or amount..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Account Summary */}
        {selectedAccountData && (
          <Card>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Heading size="md">{selectedAccountData.code} - {selectedAccountData.name}</Heading>
                <StatGroup>
                  <Stat>
                    <StatLabel>Account Type</StatLabel>
                    <StatNumber>
                      <Badge colorScheme="blue" fontSize="sm">
                        {selectedAccountData.type}
                      </Badge>
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Opening Balance</StatLabel>
                    <StatNumber color="blue.500">
                      {formatCurrency(ledgerData?.openingBalance || 0)}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Debits</StatLabel>
                    <StatNumber color="red.500">
                      {formatCurrency(ledgerData?.totalDebits || 0)}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Credits</StatLabel>
                    <StatNumber color="green.500">
                      {formatCurrency(ledgerData?.totalCredits || 0)}
                    </StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Closing Balance</StatLabel>
                    <StatNumber color="purple.500">
                      {formatCurrency(ledgerData?.closingBalance || 0)}
                    </StatNumber>
                  </Stat>
                </StatGroup>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Ledger Table */}
        {ledgerData && selectedAccount ? (
          <Card>
            <CardBody>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Description</Th>
                    <Th>Reference</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Debit</Th>
                    <Th isNumeric>Credit</Th>
                    <Th isNumeric>Balance</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {calculateRunningBalance(ledgerData.transactions).map((transaction, index) => (
                    <Tr key={transaction.id || index}>
                      <Td>{formatDate(transaction.date)}</Td>
                      <Td>{transaction.description}</Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {transaction.referenceNumber || '-'}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getTransactionTypeColor(transaction.type)} size="sm">
                          {transaction.type.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td isNumeric color="red.500" fontWeight="medium">
                        {transaction.type === 'debit' ? formatCurrency(transaction.amount) : '-'}
                      </Td>
                      <Td isNumeric color="green.500" fontWeight="medium">
                        {transaction.type === 'credit' ? formatCurrency(transaction.amount) : '-'}
                      </Td>
                      <Td isNumeric fontWeight="bold" color={transaction.runningBalance >= 0 ? 'green.600' : 'red.600'}>
                        {formatCurrency(transaction.runningBalance)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Pagination */}
              {ledgerData.totalPages > 1 && (
                <Box mt={4} display="flex" justifyContent="center">
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      isDisabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Text fontSize="sm">
                      Page {currentPage} of {ledgerData.totalPages}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(ledgerData.totalPages, prev + 1))}
                      isDisabled={currentPage === ledgerData.totalPages}
                    >
                      Next
                    </Button>
                  </HStack>
                </Box>
              )}
            </CardBody>
          </Card>
        ) : (
          <Alert status="info">
            <AlertIcon />
            Please select an account to view its general ledger.
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default GeneralLedger; 