import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Select,
  Button,
  useToast,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../contexts/BusinessContext';
import { useToast as useToastContext } from '../../contexts/ToastContext';
import analyticsService from '../../services/analyticsService';

const AnalyticsDashboard = () => {
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToastContext();
  const toast = useToast();
  
  const [analytics, setAnalytics] = useState({
    kpis: {},
    trends: {},
    topAccounts: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('current');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedBusiness?.id) {
        setAnalytics({
          kpis: {},
          trends: {},
          topAccounts: [],
          recentTransactions: []
        });
        return;
      }

      const businessId = selectedBusiness.id;
      
      // Fetch KPIs
      const kpis = await analyticsService.getKPIs(businessId, period);
      
      // Fetch trends
      const trends = await analyticsService.getTrends(businessId, period);
      
      // Fetch top accounts
      const topAccounts = await analyticsService.getTopAccounts(businessId, period);
      
      // Fetch recent transactions
      const recentTransactions = await analyticsService.getRecentTransactions(businessId, 10);

      setAnalytics({
        kpis: kpis.data || kpis,
        trends: trends.data || trends,
        topAccounts: topAccounts.data || topAccounts,
        recentTransactions: recentTransactions.data || recentTransactions
      });
    } catch (err) {
      setError('Failed to fetch analytics data');
      showToast('error', 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness?.id, period, showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchAnalytics();
    }
  }, [selectedBusiness, fetchAnalytics]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'green';
    if (value < 0) return 'red';
    return 'gray';
  };

  const getTrendArrow = (value) => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'none';
  };

  if (!selectedBusiness) {
    return (
      <Box p={6}>
        <Alert status="info">
          <AlertIcon />
          Please select a business to view analytics.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Analytics Dashboard</Heading>
            <Text color="gray.600">Financial insights and trends</Text>
          </Box>
          <HStack spacing={4}>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              maxW="150px"
            >
              <option value="current">Current Month</option>
              <option value="previous">Previous Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </Select>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={fetchAnalytics}
              isLoading={loading}
              loadingText="Refreshing..."
            >
              Refresh
            </Button>
          </HStack>
        </HStack>

        {/* Loading State */}
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Loading analytics...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <>
            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <Heading size="md">Key Performance Indicators</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel>Total Revenue</StatLabel>
                    <StatNumber>{formatCurrency(analytics.kpis.totalRevenue || 0)}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={getTrendArrow(analytics.trends.revenueGrowth || 0)} />
                      {formatPercentage(analytics.trends.revenueGrowth || 0)}
                    </StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Total Expenses</StatLabel>
                    <StatNumber>{formatCurrency(analytics.kpis.totalExpenses || 0)}</StatNumber>
                    <StatHelpText>
                      <StatArrow type={getTrendArrow(analytics.trends.expenseGrowth || 0)} />
                      {formatPercentage(analytics.trends.expenseGrowth || 0)}
                    </StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Net Profit</StatLabel>
                    <StatNumber color={getTrendColor(analytics.kpis.netProfit || 0)}>
                      {formatCurrency(analytics.kpis.netProfit || 0)}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type={getTrendArrow(analytics.trends.profitGrowth || 0)} />
                      {formatPercentage(analytics.trends.profitGrowth || 0)}
                    </StatHelpText>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Cash Flow</StatLabel>
                    <StatNumber color={getTrendColor(analytics.kpis.cashFlow || 0)}>
                      {formatCurrency(analytics.kpis.cashFlow || 0)}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type={getTrendArrow(analytics.trends.cashFlowGrowth || 0)} />
                      {formatPercentage(analytics.trends.cashFlowGrowth || 0)}
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>

            {/* Additional Metrics */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {/* Top Accounts */}
              <Card>
                <CardHeader>
                  <Heading size="md">Top Accounts by Balance</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {analytics.topAccounts?.slice(0, 5).map((account, index) => (
                      <HStack key={account.id} justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{account.name}</Text>
                          <Text fontSize="sm" color="gray.600">{account.code}</Text>
                        </VStack>
                        <Text fontWeight="bold" color={getTrendColor(account.balance)}>
                          {formatCurrency(account.balance)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <Heading size="md">Recent Transactions</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    {analytics.recentTransactions?.slice(0, 5).map((transaction) => (
                      <HStack key={transaction.id} justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{transaction.description}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {new Date(transaction.date).toLocaleDateString()}
                          </Text>
                        </VStack>
                        <Text fontWeight="bold" color={getTrendColor(transaction.amount)}>
                          {formatCurrency(transaction.amount)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Financial Ratios */}
            <Card>
              <CardHeader>
                <Heading size="md">Financial Ratios</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel>Profit Margin</StatLabel>
                    <StatNumber>
                      {analytics.kpis.profitMargin ? `${analytics.kpis.profitMargin.toFixed(1)}%` : 'N/A'}
                    </StatNumber>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Current Ratio</StatLabel>
                    <StatNumber>
                      {analytics.kpis.currentRatio ? analytics.kpis.currentRatio.toFixed(2) : 'N/A'}
                    </StatNumber>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Debt to Equity</StatLabel>
                    <StatNumber>
                      {analytics.kpis.debtToEquity ? analytics.kpis.debtToEquity.toFixed(2) : 'N/A'}
                    </StatNumber>
                  </Stat>
                  
                  <Stat>
                    <StatLabel>Return on Assets</StatLabel>
                    <StatNumber>
                      {analytics.kpis.returnOnAssets ? `${analytics.kpis.returnOnAssets.toFixed(1)}%` : 'N/A'}
                    </StatNumber>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default AnalyticsDashboard; 