import React, { useState, useEffect, useCallback } from 'react';

import {
  AddIcon,
  DownloadIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Stat,
  StatArrow,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';

import { useBusiness } from '../contexts/BusinessContext';
import { useTransaction } from '../contexts/TransactionContext';
import TransactionList from '../components/transactions/TransactionList';
import { analyticsService } from '../services/analyticsService';
import transactionService from '../services/transactionService';

const TransactionsPage = () => {
  const { selectedBusiness } = useBusiness();
  const { openAddTransaction } = useTransaction();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkActions, setBulkActions] = useState('');
  const [loading, setLoading] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    paidTransactions: 0,
    pendingTransactions: 0,
    overdueTransactions: 0,
  });

  const loadSummaryStats = useCallback(async () => {
    if (!selectedBusiness?.id) {
      setSummaryStats({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        paidTransactions: 0,
        pendingTransactions: 0,
        overdueTransactions: 0,
      });
      return;
    }

    setLoading(true);
    try {
      const [transactionStats, kpis] = await Promise.all([
        transactionService.getStats(selectedBusiness.id),
        analyticsService.getKPIs(selectedBusiness.id, 'current'),
      ]);

      setSummaryStats({
        totalIncome: kpis.revenue || transactionStats.totalIncome || 0,
        totalExpenses: kpis.expenses || transactionStats.totalExpenses || 0,
        netBalance: kpis.profit || (transactionStats.totalIncome - transactionStats.totalExpenses) || 0,
        paidTransactions: transactionStats.paidTransactions || 0,
        pendingTransactions: transactionStats.pendingTransactions || 0,
        overdueTransactions: transactionStats.overdueTransactions || 0,
      });
    } catch (error) {
      console.error('Error loading summary stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction summary',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, toast]);

  useEffect(() => {
    loadSummaryStats();
  }, [loadSummaryStats]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }, []);

  return (
    <Flex h="calc(100vh - 64px)">
      {/* Main Content Area */}
      <Box flex="1" overflow="auto">
        {/* Top Bar with Actions */}
        <Box 
          bg="white" 
          borderBottom="1px solid" 
          borderColor="gray.200" 
          px={6} 
          py={4}
          position="sticky"
          top="0"
          zIndex="100"
        >
          <Flex justify="space-between" align="center">
            {/* Left Side - Add Transaction Button */}
            <Button
              leftIcon={<AddIcon />}
              colorScheme="blue"
              size="md"
              onClick={openAddTransaction}
            >
              Add Transaction
            </Button>

            {/* Center - Search Bar */}
            <InputGroup maxW="400px">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search or filter"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg="white"
              />
            </InputGroup>

            {/* Right Side - Bulk Actions */}
            <HStack spacing={3}>
              <Checkbox>Bulk actions</Checkbox>
              <Select
                placeholder="Bulk Actions"
                value={bulkActions}
                onChange={(e) => setBulkActions(e.target.value)}
                maxW="150px"
                size="md"
              >
                <option value="delete">Delete Selected</option>
                <option value="export">Export Selected</option>
                <option value="categorize">Categorize</option>
              </Select>
            </HStack>
          </Flex>
        </Box>

        {/* Main Content */}
        <Box p={6}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Heading as="h1" size="lg" mb={2}>
                Transactions
              </Heading>
              <Text color="gray.600">
                Manage your manual transactions and track your financial activities
                {selectedBusiness && ` for ${selectedBusiness.name}`}
              </Text>
            </Box>

            {/* Transaction List */}
            <Card>
              <CardBody p={0}>
                <TransactionList />
              </CardBody>
            </Card>
          </VStack>
        </Box>
      </Box>

      {/* Transaction Summary Sidebar */}
      <Box w="320px" bg="gray.50" borderLeft="1px solid" borderColor="gray.200" p={6}>
        <VStack spacing={6} align="stretch">
          {/* Summary Title */}
          <Box>
            <Heading size="md" mb={2}>
              Transaction Summary
            </Heading>
            <Text fontSize="sm" color="gray.600">
              Overview of your financial activity
            </Text>
          </Box>

          {loading ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <>
              {/* Donut Chart Placeholder */}
              <Card>
                <CardBody p={4}>
                  <Box
                    w="120px"
                    h="120px"
                    mx="auto"
                    borderRadius="full"
                    bg="conic-gradient(from 0deg, #48bb78 0deg 180deg, #e53e3e 180deg 270deg, #d69e2e 270deg 360deg)"
                    position="relative"
                    mb={4}
                  >
                    <Box
                      w="80px"
                      h="80px"
                      borderRadius="full"
                      bg="white"
                      position="absolute"
                      top="50%"
                      left="50%"
                      transform="translate(-50%, -50%)"
                    />
                  </Box>
                  
                  {/* Chart Legend */}
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Box w="3" h="3" bg="green.500" borderRadius="full" />
                        <Text fontSize="sm">Income</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatCurrency(summaryStats.totalIncome)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Box w="3" h="3" bg="red.500" borderRadius="full" />
                        <Text fontSize="sm">Expenses</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatCurrency(summaryStats.totalExpenses)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Box w="3" h="3" bg="yellow.500" borderRadius="full" />
                        <Text fontSize="sm">Pending</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatCurrency(summaryStats.pendingTransactions)}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Key Metrics */}
              <Card>
                <CardBody p={4}>
                  <VStack spacing={4} align="stretch">
                    <Stat>
                      <StatLabel fontSize="sm">Total Income</StatLabel>
                      <StatNumber fontSize="lg" color="green.500">
                        {formatCurrency(summaryStats.totalIncome)}
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        12.5%
                      </StatHelpText>
                    </Stat>
                    
                    <Divider />
                    
                    <Stat>
                      <StatLabel fontSize="sm">Total Expenses</StatLabel>
                      <StatNumber fontSize="lg" color="red.500">
                        {formatCurrency(summaryStats.totalExpenses)}
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type="decrease" />
                        8.2%
                      </StatHelpText>
                    </Stat>
                    
                    <Divider />
                    
                    <Stat>
                      <StatLabel fontSize="sm">Net Balance</StatLabel>
                      <StatNumber fontSize="lg" color={summaryStats.netBalance >= 0 ? "green.500" : "red.500"}>
                        {formatCurrency(summaryStats.netBalance)}
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type={summaryStats.netBalance >= 0 ? "increase" : "decrease"} />
                        {summaryStats.netBalance >= 0 ? "Positive" : "Negative"}
                      </StatHelpText>
                    </Stat>
                  </VStack>
                </CardBody>
              </Card>

              {/* Transaction Status */}
              <Card>
                <CardBody p={4}>
                  <VStack spacing={3} align="stretch">
                    <Text fontSize="sm" fontWeight="medium">Transaction Status</Text>
                    
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Badge colorScheme="green" size="sm">Paid</Badge>
                      </HStack>
                      <Text fontSize="sm">{summaryStats.paidTransactions}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Badge colorScheme="yellow" size="sm">Pending</Badge>
                      </HStack>
                      <Text fontSize="sm">{summaryStats.pendingTransactions}</Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Badge colorScheme="red" size="sm">Overdue</Badge>
                      </HStack>
                      <Text fontSize="sm">{summaryStats.overdueTransactions}</Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </>
          )}

          {/* Filter Options */}
          <Card>
            <CardBody p={4}>
              <VStack spacing={4} align="stretch">
                <Text fontSize="sm" fontWeight="medium">Filter Options</Text>
                
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={2}>Date Range</Text>
                  <Select size="sm" placeholder="Select date range">
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </Select>
                </Box>
                
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={2}>Category</Text>
                  <Select size="sm" placeholder="All Categories">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="transfer">Transfer</option>
                  </Select>
                </Box>
                
                <Box>
                  <Text fontSize="xs" color="gray.600" mb={2}>Status</Text>
                  <Select size="sm" placeholder="All Status">
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                  </Select>
                </Box>
                
                <Button
                  leftIcon={<DownloadIcon />}
                  size="sm"
                  variant="outline"
                  w="full"
                >
                  Export Summary
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Flex>
  );
};

export default TransactionsPage; 