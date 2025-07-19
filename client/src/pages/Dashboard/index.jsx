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
  HStack,
  Flex,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
} from '@chakra-ui/react';
import {
  ViewIcon,
  AddIcon,
  DownloadIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import journalEntryService from '../../services/journalEntryService';
import accountService from '../../services/accountService';
import { useToast } from '../../contexts/ToastContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 24500,
    totalExpenses: 10250,
    profitLoss: 3250,
    cashFlow: 12500,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
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
      });

      setRecentTransactions(entries.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const MetricCard = ({ title, value, gradient, icon, trend }) => (
    <Card
      bg={gradient}
      borderRadius="lg"
      boxShadow="lg"
      color="white"
      overflow="hidden"
      position="relative"
    >
      <CardBody p={6}>
        <Flex justify="space-between" align="start" mb={4}>
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" fontWeight="medium" opacity={0.9}>
              {title}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" fontFamily="mono">
              ₹{value.toLocaleString()}
            </Text>
          </VStack>
          <Icon as={icon} boxSize={8} opacity={0.8} />
        </Flex>
        
        {/* Mini chart placeholder */}
        <Box h="2" bg="white" opacity={0.2} borderRadius="full" />
      </CardBody>
    </Card>
  );

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      {/* Header */}
      <Flex
        direction={{ base: 'column', md: 'row' }}
        justify="space-between"
        align={{ base: 'start', md: 'center' }}
        mb={8}
      >
        <VStack align="start" spacing={2}>
          <Heading size="lg" fontWeight="bold">
            Financial Accounting
          </Heading>
          <Text color={textColor}>
            Welcome back, {user?.name}! 
            {selectedBusiness && ` Managing: ${selectedBusiness.name}`}
          </Text>
        </VStack>
      </Flex>

      {/* Metric Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <MetricCard
          title="Total Revenue"
          value={stats.totalRevenue}
          gradient="linear-gradient(135deg, #48bb78 0%, #38a169 100%)"
          icon={ArrowUpIcon}
          trend="up"
        />
        <MetricCard
          title="Expenses"
          value={stats.totalExpenses}
          gradient="linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)"
          icon={ArrowDownIcon}
          trend="down"
        />
        <MetricCard
          title="Profit / Loss"
          value={stats.profitLoss}
          gradient="linear-gradient(135deg, #63b3ed 0%, #3182ce 100%)"
          icon={ArrowUpIcon}
          trend="up"
        />
        <MetricCard
          title="Cash Flow"
          value={stats.cashFlow}
          gradient="linear-gradient(135deg, #b794f6 0%, #9f7aea 100%)"
          icon={ArrowUpIcon}
          trend="up"
        />
      </SimpleGrid>

      {/* Recent Transactions */}
      <Card bg={cardBg} borderRadius="lg" boxShadow="md">
        <CardBody p={6}>
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="md">
              Recent Transactions
            </Heading>
            <HStack spacing={3}>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="sm"
                as={Link}
                to="/journal/new"
              >
                Add Transaction
              </Button>
              <Button
                leftIcon={<ViewIcon />}
                variant="outline"
                size="sm"
                as={Link}
                to="/reports"
              >
                Generate Report
              </Button>
              <Button
                leftIcon={<DownloadIcon />}
                variant="outline"
                size="sm"
                as={Link}
                to="/bank-statements"
              >
                Upload Statement
              </Button>
            </HStack>
          </Flex>
          
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <Tr key={index}>
                      <Td fontSize="sm">
                        {new Date(transaction.date).toLocaleDateString()}
                      </Td>
                      <Td fontSize="sm">
                        {transaction.description || 'Journal Entry'}
                      </Td>
                      <Td fontSize="sm" fontFamily="mono">
                        ₹{transaction.amount?.toLocaleString() || '0'}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={transaction.status === 'posted' ? 'green' : 'orange'}
                          size="sm"
                        >
                          {transaction.status || 'Draft'}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          as={Link}
                          to={`/journal/${transaction.id}`}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" color={textColor}>
                      No recent transactions
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;
