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
} from '@chakra-ui/react';
import { SearchIcon, DownloadIcon, CalendarIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { apiService } from '../../services/apiService';

const TrialBalance = () => {
  const { user } = useAuth();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  
  const [trialBalance, setTrialBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('');

  useEffect(() => {
    if (selectedBusiness) {
      fetchTrialBalance();
    }
  }, [selectedBusiness, asOfDate]);

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.get(`/accounting/reports/trial-balance?asOfDate=${asOfDate}`);
      setTrialBalance(response.trialBalance || []);
    } catch (error) {
      setError('Failed to fetch trial balance data');
      showToast('Error fetching trial balance', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportTrialBalance = async () => {
    try {
      const response = await apiService.get(`/accounting/reports/trial-balance/export?asOfDate=${asOfDate}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trial-balance-${asOfDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast('Trial balance exported successfully', 'success');
    } catch (error) {
      showToast('Error exporting trial balance', 'error');
    }
  };

  const calculateTotals = () => {
    const totals = trialBalance.reduce((acc, account) => {
      acc.debits += account.debitBalance || 0;
      acc.credits += account.creditBalance || 0;
      return acc;
    }, { debits: 0, credits: 0 });

    return totals;
  };

  const filteredTrialBalance = trialBalance.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !accountTypeFilter || account.type === accountTypeFilter;
    return matchesSearch && matchesType;
  });

  const totals = calculateTotals();
  const isBalanced = Math.abs(totals.debits - totals.credits) < 0.01;

  if (!selectedBusiness) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info">
          <AlertIcon />
          Please select a business to view the trial balance.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Trial Balance</Heading>
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
            <option value="revenue">Revenue</option>
            <option value="expense">Expenses</option>
          </Select>
          
          <Button
            leftIcon={<DownloadIcon />}
            colorScheme="blue"
            onClick={exportTrialBalance}
          >
            Export
          </Button>
        </HStack>

        {/* Balance Status */}
        <Box>
          <HStack spacing={6}>
            <Stat>
              <StatLabel>Total Debits</StatLabel>
              <StatNumber color="red.500">₹{totals.debits.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Credits</StatLabel>
              <StatNumber color="green.500">₹{totals.credits.toLocaleString()}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Difference</StatLabel>
              <StatNumber color={isBalanced ? "green.500" : "red.500"}>
                ₹{Math.abs(totals.debits - totals.credits).toFixed(2)}
              </StatNumber>
              <StatHelpText>
                <Badge colorScheme={isBalanced ? "green" : "red"}>
                  {isBalanced ? "BALANCED" : "UNBALANCED"}
                </Badge>
              </StatHelpText>
            </Stat>
          </HStack>
        </Box>

        {/* Trial Balance Table */}
        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Loading trial balance...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Account Code</Th>
                  <Th>Account Name</Th>
                  <Th>Type</Th>
                  <Th isNumeric>Debit Balance</Th>
                  <Th isNumeric>Credit Balance</Th>
                  <Th isNumeric>Net Balance</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredTrialBalance.map((account) => {
                  const netBalance = (account.debitBalance || 0) - (account.creditBalance || 0);
                  const isDebit = netBalance > 0;
                  
                  return (
                    <Tr key={account.id}>
                      <Td fontWeight="bold">{account.code}</Td>
                      <Td>{account.name}</Td>
                      <Td>
                        <Badge colorScheme={
                          account.type === 'asset' ? 'blue' :
                          account.type === 'liability' ? 'red' :
                          account.type === 'equity' ? 'purple' :
                          account.type === 'revenue' ? 'green' : 'orange'
                        }>
                          {account.type.toUpperCase()}
                        </Badge>
                      </Td>
                      <Td isNumeric color="red.500">
                        {(account.debitBalance || 0).toLocaleString()}
                      </Td>
                      <Td isNumeric color="green.500">
                        {(account.creditBalance || 0).toLocaleString()}
                      </Td>
                      <Td isNumeric fontWeight="bold" color={isDebit ? "red.500" : "green.500"}>
                        {Math.abs(netBalance).toLocaleString()}
                        {isDebit ? ' Dr' : ' Cr'}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Summary */}
        {!loading && !error && filteredTrialBalance.length > 0 && (
          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="bold" mb={2}>Summary</Text>
            <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
              <GridItem>
                <Text>Total Accounts: {filteredTrialBalance.length}</Text>
              </GridItem>
              <GridItem>
                <Text>Active Accounts: {filteredTrialBalance.filter(a => a.isActive).length}</Text>
              </GridItem>
              <GridItem>
                <Text>Zero Balance Accounts: {filteredTrialBalance.filter(a => 
                  (a.debitBalance || 0) === 0 && (a.creditBalance || 0) === 0
                ).length}</Text>
              </GridItem>
            </Grid>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default TrialBalance; 