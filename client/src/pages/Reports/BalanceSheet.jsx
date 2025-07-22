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

const BalanceSheet = () => {
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  
  const [balanceSheet, setBalanceSheet] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('');

  useEffect(() => {
    if (selectedBusiness) {
      fetchBalanceSheet();
    }
  }, [selectedBusiness, asOfDate]);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(`/accounting/reports/balance-sheet?asOfDate=${asOfDate}`);
      setBalanceSheet(response.balanceSheet || {});
    } catch (error) {
      setError('Failed to fetch balance sheet data');
      showToast('Error fetching balance sheet', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportBalanceSheet = async () => {
    try {
      const response = await apiService.get(`/accounting/reports/balance-sheet/export?asOfDate=${asOfDate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `balance-sheet-${asOfDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('Balance sheet exported successfully', 'success');
    } catch (error) {
      showToast('Error exporting balance sheet', 'error');
    }
  };

  const calculateTotals = () => {
    const totalAssets = balanceSheet.assets?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
    const totalLiabilities = balanceSheet.liabilities?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
    const totalEquity = balanceSheet.equity?.reduce((sum, item) => sum + (item.balance || 0), 0) || 0;
    
    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
    };
  };

  const totals = calculateTotals();

  const filteredAccounts = (accounts) => {
    if (!accounts) return [];
    return accounts.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !accountTypeFilter || account.type === accountTypeFilter;
      return matchesSearch && matchesType;
    });
  };

  if (!selectedBusiness) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info">
          <AlertIcon />
          Please select a business to view the balance sheet.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Balance Sheet</Heading>
          <Text color="gray.600">
            As of {new Date(asOfDate).toLocaleDateString()}
          </Text>
        </Box>

        {/* Controls */}
        <HStack spacing={4} wrap="wrap">
          <InputGroup maxW="200px">
            <InputLeftElement pointerEvents="none">
              <CalendarIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </InputGroup>
          
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select
            placeholder="Filter by type"
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
            maxW="200px"
          >
            <option value="asset">Assets</option>
            <option value="liability">Liabilities</option>
            <option value="equity">Equity</option>
          </Select>
          
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            onClick={exportBalanceSheet}
          >
            Export
          </Button>
        </HStack>

        {/* Balance Status */}
        <Box>
          <HStack spacing={6}>
            <Stat>
              <StatLabel>Total Assets</StatLabel>
              <StatNumber color="blue.500">₹{totals.totalAssets.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Liabilities</StatLabel>
              <StatNumber color="red.500">₹{totals.totalLiabilities.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Equity</StatLabel>
              <StatNumber color="green.500">₹{totals.totalEquity.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Liabilities + Equity</StatLabel>
              <StatNumber color="purple.500">₹{totals.totalLiabilitiesAndEquity.toLocaleString()}</StatNumber>
              <StatHelpText>
                <Badge colorScheme={totals.isBalanced ? "green" : "red"}>
                  {totals.isBalanced ? "BALANCED" : "UNBALANCED"}
                </Badge>
              </StatHelpText>
            </Stat>
          </HStack>
        </Box>

        {/* Balance Sheet Details */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Loading balance sheet...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Grid templateColumns="repeat(auto-fit, minmax(500px, 1fr))" gap={6}>
            {/* Assets */}
            <GridItem>
              <Box>
                <Heading size="md" mb={4} color="blue.600">Assets</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Account</Th>
                      <Th>Description</Th>
                      <Th isNumeric>Balance</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAccounts(balanceSheet.assets).map((item) => (
                      <Tr key={item.id}>
                        <Td fontWeight="bold">{item.code}</Td>
                        <Td>{item.name}</Td>
                        <Td isNumeric color="blue.500">
                          ₹{(item.balance || 0).toLocaleString()}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                <Box p={3} bg="blue.50" borderRadius="md" mt={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Total Assets</Text>
                    <Text fontWeight="bold" color="blue.500">
                      ₹{totals.totalAssets.toLocaleString()}
                    </Text>
                  </HStack>
                </Box>
              </Box>
            </GridItem>

            {/* Liabilities and Equity */}
            <GridItem>
              <VStack spacing={6} align="stretch">
                {/* Liabilities */}
                <Box>
                  <Heading size="md" mb={4} color="red.600">Liabilities</Heading>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th>Description</Th>
                        <Th isNumeric>Balance</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredAccounts(balanceSheet.liabilities).map((item) => (
                        <Tr key={item.id}>
                          <Td fontWeight="bold">{item.code}</Td>
                          <Td>{item.name}</Td>
                          <Td isNumeric color="red.500">
                            ₹{(item.balance || 0).toLocaleString()}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  <Box p={3} bg="red.50" borderRadius="md" mt={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Total Liabilities</Text>
                      <Text fontWeight="bold" color="red.500">
                        ₹{totals.totalLiabilities.toLocaleString()}
                      </Text>
                    </HStack>
                  </Box>
                </Box>

                {/* Equity */}
                <Box>
                  <Heading size="md" mb={4} color="green.600">Equity</Heading>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account</Th>
                        <Th>Description</Th>
                        <Th isNumeric>Balance</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredAccounts(balanceSheet.equity).map((item) => (
                        <Tr key={item.id}>
                          <Td fontWeight="bold">{item.code}</Td>
                          <Td>{item.name}</Td>
                          <Td isNumeric color="green.500">
                            ₹{(item.balance || 0).toLocaleString()}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  <Box p={3} bg="green.50" borderRadius="md" mt={2}>
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Total Equity</Text>
                      <Text fontWeight="bold" color="green.500">
                        ₹{totals.totalEquity.toLocaleString()}
                      </Text>
                    </HStack>
                  </Box>
                </Box>

                {/* Total Liabilities and Equity */}
                <Box p={3} bg="purple.50" borderRadius="md">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Total Liabilities & Equity</Text>
                    <Text fontWeight="bold" color="purple.500">
                      ₹{totals.totalLiabilitiesAndEquity.toLocaleString()}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </GridItem>
          </Grid>
        )}

        {/* Financial Ratios */}
        {!loading && !error && (
          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="bold" mb={3}>Financial Ratios</Text>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <GridItem>
                <Text>Current Ratio: {totals.totalAssets > 0 ? (totals.totalAssets / Math.max(totals.totalLiabilities, 1)).toFixed(2) : 'N/A'}</Text>
              </GridItem>
              <GridItem>
                <Text>Debt to Equity: {totals.totalEquity > 0 ? (totals.totalLiabilities / totals.totalEquity).toFixed(2) : 'N/A'}</Text>
              </GridItem>
              <GridItem>
                <Text>Working Capital: ₹{(totals.totalAssets - totals.totalLiabilities).toLocaleString()}</Text>
              </GridItem>
            </Grid>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default BalanceSheet; 