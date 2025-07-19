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
  Badge,
  Button,
  useToast,
  Spinner,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
} from '@chakra-ui/react';
import { DownloadIcon, ViewIcon, RepeatIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

const ProfitAndLoss = () => {
  const api = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [pnlData, setPnlData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchProfitAndLoss = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounting/reports/profit-and-loss', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setPnlData(response.data);
    } catch (error) {
      console.error('Error fetching profit and loss:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profit and loss statement',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfitAndLoss();
  }, [dateRange]);

  const handleExport = async (format) => {
    try {
      const response = await api.get('/accounting/reports/profit-and-loss/export', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          format
        },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `profit-and-loss-${dateRange.startDate}-${dateRange.endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export profit and loss statement',
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

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading Profit and Loss Statement...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Profit and Loss Statement</Heading>
            <Text color="gray.600">
              Shows revenue, expenses, and net profit for the selected period
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={fetchProfitAndLoss}
              colorScheme="blue"
              variant="outline"
            >
              Refresh
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              onClick={() => handleExport('pdf')}
              colorScheme="green"
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

        {/* Date Range Selector */}
        <Card>
          <CardBody>
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
            </HStack>
          </CardBody>
        </Card>

        {/* P&L Summary */}
        {pnlData && (
          <>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Revenue</StatLabel>
                    <StatNumber color="green.500">
                      {formatCurrency(pnlData.totalRevenue)}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Total income
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Total Expenses</StatLabel>
                    <StatNumber color="red.500">
                      {formatCurrency(pnlData.totalExpenses)}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      Total costs
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <Stat>
                    <StatLabel>Net Profit</StatLabel>
                    <StatNumber color={pnlData.netProfit >= 0 ? 'green.500' : 'red.500'}>
                      {formatCurrency(pnlData.netProfit)}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type={pnlData.netProfit >= 0 ? 'increase' : 'decrease'} />
                      Net income
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>

            {/* Revenue Details */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Revenue Breakdown</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th>Description</Th>
                      <Th isNumeric>Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pnlData.revenue?.map((item, index) => (
                      <Tr key={index}>
                        <Td>
                          <Badge colorScheme="green">{item.category}</Badge>
                        </Td>
                        <Td>{item.description}</Td>
                        <Td isNumeric color="green.500">
                          {formatCurrency(item.amount)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>

            {/* Expense Details */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Expense Breakdown</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th>Description</Th>
                      <Th isNumeric>Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pnlData.expenses?.map((item, index) => (
                      <Tr key={index}>
                        <Td>
                          <Badge colorScheme="red">{item.category}</Badge>
                        </Td>
                        <Td>{item.description}</Td>
                        <Td isNumeric color="red.500">
                          {formatCurrency(item.amount)}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </>
        )}

        {!pnlData && !loading && (
          <Card>
            <CardBody textAlign="center" py={10}>
              <Text fontSize="lg" color="gray.600">
                No profit and loss data available for the selected period
              </Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                Try adjusting the date range or check if there are any transactions
              </Text>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default ProfitAndLoss; 