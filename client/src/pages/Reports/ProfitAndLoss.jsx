import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon, CalendarIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { apiService } from '../../services/apiService';

const ProfitAndLoss = () => {
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  
  const [profitLoss, setProfitLoss] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('ytd');

  const fetchProfitLoss = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(`/accounting/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`);
      setProfitLoss(response.profitLoss || {});
    } catch (error) {
      setError('Failed to fetch profit and loss data');
      showToast('Error fetching profit and loss report', 'error');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchProfitLoss();
    }
  }, [selectedBusiness, startDate, endDate, fetchProfitLoss]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    const today = new Date();
    
    switch (newPeriod) {
      case 'ytd':
        setStartDate(new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'mtd':
        setStartDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'qtd':
        const quarter = Math.floor(today.getMonth() / 3);
        setStartDate(new Date(today.getFullYear(), quarter * 3, 1).toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'custom':
        // Keep current dates
        break;
    }
  };

  const exportProfitLoss = async () => {
    try {
      const response = await apiService.get(`/accounting/reports/profit-loss/export?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `profit-loss-${startDate}-to-${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('Profit and Loss report exported successfully', 'success');
    } catch (error) {
      showToast('Error exporting profit and loss report', 'error');
    }
  };

  const calculateNetIncome = () => {
    const totalRevenue = profitLoss.revenue?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
    const totalExpenses = profitLoss.expenses?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
    return totalRevenue - totalExpenses;
  };

  const netIncome = calculateNetIncome();
  const totalRevenue = profitLoss.revenue?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
  const totalExpenses = profitLoss.expenses?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;

  if (!selectedBusiness) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info">
          <AlertIcon />
          Please select a business to view the profit and loss report.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Profit and Loss Statement</Heading>
          <Text color="gray.600">
            For the period {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </Text>
        </Box>

        {/* Controls */}
        <HStack spacing={4} wrap="wrap">
          <Select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            maxW="200px"
          >
            <option value="ytd">Year to Date</option>
            <option value="mtd">Month to Date</option>
            <option value="qtd">Quarter to Date</option>
            <option value="custom">Custom Period</option>
          </Select>
          
          {period === 'custom' && (
            <>
              <InputGroup maxW="200px">
                <InputLeftElement pointerEvents="none">
                  <CalendarIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </InputGroup>
              
              <InputGroup maxW="200px">
                <InputLeftElement pointerEvents="none">
                  <CalendarIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </InputGroup>
            </>
          )}
          
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            onClick={exportProfitLoss}
          >
            Export
          </Button>
        </HStack>

        {/* Summary Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
          <GridItem>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber color="green.500">₹{totalRevenue.toLocaleString()}</StatNumber>
              <StatHelpText>Gross income</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Total Expenses</StatLabel>
              <StatNumber color="red.500">₹{totalExpenses.toLocaleString()}</StatNumber>
              <StatHelpText>Total costs</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Net Income</StatLabel>
              <StatNumber color={netIncome >= 0 ? "green.500" : "red.500"}>
                ₹{Math.abs(netIncome).toLocaleString()}
              </StatNumber>
              <StatHelpText>
                <Badge colorScheme={netIncome >= 0 ? "green" : "red"}>
                  {netIncome >= 0 ? "PROFIT" : "LOSS"}
                </Badge>
              </StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Profit Margin</StatLabel>
              <StatNumber color={netIncome >= 0 ? "green.500" : "red.500"}>
                {totalRevenue > 0 ? ((netIncome / totalRevenue) * 100).toFixed(1) : 0}%
              </StatNumber>
              <StatHelpText>Net income / Revenue</StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        {/* Profit and Loss Details */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Loading profit and loss report...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <VStack spacing={6} align="stretch">
            {/* Revenue Section */}
            <Box>
              <Heading size="md" mb={4} color="green.600">Revenue</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Account</Th>
                    <Th>Description</Th>
                    <Th isNumeric>Amount</Th>
                    <Th isNumeric>% of Revenue</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {profitLoss.revenue?.map((item) => (
                    <Tr key={item.id}>
                      <Td fontWeight="bold">{item.code}</Td>
                      <Td>{item.name}</Td>
                      <Td isNumeric color="green.500">
                        ₹{(item.balance || 0).toLocaleString()}
                      </Td>
                      <Td isNumeric>
                        {totalRevenue > 0 ? (((item.balance || 0) / totalRevenue) * 100).toFixed(1) : 0}%
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Box p={3} bg="green.50" borderRadius="md" mt={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Total Revenue</Text>
                  <Text fontWeight="bold" color="green.500">
                    ₹{totalRevenue.toLocaleString()}
                  </Text>
                </HStack>
              </Box>
            </Box>

            <Divider />

            {/* Expenses Section */}
            <Box>
              <Heading size="md" mb={4} color="red.600">Expenses</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Account</Th>
                    <Th>Description</Th>
                    <Th isNumeric>Amount</Th>
                    <Th isNumeric>% of Revenue</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {profitLoss.expenses?.map((item) => (
                    <Tr key={item.id}>
                      <Td fontWeight="bold">{item.code}</Td>
                      <Td>{item.name}</Td>
                      <Td isNumeric color="red.500">
                        ₹{(item.balance || 0).toLocaleString()}
                      </Td>
                      <Td isNumeric>
                        {totalRevenue > 0 ? (((item.balance || 0) / totalRevenue) * 100).toFixed(1) : 0}%
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Box p={3} bg="red.50" borderRadius="md" mt={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Total Expenses</Text>
                  <Text fontWeight="bold" color="red.500">
                    ₹{totalExpenses.toLocaleString()}
                  </Text>
                </HStack>
              </Box>
            </Box>

            <Divider />

            {/* Net Income Summary */}
            <Box p={4} bg={netIncome >= 0 ? "green.50" : "red.50"} borderRadius="md">
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                  {netIncome >= 0 ? "Net Profit" : "Net Loss"}
                </Text>
                <Text fontWeight="bold" fontSize="lg" color={netIncome >= 0 ? "green.500" : "red.500"}>
                  ₹{Math.abs(netIncome).toLocaleString()}
                </Text>
              </HStack>
            </Box>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default ProfitAndLoss; 