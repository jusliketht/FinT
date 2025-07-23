import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  useColorModeValue,
  SimpleGrid,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import journalEntryService from '../../services/journalEntryService';
import accountService from '../../services/accountService';
import { analyticsService } from '../../services/analyticsService';
import { useToast } from '../../contexts/ToastContext';
import MetricCard from '../../components/dashboard/MetricCard';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import QuickLinks from '../../components/dashboard/QuickLinks';
import Breadcrumb from '../../components/common/Breadcrumb';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    profitLoss: 0,
    cashFlow: 0,
    accountsReceivable: 0,
    accountsPayable: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { selectedBusiness, isPersonalMode } = useBusiness();
  const { showToast } = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const businessId = selectedBusiness?.id;
      
      if (!businessId && !isPersonalMode) {
        // No business selected, show personal data or empty state
        setStats({
          totalRevenue: 0,
          totalExpenses: 0,
          profitLoss: 0,
          cashFlow: 0,
          accountsReceivable: 0,
          accountsPayable: 0,
        });
        setRecentTransactions([]);
        return;
      }

      // Fetch analytics data for business
      const [kpis, accounts, entries] = await Promise.all([
        businessId ? analyticsService.getKPIs(businessId, 'current') : Promise.resolve({}),
        accountService.getAll(businessId),
        journalEntryService.getAll({ limit: 10, businessId }),
      ]);

      // Calculate financial metrics from accounts
      const revenue = accounts
        .filter(acc => acc.type === 'REVENUE')
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);
      
      const expenses = accounts
        .filter(acc => acc.type === 'EXPENSE')
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);

      const cashAccounts = accounts
        .filter(acc => acc.type === 'ASSET' && (acc.name.toLowerCase().includes('cash') || acc.name.toLowerCase().includes('bank')))
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);

      const accountsReceivable = accounts
        .filter(acc => acc.type === 'ASSET' && acc.name.toLowerCase().includes('receivable'))
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);

      const accountsPayable = accounts
        .filter(acc => acc.type === 'LIABILITY' && acc.name.toLowerCase().includes('payable'))
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);

      setStats({
        totalRevenue: kpis.revenue || revenue || 0,
        totalExpenses: kpis.expenses || expenses || 0,
        profitLoss: kpis.profit || (revenue - expenses) || 0,
        cashFlow: kpis.cashFlow || cashAccounts || 0,
        accountsReceivable: accountsReceivable || 0,
        accountsPayable: accountsPayable || 0,
      });

      setRecentTransactions(entries.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, isPersonalMode, showToast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <Box maxW="7xl" mx="auto" p={6} data-testid="dashboard">
      {/* Breadcrumb */}
      <Breadcrumb mb={6} />

      {/* Header */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        mb={8}
      >
        <VStack align="start" spacing={2}>
          <Heading size="lg" fontWeight="bold">
            Dashboard
          </Heading>
          <Text color={textColor}>
            Welcome back, {user?.name}! 
            {selectedBusiness && ` Managing: ${selectedBusiness.name}`}
            {!selectedBusiness && isPersonalMode && ' Personal Finance Mode'}
            {!selectedBusiness && !isPersonalMode && ' Please select a business'}
          </Text>
        </VStack>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* No Business Selected Alert */}
      {!selectedBusiness && !isPersonalMode && (
        <Alert status="info" mb={6} borderRadius="md">
          <AlertIcon />
          Please select a business to view financial metrics, or switch to personal mode.
        </Alert>
      )}

      {/* Metric Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        {loading ? (
          // Loading skeletons
          Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height="120px" borderRadius="xl" />
          ))
        ) : (
          <>
            <MetricCard
              title="Total Revenue"
              value={stats.totalRevenue}
              gradient="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
              icon={FiDollarSign}
              trend="up"
              change={stats.totalRevenue > 0 ? 12.5 : 0}
            />
            <MetricCard
              title="Total Expenses"
              value={stats.totalExpenses}
              gradient="linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)"
              icon={FiTrendingDown}
              trend="down"
              change={stats.totalExpenses > 0 ? -8.2 : 0}
            />
            <MetricCard
              title="Net Profit/Loss"
              value={stats.profitLoss}
              gradient="linear-gradient(135deg, #63b3ed 0%, #3182ce 100%)"
              icon={FiTrendingUp}
              trend={stats.profitLoss >= 0 ? "up" : "down"}
              change={stats.profitLoss > 0 ? 15.3 : -5.2}
            />
            <MetricCard
              title="Cash Balance"
              value={stats.cashFlow}
              gradient="linear-gradient(135deg, #b794f6 0%, #9f7aea 100%)"
              icon={FiCreditCard}
              trend="up"
              change={stats.cashFlow > 0 ? 5.7 : 0}
            />
            <MetricCard
              title="Accounts Receivable"
              value={stats.accountsReceivable}
              gradient="linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)"
              icon={FiArrowUp}
              trend="up"
              change={stats.accountsReceivable > 0 ? 3.2 : 0}
            />
            <MetricCard
              title="Accounts Payable"
              value={stats.accountsPayable}
              gradient="linear-gradient(135deg, #f687b3 0%, #e53e3e 100%)"
              icon={FiArrowDown}
              trend="down"
              change={stats.accountsPayable > 0 ? -2.1 : 0}
            />
          </>
        )}
      </SimpleGrid>



      {/* Main Content Grid */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Recent Transactions */}
        <RecentTransactions 
          transactions={recentTransactions}
          isLoading={loading}
          maxItems={5}
        />

        {/* Quick Actions */}
        <QuickLinks />
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
