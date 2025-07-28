import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Input,
  Select,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  Alert,
  IconButton,
} from '@chakra-ui/react';
import { SettingsIcon, RepeatIcon } from '@chakra-ui/icons';
import { useToast } from '../../../contexts/ToastContext';
import useApi from '../../../hooks/useApi';
import accountService from '../../../services/accountService';

const GeneralLedger = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    accountId: '',
    description: ''
  });
  const toast = useToast();

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountService.getAll();
      setAccounts(response.data || response);
    } catch (err) {
      setError('Failed to fetch accounts');
      toast({
        title: 'Error',
        description: 'Failed to load accounts',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      const filterParams = {
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.accountId && { accountId: filters.accountId }),
        ...(filters.description && { description: filters.description })
      };
      
      const response = await api.get('/api/ledger', { params: filterParams });
      setLedgerData(response.data);
    } catch (error) {
      showToast('Error fetching ledger data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchLedgerData();
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      accountId: '',
      description: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">General Ledger</Heading>
        <HStack spacing={2}>
          <IconButton
            icon={<SettingsIcon />}
            onClick={() => setShowFilters(!showFilters)}
            variant="ghost"
          />
          <IconButton
            icon={<RepeatIcon />}
            onClick={fetchLedgerData}
            variant="ghost"
          />
        </HStack>
      </HStack>

      {/* Filters */}
      {showFilters && (
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} w="100%">
                <Box mb={4}>
                  <Text fontWeight="medium" mb={2}>Start Date</Text>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </Box>

                <Box mb={4}>
                  <Text fontWeight="medium" mb={2}>End Date</Text>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </Box>

                <Box mb={4}>
                  <Text fontWeight="medium" mb={2}>Account</Text>
                  <Select
                    value={filters.accountId}
                    onChange={(e) => handleFilterChange('accountId', e.target.value)}
                    placeholder="All accounts"
                  >
                    {accounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name} ({account.code})
                      </option>
                    ))}
                  </Select>
                </Box>

                <Box mb={4}>
                  <Text fontWeight="medium" mb={2}>Description</Text>
                  <Input
                    placeholder="Search description..."
                    value={filters.description}
                    onChange={(e) => handleFilterChange('description', e.target.value)}
                  />
                </Box>
              </HStack>

              <HStack spacing={4}>
                <Button
                  colorScheme="blue"
                  onClick={handleApplyFilters}
                  isLoading={loading}
                  loadingText="Loading..."
                >
                  Apply Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                >
                  Reset
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Ledger Data */}
      {loading ? (
        <Text>Loading ledger data...</Text>
      ) : ledgerData.length === 0 ? (
        <Alert status="info">
          No ledger data found. Please adjust your filters and try again.
        </Alert>
      ) : (
        <Card>
          <CardBody>
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f7fafc' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Account</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Description</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Debit</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Credit</th>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.map((entry, index) => (
                    <tr key={index}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                        {entry.accountName || entry.accountId}
                      </td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                        {entry.description}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                        {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                        {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                        {formatCurrency(entry.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default GeneralLedger; 