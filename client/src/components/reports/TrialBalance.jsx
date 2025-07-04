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
  Badge
} from '@chakra-ui/react';
import { DownloadIcon, PrintIcon, RefreshIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

const TrialBalance = () => {
  const api = useApi();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get('/accounting/reports/trial-balance', {
        params: { asOfDate }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching trial balance:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trial balance',
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
      const response = await api.get('/accounting/reports/trial-balance/export', {
        params: { asOfDate, format },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trial-balance-${asOfDate}.${format}`);
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

  const getAccountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'asset': return 'blue';
      case 'liability': return 'red';
      case 'equity': return 'green';
      case 'revenue': return 'purple';
      case 'expense': return 'orange';
      default: return 'gray';
    }
  };

  const calculateTotalDebits = () => {
    if (!reportData?.accounts) return 0;
    return reportData.accounts.reduce((sum, account) => sum + (account.debitBalance || 0), 0);
  };

  const calculateTotalCredits = () => {
    if (!reportData?.accounts) return 0;
    return reportData.accounts.reduce((sum, account) => sum + (account.creditBalance || 0), 0);
  };

  const isBalanced = () => {
    return Math.abs(calculateTotalDebits() - calculateTotalCredits()) < 0.01;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Generating Trial Balance...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Trial Balance</Heading>
            <Text color="gray.600">
              Trial Balance as of {asOfDate}
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
          <StatGroup>
            <Stat>
              <StatLabel>Total Debits</StatLabel>
              <StatNumber color="blue.500">
                {formatCurrency(calculateTotalDebits())}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Credits</StatLabel>
              <StatNumber color="green.500">
                {formatCurrency(calculateTotalCredits())}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Difference</StatLabel>
              <StatNumber color={isBalanced() ? 'green.500' : 'red.500'}>
                {formatCurrency(calculateTotalDebits() - calculateTotalCredits())}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Status</StatLabel>
              <StatNumber>
                <Badge colorScheme={isBalanced() ? 'green' : 'red'} fontSize="sm">
                  {isBalanced() ? 'BALANCED' : 'UNBALANCED'}
                </Badge>
              </StatNumber>
            </Stat>
          </StatGroup>
        )}

        {/* Trial Balance Table */}
        {reportData ? (
          <Card>
            <CardBody>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Account Code</Th>
                    <Th>Account Name</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Debit Balance</Th>
                    <Th isNumeric>Credit Balance</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {reportData.accounts?.map((account) => (
                    <Tr key={account.id}>
                      <Td fontWeight="medium">{account.code}</Td>
                      <Td>{account.name}</Td>
                      <Td>
                        <Badge colorScheme={getAccountTypeColor(account.type)} size="sm">
                          {account.type}
                        </Badge>
                      </Td>
                      <Td isNumeric color="blue.500" fontWeight="medium">
                        {account.debitBalance > 0 ? formatCurrency(account.debitBalance) : '-'}
                      </Td>
                      <Td isNumeric color="green.500" fontWeight="medium">
                        {account.creditBalance > 0 ? formatCurrency(account.creditBalance) : '-'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              {/* Totals Row */}
              <Box mt={4} pt={4} borderTop="2px solid" borderColor="gray.200">
                <Table variant="simple" size="sm">
                  <Tbody>
                    <Tr bg="gray.50" fontWeight="bold">
                      <Td colSpan={3}>TOTALS</Td>
                      <Td isNumeric color="blue.600">
                        {formatCurrency(calculateTotalDebits())}
                      </Td>
                      <Td isNumeric color="green.600">
                        {formatCurrency(calculateTotalCredits())}
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>

              {/* Balance Check */}
              <Box mt={4} p={4} bg={isBalanced() ? 'green.50' : 'red.50'} borderRadius="md">
                <HStack justify="space-between">
                  <Text fontWeight="medium" color={isBalanced() ? 'green.700' : 'red.700'}>
                    {isBalanced() ? '✓ Trial Balance is Balanced' : '✗ Trial Balance is Unbalanced'}
                  </Text>
                  <Text fontSize="sm" color={isBalanced() ? 'green.600' : 'red.600'}>
                    Difference: {formatCurrency(calculateTotalDebits() - calculateTotalCredits())}
                  </Text>
                </HStack>
              </Box>
            </CardBody>
          </Card>
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

export default TrialBalance; 