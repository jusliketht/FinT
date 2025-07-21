import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Flex, HStack, Button, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Card, CardHeader, CardBody, Select, Text, Badge, useToast
} from '@chakra-ui/react';
import { DownloadIcon, TrendingUpIcon, TrendingDownIcon } from '@chakra-ui/icons';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useApi } from '../../hooks/useApi';

const AnalyticsDashboard = () => {
  const [kpis, setKpis] = useState({});
  const [profitability, setProfitability] = useState({});
  const [businessMetrics, setBusinessMetrics] = useState({});
  const [trends, setTrends] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const api = useApi();

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [kpisResponse, profitabilityResponse, businessMetricsResponse, trendsResponse] = await Promise.all([
        api.get(`/analytics/kpis?period=${selectedPeriod}`),
        api.get(`/analytics/profitability?period=${selectedPeriod}`),
        api.get('/analytics/business-metrics'),
        api.get(`/analytics/trends?metric=${selectedMetric}&periods=12`)
      ]);
      setKpis(kpisResponse.data);
      setProfitability(profitabilityResponse.data);
      setBusinessMetrics(businessMetricsResponse.data);
      setTrends(trendsResponse.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch analytics data', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalyticsReport = () => {
    toast({ title: 'Export', description: 'Export not implemented', status: 'info' });
  };

  const getTrendIcon = (current, previous) => {
    if (current > previous) return <TrendingUpIcon color="green.500" />;
    if (current < previous) return <TrendingDownIcon color="red.500" />;
    return null;
  };

  const getTrendColor = (current, previous) => {
    if (current > previous) return 'green.500';
    if (current < previous) return 'red.500';
    return 'gray.500';
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Analytics & Reporting</Heading>
        <HStack>
          <Select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} w="150px">
            <option value="current">Current Month</option>
            <option value="previous">Previous Month</option>
            <option value="quarter">Current Quarter</option>
            <option value="year">Current Year</option>
          </Select>
          <Button leftIcon={<DownloadIcon />} onClick={exportAnalyticsReport}>
            Export Report
          </Button>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Revenue</StatLabel>
          <StatNumber>{formatCurrency(kpis.revenue || 0)}</StatNumber>
          <StatHelpText>
            {getTrendIcon(kpis.revenue, 0)}
            <Text as="span" color={getTrendColor(kpis.revenue, 0)}>
              {formatPercentage(kpis.profitMargin || 0)} profit margin
            </Text>
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Expenses</StatLabel>
          <StatNumber>{formatCurrency(kpis.expenses || 0)}</StatNumber>
          <StatHelpText>
            {getTrendIcon(0, kpis.expenses)}
            <Text as="span" color={getTrendColor(0, kpis.expenses)}>
              Operating costs
            </Text>
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Net Profit</StatLabel>
          <StatNumber color={kpis.profit > 0 ? 'green.500' : 'red.500'}>
            {formatCurrency(kpis.profit || 0)}
          </StatNumber>
          <StatHelpText>
            {getTrendIcon(kpis.profit, 0)}
            <Text as="span" color={getTrendColor(kpis.profit, 0)}>
              Net income
            </Text>
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Cash Flow</StatLabel>
          <StatNumber color={kpis.cashFlow > 0 ? 'green.500' : 'red.500'}>
            {formatCurrency(kpis.cashFlow || 0)}
          </StatNumber>
          <StatHelpText>
            {getTrendIcon(kpis.cashFlow, 0)}
            <Text as="span" color={getTrendColor(kpis.cashFlow, 0)}>
              Net cash flow
            </Text>
          </StatHelpText>
        </Stat>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader>
            <Heading size="md">Profitability Analysis</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontSize="sm" color="gray.600">Gross Profit</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {formatCurrency(profitability.grossProfit || 0)}
                </Text>
                <Badge colorScheme="blue">
                  {formatPercentage(profitability.grossProfitMargin || 0)} margin
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Operating Income</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {formatCurrency(profitability.operatingIncome || 0)}
                </Text>
                <Badge colorScheme="green">
                  {formatPercentage(profitability.operatingMargin || 0)} margin
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Net Income</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {formatCurrency(profitability.netIncome || 0)}
                </Text>
                <Badge colorScheme="purple">
                  {formatPercentage(profitability.netProfitMargin || 0)} margin
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Cost of Goods Sold</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {formatCurrency(profitability.costOfGoodsSold || 0)}
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Business Metrics</Heading>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={2} spacing={4}>
              <Box>
                <Text fontSize="sm" color="gray.600">Current Ratio</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {(businessMetrics.currentRatio || 0).toFixed(2)}
                </Text>
                <Badge colorScheme={businessMetrics.currentRatio > 1 ? 'green' : 'red'}>
                  {businessMetrics.currentRatio > 1 ? 'Good' : 'Low'}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Quick Ratio</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {(businessMetrics.quickRatio || 0).toFixed(2)}
                </Text>
                <Badge colorScheme={businessMetrics.quickRatio > 1 ? 'green' : 'red'}>
                  {businessMetrics.quickRatio > 1 ? 'Good' : 'Low'}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Debt to Equity</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {(businessMetrics.debtToEquityRatio || 0).toFixed(2)}
                </Text>
                <Badge colorScheme={businessMetrics.debtToEquityRatio < 1 ? 'green' : 'red'}>
                  {businessMetrics.debtToEquityRatio < 1 ? 'Good' : 'High'}
                </Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Working Capital</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {formatCurrency(businessMetrics.workingCapital || 0)}
                </Text>
                <Badge colorScheme={businessMetrics.workingCapital > 0 ? 'green' : 'red'}>
                  {businessMetrics.workingCapital > 0 ? 'Positive' : 'Negative'}
                </Badge>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Trend Analysis</Heading>
            <Select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} w="150px">
              <option value="revenue">Revenue</option>
              <option value="expenses">Expenses</option>
              <option value="profit">Profit</option>
              <option value="cashFlow">Cash Flow</option>
            </Select>
          </Flex>
        </CardHeader>
        <CardBody>
          <Box h="300px" display="flex" alignItems="center" justifyContent="center">
            <Text color="gray.500">Chart visualization would be implemented here</Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
            {trends.slice(-3).map((trend, index) => (
              <Box key={index} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                <Text fontSize="sm" color="gray.600">{trend.period}</Text>
                <Text fontSize="lg" fontWeight="bold">{formatCurrency(trend.value)}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default AnalyticsDashboard; 