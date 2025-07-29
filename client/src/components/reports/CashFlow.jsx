import React, { useState, useEffect, useCallback } from 'react';
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
} from '@chakra-ui/react';
import { DownloadIcon, ViewIcon, RepeatIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

const CashFlow = () => {
  const api = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchCashFlow = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounting/reports/cash-flow', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setCashFlowData(response.data);
    } catch (error) {
      console.error('Error fetching cash flow:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cash flow statement',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [api, dateRange, toast]);

  useEffect(() => {
    fetchCashFlow();
  }, [dateRange, fetchCashFlow]);

  const handleExport = async (format) => {
    try {
      const response = await api.get('/accounting/reports/cash-flow/export', {
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
      link.setAttribute('download', `cash-flow-${dateRange.startDate}-${dateRange.endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export cash flow statement',
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
        <Text mt={4}>Loading Cash Flow Statement...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Cash Flow Statement</Heading>
            <Text color="gray.600">
              Shows cash inflows and outflows for the selected period
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={fetchCashFlow}
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

        {/* Cash Flow Summary */}
        {cashFlowData && (
          <>
            <Flex justify="space-around" wrap="wrap" gap={4} mb={6}>
              <Stat>
                <StatLabel>Operating Cash Flow</StatLabel>
                <StatNumber color={cashFlowData.operatingCashFlow >= 0 ? 'green.500' : 'red.500'}>
                  {formatCurrency(cashFlowData.operatingCashFlow)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={cashFlowData.operatingCashFlow >= 0 ? 'increase' : 'decrease'} />
                  Cash from operations
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Investing Cash Flow</StatLabel>
                <StatNumber color={cashFlowData.investingCashFlow >= 0 ? 'green.500' : 'red.500'}>
                  {formatCurrency(cashFlowData.investingCashFlow)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={cashFlowData.investingCashFlow >= 0 ? 'increase' : 'decrease'} />
                  Cash from investments
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Financing Cash Flow</StatLabel>
                <StatNumber color={cashFlowData.financingCashFlow >= 0 ? 'green.500' : 'red.500'}>
                  {formatCurrency(cashFlowData.financingCashFlow)}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={cashFlowData.financingCashFlow >= 0 ? 'increase' : 'decrease'} />
                  Cash from financing
                </StatHelpText>
              </Stat>
            </Flex>

            {/* Detailed Cash Flow Table */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>Detailed Cash Flow</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Category</Th>
                      <Th>Description</Th>
                      <Th isNumeric>Amount</Th>
                      <Th>Type</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {cashFlowData.details?.map((item, index) => (
                      <Tr key={index}>
                        <Td>
                          <Badge colorScheme={item.category === 'Operating' ? 'blue' : item.category === 'Investing' ? 'green' : 'purple'}>
                            {item.category}
                          </Badge>
                        </Td>
                        <Td>{item.description}</Td>
                        <Td isNumeric color={item.amount >= 0 ? 'green.500' : 'red.500'}>
                          {formatCurrency(item.amount)}
                        </Td>
                        <Td>
                          <Badge colorScheme={item.type === 'Inflow' ? 'green' : 'red'}>
                            {item.type}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </>
        )}

        {!cashFlowData && !loading && (
          <Card>
            <CardBody textAlign="center" py={10}>
              <Text fontSize="lg" color="gray.600">
                No cash flow data available for the selected period
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

export default CashFlow; 