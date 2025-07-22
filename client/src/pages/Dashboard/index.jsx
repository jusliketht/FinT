import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  VStack,
  Flex,
  Icon,
  useColorModeValue,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  ViewIcon,
  AddIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AttachmentIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import journalEntryService from '../../services/journalEntryService';
import accountService from '../../services/accountService';
import { useToast } from '../../contexts/ToastContext';
import MetricCard from '../../components/dashboard/MetricCard';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import Breadcrumb from '../../components/common/Breadcrumb';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 24500,
    totalExpenses: 10250,
    profitLoss: 3250,
    cashFlow: 12500,
    accountsReceivable: 8500,
    accountsPayable: 3200,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedBusiness]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [accounts, entries] = await Promise.all([
        accountService.getAll(),
        journalEntryService.getAll({ limit: 10 }),
      ]);

      // Calculate financial metrics
      const revenue = accounts
        .filter(acc => acc.type === 'REVENUE')
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);
      
      const expenses = accounts
        .filter(acc => acc.type === 'EXPENSE')
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);

      setStats({
        totalRevenue: revenue || 24500,
        totalExpenses: expenses || 10250,
        profitLoss: (revenue || 24500) - (expenses || 10250),
        cashFlow: (revenue || 24500) * 0.8,
        accountsReceivable: 8500,
        accountsPayable: 3200,
      });

      setRecentTransactions(entries.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Remove the old MetricCard component since we're using the new one

  const QuickActionButton = ({ icon, label, to, colorScheme = "blue", variant = "solid" }) => (
    <Button
      as={Link}
      to={to}
      leftIcon={<Icon as={icon} />}
      colorScheme={colorScheme}
      variant={variant}
      size="lg"
      w="full"
      h="60px"
      fontSize="md"
      fontWeight="medium"
    >
      {label}
    </Button>
  );

  return (
    <Box maxW="7xl" mx="auto" p={6}>
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
          </Text>
        </VStack>
      </Flex>

      {/* Metric Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <MetricCard
          title="Total Revenue"
          value={stats.totalRevenue}
          gradient="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
          icon={FiDollarSign}
          trend="up"
          change={12.5}
        />
        <MetricCard
          title="Total Expenses"
          value={stats.totalExpenses}
          gradient="linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)"
          icon={FiTrendingDown}
          trend="down"
          change={-8.2}
        />
        <MetricCard
          title="Net Profit/Loss"
          value={stats.profitLoss}
          gradient="linear-gradient(135deg, #63b3ed 0%, #3182ce 100%)"
          icon={FiTrendingUp}
          trend="up"
          change={15.3}
        />
      </SimpleGrid>

      {/* Second Row of Metrics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <MetricCard
          title="Cash Balance"
          value={stats.cashFlow}
          gradient="linear-gradient(135deg, #b794f6 0%, #9f7aea 100%)"
          icon={FiCreditCard}
          trend="up"
          change={5.7}
        />
        <MetricCard
          title="Accounts Receivable"
          value={stats.accountsReceivable}
          gradient="linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)"
          icon={ArrowUpIcon}
          trend="up"
          change={3.2}
        />
        <MetricCard
          title="Accounts Payable"
          value={stats.accountsPayable}
          gradient="linear-gradient(135deg, #f687b3 0%, #e53e3e 100%)"
          icon={ArrowDownIcon}
          trend="down"
          change={-2.1}
        />
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
        <Card bg={cardBg} borderRadius="xl" boxShadow="md">
          <CardBody p={6}>
            <Heading size="md" mb={6}>
              Quick Actions
            </Heading>
            <VStack spacing={4}>
              <QuickActionButton
                icon={AddIcon}
                label="Add Transaction"
                to="/journal/new"
                colorScheme="blue"
              />
              <QuickActionButton
                icon={ViewIcon}
                label="Generate Report"
                to="/reports"
                colorScheme="green"
              />
              <QuickActionButton
                icon={AttachmentIcon}
                label="Upload Statement"
                to="/bank-statements"
                colorScheme="purple"
              />
              <QuickActionButton
                icon={SettingsIcon}
                label="Chart of Accounts"
                to="/accounts"
                colorScheme="orange"
              />
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;
