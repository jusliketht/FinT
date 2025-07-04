import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  IconButton,
  Switch,
  Alert,
  VStack,
  HStack,
  Spinner
} from '@chakra-ui/react';
import ledgerService from '../../../services/ledgerService';
import { useToast } from '../../../contexts/ToastContext';

const TrialBalance = () => {
  const [trialBalanceData, setTrialBalanceData] = useState([]);
  const [totals, setTotals] = useState({
    debitTotal: 0,
    creditTotal: 0,
    difference: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [asOfDate] = useState(new Date()); // Date picker not implemented
  const [includeZeroBalances, setIncludeZeroBalances] = useState(false);
  const { showToast } = useToast();

  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      // Date filter not implemented, just use current date
      const filters = {
        asOfDate: asOfDate.toISOString().split('T')[0],
        includeZeroBalances: includeZeroBalances.toString()
      };
      const response = await ledgerService.getTrialBalance(filters);
      setTrialBalanceData(response.data);
      setTotals(response.totals);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trial balance data');
      showToast('Failed to fetch trial balance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialBalance();
    // eslint-disable-next-line
  }, []);

  const handleIncludeZeroBalancesChange = (e) => {
    setIncludeZeroBalances(e.target.checked);
  };

  const handleApplyFilters = () => {
    fetchTrialBalance();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleDownloadCSV = () => {
    const headers = ['Account Code', 'Account Name', 'Account Type', 'Debit Balance', 'Credit Balance'];
    const csvData = [
      headers.join(','),
      ...trialBalanceData.map(row => [
        row.accountCode,
        `"${row.accountName}"`,
        row.accountType,
        row.debitBalance.toFixed(2),
        row.creditBalance.toFixed(2)
      ].join(','))
    ];
    csvData.push([
      '', 'TOTALS', '',
      totals.debitTotal.toFixed(2),
      totals.creditTotal.toFixed(2)
    ].join(','));
    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trial_balance_${asOfDate.toISOString().split('T')[0].replace(/-/g, '')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box p={6} className="printable-content">
      <Heading as="h1" size="lg" mb={6}>
        Trial Balance
      </Heading>

      <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" mb={6}>
        <HStack spacing={6} align="center" mb={2} flexWrap="wrap">
          {/* Date picker not implemented */}
          <HStack>
            <Switch
              isChecked={includeZeroBalances}
              onChange={handleIncludeZeroBalancesChange}
              colorScheme="blue"
              id="include-zero-balances"
            />
            <Text htmlFor="include-zero-balances">Include Zero Balances</Text>
          </HStack>
          <Button
            colorScheme="blue"
            onClick={handleApplyFilters}
            isLoading={loading}
          >
            Apply Filters
          </Button>
          <IconButton
            icon={<span role="img" aria-label="refresh">🔄</span>}
            onClick={fetchTrialBalance}
            isDisabled={loading}
            aria-label="Refresh"
          />
          <IconButton
            icon={<span role="img" aria-label="download">⬇️</span>}
            onClick={handleDownloadCSV}
            isDisabled={loading || trialBalanceData.length === 0}
            aria-label="Download as CSV"
          />
          <IconButton
            icon={<span role="img" aria-label="print">🖨️</span>}
            onClick={handlePrint}
            isDisabled={loading || trialBalanceData.length === 0}
            aria-label="Print"
          />
        </HStack>
      </Box>

      {error && (
        <Alert status="error" mb={6}>
          {error}
        </Alert>
      )}
      {loading ? (
        <Box textAlign="center" py={12}>
          <Spinner size="xl" />
          <Text mt={4}>Loading trial balance...</Text>
        </Box>
      ) : (
        <Box overflowX="auto" borderWidth="1px" borderRadius="lg" bg="white">
          <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f7fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Account Code</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Account Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Account Type</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold' }}>Debit Balance</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold' }}>Credit Balance</th>
              </tr>
            </thead>
            <tbody>
              {trialBalanceData.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{row.accountCode}</td>
                  <td style={{ padding: '12px' }}>{row.accountName}</td>
                  <td style={{ padding: '12px' }}>{row.accountType}</td>
                  <td style={{ textAlign: 'right', padding: '12px' }}>{formatCurrency(row.debitBalance)}</td>
                  <td style={{ textAlign: 'right', padding: '12px' }}>{formatCurrency(row.creditBalance)}</td>
                </tr>
              ))}
              {/* Totals row */}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f7fafc' }}>
                <td style={{ padding: '12px' }}></td>
                <td style={{ padding: '12px' }}>TOTALS</td>
                <td style={{ padding: '12px' }}></td>
                <td style={{ textAlign: 'right', padding: '12px' }}>{formatCurrency(totals.debitTotal)}</td>
                <td style={{ textAlign: 'right', padding: '12px' }}>{formatCurrency(totals.creditTotal)}</td>
              </tr>
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
};

export default TrialBalance; 