import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import PrintIcon from '@mui/icons-material/Print';
import { format } from 'date-fns';
import ledgerService from '../../../services/ledgerService';

const TrialBalance = () => {
  // State
  const [trialBalanceData, setTrialBalanceData] = useState([]);
  const [totals, setTotals] = useState({
    debitTotal: 0,
    creditTotal: 0,
    difference: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date());
  const [includeZeroBalances, setIncludeZeroBalances] = useState(false);

  // Fetch trial balance data
  const fetchTrialBalance = async () => {
    setLoading(true);
    try {
      const filters = {
        asOfDate: format(asOfDate, 'yyyy-MM-dd'),
        includeZeroBalances: includeZeroBalances.toString()
      };
      
      const response = await ledgerService.getTrialBalance(filters);
      setTrialBalanceData(response.data);
      setTotals(response.totals);
      setError(null);
    } catch (err) {
      setError('Failed to fetch trial balance data');
      console.error('Error fetching trial balance:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchTrialBalance();
  }, []);

  // Handle filter change
  const handleAsOfDateChange = (newDate) => {
    setAsOfDate(newDate);
  };

  const handleIncludeZeroBalancesChange = (event) => {
    setIncludeZeroBalances(event.target.checked);
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchTrialBalance();
  };

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Handle download as CSV
  const handleDownloadCSV = () => {
    const headers = ['Account Code', 'Account Name', 'Account Type', 'Debit Balance', 'Credit Balance'];
    
    const csvData = [
      headers.join(','),
      ...trialBalanceData.map(row => [
        row.accountCode,
        `"${row.accountName}"`, // Quote names in case they contain commas
        row.accountType,
        row.debitBalance.toFixed(2),
        row.creditBalance.toFixed(2)
      ].join(','))
    ];
    
    // Add totals row
    csvData.push([
      '','TOTALS','',
      totals.debitTotal.toFixed(2),
      totals.creditTotal.toFixed(2)
    ].join(','));
    
    const csvContent = csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trial_balance_${format(asOfDate, 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ p: 3 }} className="printable-content">
      <Typography variant="h4" component="h1" gutterBottom>
        Trial Balance
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="As of Date"
              value={asOfDate}
              onChange={handleAsOfDateChange}
              renderInput={(params) => <TextField {...params} sx={{ width: 200 }} />}
              inputFormat="MM/dd/yyyy"
            />
          </LocalizationProvider>

          <FormControlLabel
            control={
              <Switch
                checked={includeZeroBalances}
                onChange={handleIncludeZeroBalancesChange}
                color="primary"
              />
            }
            label="Include Zero Balances"
          />

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="contained"
            onClick={handleApplyFilters}
            disabled={loading}
          >
            Apply Filters
          </Button>

          <IconButton 
            color="primary" 
            onClick={fetchTrialBalance}
            disabled={loading}
            title="Refresh"
          >
            <RefreshIcon />
          </IconButton>

          <IconButton 
            color="primary" 
            onClick={handleDownloadCSV}
            disabled={loading || trialBalanceData.length === 0}
            title="Download as CSV"
          >
            <DownloadIcon />
          </IconButton>

          <IconButton 
            color="primary" 
            onClick={handlePrint}
            disabled={loading || trialBalanceData.length === 0}
            title="Print"
          >
            <PrintIcon />
          </IconButton>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Trial Balance
        </Typography>
        <Typography variant="subtitle1">
          As of {format(asOfDate, 'MMMM dd, yyyy')}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Account Code</TableCell>
              <TableCell>Account Name</TableCell>
              <TableCell>Account Type</TableCell>
              <TableCell align="right">Debit Balance</TableCell>
              <TableCell align="right">Credit Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : trialBalanceData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  No trial balance data found
                </TableCell>
              </TableRow>
            ) : (
              <>
                {/* Group by account type */}
                {Array.from(
                  new Set(trialBalanceData.map(item => item.accountType))
                ).map(accountType => (
                  <React.Fragment key={accountType}>
                    {/* Account Type Header */}
                    <TableRow>
                      <TableCell 
                        colSpan={5} 
                        sx={{ 
                          fontWeight: 'bold', 
                          backgroundColor: 'rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        {accountType}
                      </TableCell>
                    </TableRow>
                    
                    {/* Accounts in this type */}
                    {trialBalanceData
                      .filter(item => item.accountType === accountType)
                      .map((row) => (
                        <TableRow
                          key={row.accountId}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>{row.accountCode}</TableCell>
                          <TableCell>{row.accountName}</TableCell>
                          <TableCell>{row.accountType}</TableCell>
                          <TableCell align="right">
                            {row.debitBalance > 0 ? formatCurrency(row.debitBalance) : ''}
                          </TableCell>
                          <TableCell align="right">
                            {row.creditBalance > 0 ? formatCurrency(row.creditBalance) : ''}
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </React.Fragment>
                ))}

                {/* Totals Row */}
                <TableRow sx={{ fontWeight: 'bold' }}>
                  <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                    TOTALS
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.debitTotal)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(totals.creditTotal)}
                  </TableCell>
                </TableRow>

                {/* Out of balance warning if applicable */}
                {totals.difference > 0.01 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Alert severity="error">
                        Trial Balance is out of balance by {formatCurrency(totals.difference)}
                      </Alert>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TrialBalance; 