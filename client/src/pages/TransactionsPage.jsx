import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import TransactionList from '../components/transactions/TransactionList';
import transactionService from '../services/transactionService';
import { useBusiness } from '../contexts/BusinessContext';

const TransactionsPage = () => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedBusiness) {
      loadStats();
    }
  }, [selectedBusiness]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const statsData = await transactionService.getStats(selectedBusiness?.id);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading transaction stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transaction statistics',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box p={6}>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading as="h1" size="lg" mb={2}>
            Transactions
          </Heading>
          <Text color="gray.600">
            Manage your manual transactions and track your financial activities
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Stat>
            <StatLabel>Total Transactions</StatLabel>
            <StatNumber>{stats.totalTransactions}</StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              23.36%
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Total Income</StatLabel>
            <StatNumber color="green.500">
              {formatCurrency(stats.totalIncome)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              12.5%
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Total Expenses</StatLabel>
            <StatNumber color="red.500">
              {formatCurrency(stats.totalExpenses)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type="decrease" />
              8.2%
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Net Income</StatLabel>
            <StatNumber color={stats.netIncome >= 0 ? "green.500" : "red.500"}>
              {formatCurrency(stats.netIncome)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={stats.netIncome >= 0 ? "increase" : "decrease"} />
              {stats.netIncome >= 0 ? "Positive" : "Negative"}
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        <Box>
          <TransactionList />
        </Box>
      </VStack>
    </Box>
  );
};

export default TransactionsPage; 