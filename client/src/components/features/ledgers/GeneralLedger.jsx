import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
} from '@chakra-ui/react';
import { useBusiness } from '../../../contexts/BusinessContext';
import { useToast } from '../../../contexts/ToastContext';

const GeneralLedger = () => {
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockAccounts = [
        { id: '1', code: '1000', name: 'Cash', type: 'ASSET' },
        { id: '2', code: '1100', name: 'Accounts Receivable', type: 'ASSET' },
        { id: '3', code: '2000', name: 'Accounts Payable', type: 'LIABILITY' },
        { id: '4', code: '3000', name: 'Revenue', type: 'REVENUE' },
        { id: '5', code: '4000', name: 'Expenses', type: 'EXPENSE' }
      ];
      setAccounts(mockAccounts);
    } catch (err) {
      setError('Failed to fetch accounts');
      showToast('error', 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchLedger = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockEntries = [
        {
          id: '1',
          date: '2025-01-01',
          description: 'Opening balance',
          reference: 'OB-001',
          debit: 10000.00,
          credit: 0.00,
          balance: 10000.00
        },
        {
          id: '2',
          date: '2025-01-15',
          description: 'Cash sale',
          reference: 'INV-001',
          debit: 5000.00,
          credit: 0.00,
          balance: 15000.00
        },
        {
          id: '3',
          date: '2025-01-20',
          description: 'Payment to supplier',
          reference: 'PAY-001',
          debit: 0.00,
          credit: 3000.00,
          balance: 12000.00
        }
      ];
      setLedgerEntries(mockEntries);
    } catch (err) {
      setError('Failed to fetch ledger entries');
      showToast('error', 'Failed to fetch ledger entries');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchAccounts();
    }
  }, [selectedBusiness, fetchAccounts]);

  useEffect(() => {
    if (selectedAccount) {
      fetchLedger();
    }
  }, [selectedAccount, startDate, endDate, fetchLedger]);

  const handleExport = (format) => {
    // Mock export functionality
    showToast('info', `Exporting ledger in ${format} format...`);
  };

  if (loading && accounts.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading accounts...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              General Ledger
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Filters */}
              <HStack spacing={4}>
                <FormControl maxW="300px">
                  <FormLabel>Select Account</FormLabel>
                  <Select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    placeholder="Choose an account"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl maxW="200px">
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </FormControl>
                
                <FormControl maxW="200px">
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </FormControl>
              </HStack>

              {/* Export Buttons */}
              <HStack spacing={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleExport('PDF')}
                >
                  Export PDF
                </Button>
                <Button
                  size="sm"
                  colorScheme="green"
                  onClick={() => handleExport('Excel')}
                >
                  Export Excel
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Ledger Table */}
        {selectedAccount && (
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="semibold">
                  Ledger Entries
                </Text>
                <Badge colorScheme="blue">
                  {ledgerEntries.length} entries
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Box textAlign="center" py={8}>
                  <Spinner size="lg" />
                  <Text mt={4}>Loading ledger entries...</Text>
                </Box>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Description</Th>
                      <Th>Reference</Th>
                      <Th isNumeric>Debit</Th>
                      <Th isNumeric>Credit</Th>
                      <Th isNumeric>Balance</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {ledgerEntries.map((entry) => (
                      <Tr key={entry.id}>
                        <Td>
                          <Text fontSize="sm">
                            {new Date(entry.date).toLocaleDateString()}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontWeight="medium">
                            {entry.description}
                          </Text>
                        </Td>
                        <Td>
                          <Badge variant="outline" colorScheme="gray">
                            {entry.reference}
                          </Badge>
                        </Td>
                        <Td isNumeric>
                          {entry.debit > 0 ? (
                            <Text color="green.600" fontWeight="semibold">
                              ₹{entry.debit.toLocaleString()}
                            </Text>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Td>
                        <Td isNumeric>
                          {entry.credit > 0 ? (
                            <Text color="red.600" fontWeight="semibold">
                              ₹{entry.credit.toLocaleString()}
                            </Text>
                          ) : (
                            <Text color="gray.400">-</Text>
                          )}
                        </Td>
                        <Td isNumeric>
                          <Text fontWeight="bold">
                            ₹{entry.balance.toLocaleString()}
                          </Text>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </CardBody>
          </Card>
        )}

        {!selectedAccount && (
          <Card>
            <CardBody>
              <Text textAlign="center" color="gray.500">
                Please select an account to view its ledger entries
              </Text>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default GeneralLedger; 