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
  Select,
  Input,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react';
import { DownloadIcon, PrintIcon, RefreshIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

const IncomeStatement = () => {
  const api = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of year
    endDate: new Date().toISOString().split('T')[0] // Today
  });

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounting/reports/income-statement', {
        params: dateRange
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching income statement:', error);
      toast({
        title: 'Error',
        description: 'Failed to load income statement',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    fetchReport();
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get('/accounting/reports/income-statement/export', {
        params: { ...dateRange, format },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `income-statement-${dateRange.startDate}-${dateRange.endDate}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export report',
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

  const calculateNetIncome = () => {
    if (!reportData) return 0;
    const totalRevenue = reportData.revenue?.total || 0;
    const totalExpenses = reportData.expenses?.total || 0;
    return totalRevenue - totalExpenses;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Generating Income Statement...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Income Statement</Heading>
            <Text color="gray.600">
              Profit and Loss Statement for the period
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<RefreshIcon />}
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
            >
              Export PDF
            </Button>
            <Button
              leftIcon={<PrintIcon />}
              onClick={() => window.print()}
              colorScheme="purple"
            >
              Print
            </Button>
          </HStack>
        </HStack>

        {/* Date Range Controls */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>Start Date</Text>
                <Input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  size="sm"
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>End Date</Text>
                <Input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  size="sm"
                />
              </Box>
              <Button onClick={handleGenerate} colorScheme="blue" size="sm">
                Generate Report
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Summary Stats */}
        {reportData && (
          <StatGroup>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber color="green.500">
                {formatCurrency(reportData.revenue?.total || 0)}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Expenses</StatLabel>
              <StatNumber color="red.500">
                {formatCurrency(reportData.expenses?.total || 0)}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Net Income</StatLabel>
              <StatNumber color={calculateNetIncome() >= 0 ? 'green.500' : 'red.500'}>
                {formatCurrency(calculateNetIncome())}
              </StatNumber>
            </Stat>
          </StatGroup>
        )}

        {/* Income Statement Details */}
        {reportData ? (
          <Card>
            <CardBody>
              <VStack spacing={6} align="stretch">
                {/* Revenue Section */}
                <Box>
                  <Heading size="md" mb={4} color="green.600">Revenue</Heading>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>% of Revenue</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reportData.revenue?.accounts?.map((account) => (
                        <Tr key={account.id}>
                          <Td>{account.name}</Td>
                          <Td isNumeric color="green.500" fontWeight="medium">
                            {formatCurrency(account.balance)}
                          </Td>
                          <Td isNumeric>
                            {reportData.revenue.total > 0 
                              ? ((account.balance / reportData.revenue.total) * 100).toFixed(1) + '%'
                              : '0%'
                            }
                          </Td>
                        </Tr>
                      ))}
                      <Tr bg="green.50" fontWeight="bold">
                        <Td>Total Revenue</Td>
                        <Td isNumeric color="green.600">
                          {formatCurrency(reportData.revenue?.total || 0)}
                        </Td>
                        <Td isNumeric>100%</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                {/* Expenses Section */}
                <Box>
                  <Heading size="md" mb={4} color="red.600">Expenses</Heading>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th isNumeric>Amount</Th>
                        <Th isNumeric>% of Revenue</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reportData.expenses?.accounts?.map((account) => (
                        <Tr key={account.id}>
                          <Td>{account.name}</Td>
                          <Td isNumeric color="red.500" fontWeight="medium">
                            {formatCurrency(account.balance)}
                          </Td>
                          <Td isNumeric>
                            {reportData.revenue.total > 0 
                              ? ((account.balance / reportData.revenue.total) * 100).toFixed(1) + '%'
                              : '0%'
                            }
                          </Td>
                        </Tr>
                      ))}
                      <Tr bg="red.50" fontWeight="bold">
                        <Td>Total Expenses</Td>
                        <Td isNumeric color="red.600">
                          {formatCurrency(reportData.expenses?.total || 0)}
                        </Td>
                        <Td isNumeric>
                          {reportData.revenue.total > 0 
                            ? ((reportData.expenses.total / reportData.revenue.total) * 100).toFixed(1) + '%'
                            : '0%'
                          }
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                {/* Net Income */}
                <Box borderTop="2px solid" borderColor="gray.200" pt={4}>
                  <HStack justify="space-between">
                    <Heading size="md" color={calculateNetIncome() >= 0 ? 'green.600' : 'red.600'}>
                      Net Income
                    </Heading>
                    <Text fontSize="xl" fontWeight="bold" color={calculateNetIncome() >= 0 ? 'green.600' : 'red.600'}>
                      {formatCurrency(calculateNetIncome())}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mt={2}>
                    {calculateNetIncome() >= 0 ? 'Profit' : 'Loss'} for the period
                  </Text>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <Alert status="info">
            <AlertIcon />
            No data available for the selected period. Please generate a report.
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default IncomeStatement; 