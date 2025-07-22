import React, { useState, useEffect } from 'react';
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

const CashFlow = () => {
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  
  const [cashFlow, setCashFlow] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('ytd');

  useEffect(() => {
    if (selectedBusiness) {
      fetchCashFlow();
    }
  }, [selectedBusiness, startDate, endDate]);

  const fetchCashFlow = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(`/accounting/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`);
      setCashFlow(response.cashFlow || {});
    } catch (error) {
      setError('Failed to fetch cash flow data');
      showToast('Error fetching cash flow statement', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  const exportCashFlow = async () => {
    try {
      const response = await apiService.get(`/accounting/reports/cash-flow/export?startDate=${startDate}&endDate=${endDate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cash-flow-${startDate}-to-${endDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('Cash flow statement exported successfully', 'success');
    } catch (error) {
      showToast('Error exporting cash flow statement', 'error');
    }
  };

  const calculateTotals = () => {
    const operatingCashFlow = cashFlow.operating?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const investingCashFlow = cashFlow.investing?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const financingCashFlow = cashFlow.financing?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;
    
    return {
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow
    };
  };

  const totals = calculateTotals();

  if (!selectedBusiness) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info">
          <AlertIcon />
          Please select a business to view the cash flow statement.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Cash Flow Statement</Heading>
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
            onClick={exportCashFlow}
          >
            Export
          </Button>
        </HStack>

        {/* Summary Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
          <GridItem>
            <Stat>
              <StatLabel>Operating Cash Flow</StatLabel>
              <StatNumber color={totals.operatingCashFlow >= 0 ? "green.500" : "red.500"}>
                ₹{totals.operatingCashFlow.toLocaleString()}
              </StatNumber>
              <StatHelpText>Cash from operations</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Investing Cash Flow</StatLabel>
              <StatNumber color={totals.investingCashFlow >= 0 ? "green.500" : "red.500"}>
                ₹{totals.investingCashFlow.toLocaleString()}
              </StatNumber>
              <StatHelpText>Cash from investments</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Financing Cash Flow</StatLabel>
              <StatNumber color={totals.financingCashFlow >= 0 ? "green.500" : "red.500"}>
                ₹{totals.financingCashFlow.toLocaleString()}
              </StatNumber>
              <StatHelpText>Cash from financing</StatHelpText>
            </Stat>
          </GridItem>
          <GridItem>
            <Stat>
              <StatLabel>Net Cash Flow</StatLabel>
              <StatNumber color={totals.netCashFlow >= 0 ? "green.500" : "red.500"}>
                ₹{totals.netCashFlow.toLocaleString()}
              </StatNumber>
              <StatHelpText>
                <Badge colorScheme={totals.netCashFlow >= 0 ? "green" : "red"}>
                  {totals.netCashFlow >= 0 ? "POSITIVE" : "NEGATIVE"}
                </Badge>
              </StatHelpText>
            </Stat>
          </GridItem>
        </Grid>

        {/* Cash Flow Details */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Loading cash flow statement...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <VStack spacing={6} align="stretch">
            {/* Operating Activities */}
            <Box>
              <Heading size="md" mb={4} color="blue.600">Operating Activities</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Description</Th>
                    <Th>Category</Th>
                    <Th isNumeric>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {cashFlow.operating?.map((item, index) => (
                    <Tr key={index}>
                      <Td>{item.description}</Td>
                      <Td>
                        <Badge colorScheme="blue">{item.category}</Badge>
                      </Td>
                      <Td isNumeric color={item.amount >= 0 ? "green.500" : "red.500"}>
                        ₹{(item.amount || 0).toLocaleString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Box p={3} bg="blue.50" borderRadius="md" mt={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Net Cash from Operating Activities</Text>
                  <Text fontWeight="bold" color={totals.operatingCashFlow >= 0 ? "green.500" : "red.500"}>
                    ₹{totals.operatingCashFlow.toLocaleString()}
                  </Text>
                </HStack>
              </Box>
            </Box>

            <Divider />

            {/* Investing Activities */}
            <Box>
              <Heading size="md" mb={4} color="purple.600">Investing Activities</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Description</Th>
                    <Th>Category</Th>
                    <Th isNumeric>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {cashFlow.investing?.map((item, index) => (
                    <Tr key={index}>
                      <Td>{item.description}</Td>
                      <Td>
                        <Badge colorScheme="purple">{item.category}</Badge>
                      </Td>
                      <Td isNumeric color={item.amount >= 0 ? "green.500" : "red.500"}>
                        ₹{(item.amount || 0).toLocaleString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Box p={3} bg="purple.50" borderRadius="md" mt={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Net Cash from Investing Activities</Text>
                  <Text fontWeight="bold" color={totals.investingCashFlow >= 0 ? "green.500" : "red.500"}>
                    ₹{totals.investingCashFlow.toLocaleString()}
                  </Text>
                </HStack>
              </Box>
            </Box>

            <Divider />

            {/* Financing Activities */}
            <Box>
              <Heading size="md" mb={4} color="orange.600">Financing Activities</Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Description</Th>
                    <Th>Category</Th>
                    <Th isNumeric>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {cashFlow.financing?.map((item, index) => (
                    <Tr key={index}>
                      <Td>{item.description}</Td>
                      <Td>
                        <Badge colorScheme="orange">{item.category}</Badge>
                      </Td>
                      <Td isNumeric color={item.amount >= 0 ? "green.500" : "red.500"}>
                        ₹{(item.amount || 0).toLocaleString()}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              <Box p={3} bg="orange.50" borderRadius="md" mt={2}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Net Cash from Financing Activities</Text>
                  <Text fontWeight="bold" color={totals.financingCashFlow >= 0 ? "green.500" : "red.500"}>
                    ₹{totals.financingCashFlow.toLocaleString()}
                  </Text>
                </HStack>
              </Box>
            </Box>

            <Divider />

            {/* Net Cash Flow Summary */}
            <Box p={4} bg={totals.netCashFlow >= 0 ? "green.50" : "red.50"} borderRadius="md">
              <HStack justify="space-between">
                <Text fontWeight="bold" fontSize="lg">
                  Net Increase (Decrease) in Cash
                </Text>
                <Text fontWeight="bold" fontSize="lg" color={totals.netCashFlow >= 0 ? "green.500" : "red.500"}>
                  ₹{totals.netCashFlow.toLocaleString()}
                </Text>
              </HStack>
            </Box>

            {/* Cash Flow Analysis */}
            <Box p={4} bg="gray.50" borderRadius="md">
              <Text fontWeight="bold" mb={3}>Cash Flow Analysis</Text>
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <GridItem>
                  <Text>Operating Cash Flow Ratio: {totals.operatingCashFlow > 0 ? 'Positive' : 'Negative'}</Text>
                </GridItem>
                <GridItem>
                  <Text>Cash Flow Coverage: {totals.operatingCashFlow > Math.abs(totals.financingCashFlow) ? 'Good' : 'Poor'}</Text>
                </GridItem>
                <GridItem>
                  <Text>Investment Intensity: {Math.abs(totals.investingCashFlow) > totals.operatingCashFlow ? 'High' : 'Low'}</Text>
                </GridItem>
              </Grid>
            </Box>
          </VStack>
        )}
      </VStack>
    </Container>
  );
};

export default CashFlow; 