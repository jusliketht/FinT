import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Divider,
  Button,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import financialStatementsService from '../../services/financialStatementsService';
import { useBusiness } from '../../contexts/BusinessContext';

const IncomeStatement = () => {
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  const [incomeStatement, setIncomeStatement] = useState(null);
  const [fromDate, setFromDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const fetchIncomeStatement = useCallback(async () => {
    if (!selectedBusiness) {
      showToast('Please select a business first', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await financialStatementsService.getIncomeStatement(
        selectedBusiness.id,
        new Date(fromDate),
        new Date(toDate)
      );
      setIncomeStatement(data);
    } catch (error) {
      showToast('Failed to generate income statement', 'error');
      console.error('Error fetching income statement:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, fromDate, toDate, showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchIncomeStatement();
    }
  }, [selectedBusiness, fromDate, toDate, fetchIncomeStatement]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const renderAccountSection = (title, accounts, total) => (
    <Box>
      <Heading size="md" mb={4}>{title}</Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Account</Th>
            <Th isNumeric>Amount</Th>
          </Tr>
        </Thead>
        <Tbody>
          {accounts.map((category) => (
            <React.Fragment key={category.categoryCode}>
              <Tr bg="gray.50">
                <Td fontWeight="bold" colSpan={2}>
                  {category.categoryName}
                </Td>
              </Tr>
              {category.accounts.map((account) => (
                <Tr key={account.id}>
                  <Td pl={8}>{account.name}</Td>
                  <Td isNumeric>{formatCurrency(account.balance)}</Td>
                </Tr>
              ))}
            </React.Fragment>
          ))}
        </Tbody>
      </Table>
      <Box mt={4} p={3} bg="blue.50" borderRadius="md">
        <Text fontWeight="bold">
          Total {title}: {formatCurrency(total)}
        </Text>
      </Box>
    </Box>
  );

  const exportToPDF = async () => {
    try {
      const blob = await financialStatementsService.exportToPDF(
        selectedBusiness.id,
        'income-statement',
        { fromDate, toDate }
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `income-statement-${fromDate}-to-${toDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      showToast('Failed to export PDF', 'error');
    }
  };

  if (!selectedBusiness) {
    return (
      <Alert status="info">
        <AlertIcon />
        Please select a business to view the income statement
      </Alert>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Income Statement</Heading>
            <Text color="gray.600">
              {selectedBusiness.name} - {new Date(fromDate).toLocaleDateString()} to {new Date(toDate).toLocaleDateString()}
            </Text>
          </Box>
          <HStack spacing={3}>
            <FormControl w="200px">
              <FormLabel>From Date</FormLabel>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </FormControl>
            <FormControl w="200px">
              <FormLabel>To Date</FormLabel>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </FormControl>
            <Button
              leftIcon={<DownloadIcon />}
              onClick={exportToPDF}
              colorScheme="blue"
              variant="outline"
            >
              Export PDF
            </Button>
          </HStack>
        </HStack>

        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Generating income statement...</Text>
          </Box>
        ) : incomeStatement ? (
          <VStack spacing={8} align="stretch">
            {/* Revenue */}
            {renderAccountSection('Revenue', incomeStatement.revenue, incomeStatement.totalRevenue)}

            <Divider />

            {/* Expenses */}
            {renderAccountSection('Expenses', incomeStatement.expenses, incomeStatement.totalExpenses)}

            <Divider />

            {/* Net Income */}
            <Box p={6} bg="gray.50" borderRadius="lg">
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Total Revenue:</Text>
                  <Text fontWeight="bold" color="green.600">
                    {formatCurrency(incomeStatement.totalRevenue)}
                  </Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold">Total Expenses:</Text>
                  <Text fontWeight="bold" color="red.600">
                    ({formatCurrency(incomeStatement.totalExpenses)})
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between" w="full">
                  <Text fontWeight="bold" fontSize="lg">Net Income:</Text>
                  <Text 
                    fontWeight="bold" 
                    fontSize="lg"
                    color={incomeStatement.netIncome >= 0 ? 'green.600' : 'red.600'}
                  >
                    {formatCurrency(incomeStatement.netIncome)}
                  </Text>
                </HStack>
                
                {incomeStatement.netIncome >= 0 ? (
                  <Alert status="success">
                    <AlertIcon />
                    Net profit for the period ✓
                  </Alert>
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    Net loss for the period
                  </Alert>
                )}
              </VStack>
            </Box>
          </VStack>
        ) : (
          <Alert status="info">
            <AlertIcon />
            No income statement data available
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default IncomeStatement; 