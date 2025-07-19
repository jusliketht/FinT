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
  Input,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  SimpleGrid
} from '@chakra-ui/react';
import { DownloadIcon, ViewIcon, RepeatIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

const BalanceSheet = () => {
  const api = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounting/reports/balance-sheet', {
        params: { asOfDate }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching balance sheet:', error);
      toast({
        title: 'Error',
        description: 'Failed to load balance sheet',
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

  const handleGenerate = () => {
    fetchReport();
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get('/accounting/reports/balance-sheet/export', {
        params: { asOfDate, format },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `balance-sheet-${asOfDate}.${format}`);
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

  const calculateTotalAssets = () => {
    if (!reportData?.assets) return 0;
    return reportData.assets.total || 0;
  };

  const calculateTotalLiabilities = () => {
    if (!reportData?.liabilities) return 0;
    return reportData.liabilities.total || 0;
  };

  const calculateTotalEquity = () => {
    if (!reportData?.equity) return 0;
    return reportData.equity.total || 0;
  };

  const calculateWorkingCapital = () => {
    const currentAssets = reportData?.assets?.current || 0;
    const currentLiabilities = reportData?.liabilities?.current || 0;
    return currentAssets - currentLiabilities;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Generating Balance Sheet...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Balance Sheet</Heading>
            <Text color="gray.600">
              Statement of Financial Position as of {asOfDate}
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<RepeatIcon />}
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
              leftIcon={<ViewIcon />}
              onClick={() => window.print()}
              colorScheme="purple"
            >
              Print
            </Button>
          </HStack>
        </HStack>

        {/* Date Control */}
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1}>As of Date</Text>
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
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
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel>Total Assets</StatLabel>
              <StatNumber color="blue.500">
                {formatCurrency(calculateTotalAssets())}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Liabilities</StatLabel>
              <StatNumber color="red.500">
                {formatCurrency(calculateTotalLiabilities())}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Equity</StatLabel>
              <StatNumber color="green.500">
                {formatCurrency(calculateTotalEquity())}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Working Capital</StatLabel>
              <StatNumber color={calculateWorkingCapital() >= 0 ? 'green.500' : 'red.500'}>
                {formatCurrency(calculateWorkingCapital())}
              </StatNumber>
            </Stat>
          </SimpleGrid>
        )}

        {/* Balance Sheet Details */}
        {reportData ? (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Assets */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4} color="blue.600">Assets</Heading>
                
                {/* Current Assets */}
                <Box mb={6}>
                  <Text fontWeight="bold" mb={2} color="blue.700">Current Assets</Text>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th isNumeric>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reportData.assets?.current?.accounts?.map((account) => (
                        <Tr key={account.id}>
                          <Td>{account.name}</Td>
                          <Td isNumeric color="blue.500" fontWeight="medium">
                            {formatCurrency(account.balance)}
                          </Td>
                        </Tr>
                      ))}
                      <Tr bg="blue.50" fontWeight="bold">
                        <Td>Total Current Assets</Td>
                        <Td isNumeric color="blue.600">
                          {formatCurrency(reportData.assets?.current?.total || 0)}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                {/* Fixed Assets */}
                <Box>
                  <Text fontWeight="bold" mb={2} color="blue.700">Fixed Assets</Text>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th isNumeric>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reportData.assets?.fixed?.accounts?.map((account) => (
                        <Tr key={account.id}>
                          <Td>{account.name}</Td>
                          <Td isNumeric color="blue.500" fontWeight="medium">
                            {formatCurrency(account.balance)}
                          </Td>
                        </Tr>
                      ))}
                      <Tr bg="blue.50" fontWeight="bold">
                        <Td>Total Fixed Assets</Td>
                        <Td isNumeric color="blue.600">
                          {formatCurrency(reportData.assets?.fixed?.total || 0)}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                {/* Total Assets */}
                <Box borderTop="2px solid" borderColor="blue.200" pt={4} mt={4}>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      Total Assets
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      {formatCurrency(calculateTotalAssets())}
                    </Text>
                  </HStack>
                </Box>
              </CardBody>
            </Card>

            {/* Liabilities & Equity */}
            <Card>
              <CardBody>
                <Heading size="md" mb={4} color="red.600">Liabilities & Equity</Heading>
                
                {/* Current Liabilities */}
                <Box mb={6}>
                  <Text fontWeight="bold" mb={2} color="red.700">Current Liabilities</Text>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th isNumeric>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reportData.liabilities?.current?.accounts?.map((account) => (
                        <Tr key={account.id}>
                          <Td>{account.name}</Td>
                          <Td isNumeric color="red.500" fontWeight="medium">
                            {formatCurrency(account.balance)}
                          </Td>
                        </Tr>
                      ))}
                      <Tr bg="red.50" fontWeight="bold">
                        <Td>Total Current Liabilities</Td>
                        <Td isNumeric color="red.600">
                          {formatCurrency(reportData.liabilities?.current?.total || 0)}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                {/* Long-term Liabilities */}
                <Box mb={6}>
                  <Text fontWeight="bold" mb={2} color="red.700">Long-term Liabilities</Text>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th isNumeric>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reportData.liabilities?.longTerm?.accounts?.map((account) => (
                        <Tr key={account.id}>
                          <Td>{account.name}</Td>
                          <Td isNumeric color="red.500" fontWeight="medium">
                            {formatCurrency(account.balance)}
                          </Td>
                        </Tr>
                      ))}
                      <Tr bg="red.50" fontWeight="bold">
                        <Td>Total Long-term Liabilities</Td>
                        <Td isNumeric color="red.600">
                          {formatCurrency(reportData.liabilities?.longTerm?.total || 0)}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                {/* Equity */}
                <Box>
                  <Text fontWeight="bold" mb={2} color="green.700">Equity</Text>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th isNumeric>Amount</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {reportData.equity?.accounts?.map((account) => (
                        <Tr key={account.id}>
                          <Td>{account.name}</Td>
                          <Td isNumeric color="green.500" fontWeight="medium">
                            {formatCurrency(account.balance)}
                          </Td>
                        </Tr>
                      ))}
                      <Tr bg="green.50" fontWeight="bold">
                        <Td>Total Equity</Td>
                        <Td isNumeric color="green.600">
                          {formatCurrency(calculateTotalEquity())}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>

                {/* Total Liabilities & Equity */}
                <Box borderTop="2px solid" borderColor="red.200" pt={4} mt={4}>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold" color="red.600">
                      Total Liabilities & Equity
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="red.600">
                      {formatCurrency(calculateTotalLiabilities() + calculateTotalEquity())}
                    </Text>
                  </HStack>
                </Box>
              </CardBody>
            </Card>
          </SimpleGrid>
        ) : (
          <Alert status="info">
            <AlertIcon />
            No data available for the selected date. Please generate a report.
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default BalanceSheet; 