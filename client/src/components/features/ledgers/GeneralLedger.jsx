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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  TablePagination,
  Chip,
  IconButton,
  InputAdornment
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { format } from 'date-fns';
import ledgerService from '../../../services/ledgerService';
import accountService from '../../../services/accountService';

const GeneralLedger = () => {
  // State
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    accountId: '',
    description: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 25,
    totalCount: 0
  });
  const [showFilters, setShowFilters] = useState(true);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetchAccounts(),
    ]).then(() => {
      fetchLedgerEntries();
    });
  }, []);

  // Fetch accounts for filtering
  const fetchAccounts = async () => {
    try {
      const { data } = await accountService.getAll();
      setAccounts(data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  // Fetch ledger entries with filters and pagination
  const fetchLedgerEntries = async () => {
    setLoading(true);
    try {
      const { startDate, endDate, accountId, description } = filters;
      const { page, rowsPerPage } = pagination;
      
      const filterParams = {
        ...(startDate && { startDate: format(startDate, 'yyyy-MM-dd') }),
        ...(endDate && { endDate: format(endDate, 'yyyy-MM-dd') }),
        ...(accountId && { accountId }),
        ...(description && { description }),
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage
      };
      
      const { data, totalCount } = await ledgerService.getGeneralLedger(filterParams);
      setEntries(data);
      setPagination(prev => ({ ...prev, totalCount }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch general ledger entries');
      console.error('Error fetching general ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Apply filters
  const handleApplyFilters = () => {
    fetchLedgerEntries();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      startDate: null,
      endDate: null,
      accountId: '',
      description: ''
    });
    // Apply reset immediately
    setPagination(prev => ({ ...prev, page: 0 }));
    fetchLedgerEntries();
  };

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination({
      page: 0,
      rowsPerPage: parseInt(event.target.value, 10),
      totalCount: pagination.totalCount
    });
  };

  // Effects for pagination changes
  useEffect(() => {
    fetchLedgerEntries();
  }, [pagination.page, pagination.rowsPerPage]);

  // Format currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get account name by ID
  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.name}` : accountId;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        General Ledger
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filters</Typography>
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterListIcon />
          </IconButton>
        </Box>

        {showFilters && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                renderInput={(params) => <TextField {...params} sx={{ width: 200 }} />}
                inputFormat="MM/dd/yyyy"
              />

              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                renderInput={(params) => <TextField {...params} sx={{ width: 200 }} />}
                inputFormat="MM/dd/yyyy"
              />
            </LocalizationProvider>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Account</InputLabel>
              <Select
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
                label="Account"
              >
                <MenuItem value="">
                  <em>All Accounts</em>
                </MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.code} - {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Description"
              value={filters.description}
              onChange={(e) => handleFilterChange('description', e.target.value)}
              sx={{ width: 200 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                disabled={loading}
              >
                Apply Filters
              </Button>
              <Button 
                variant="outlined" 
                onClick={handleResetFilters}
                disabled={loading}
              >
                Reset
              </Button>
              <IconButton 
                color="primary" 
                onClick={fetchLedgerEntries}
                disabled={loading}
                title="Refresh"
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Box>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Journal ID</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Debit</TableCell>
              <TableCell align="right">Credit</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  No ledger entries found
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow
                  key={entry.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    {format(new Date(entry.date), 'MM/dd/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={entry.journalId}
                      icon={<ReceiptIcon />}
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccountBalanceIcon fontSize="small" sx={{ mr: 1 }} />
                      {getAccountName(entry.accountId)}
                    </Box>
                  </TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell align="right">
                    {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : ''}
                  </TableCell>
                  <TableCell align="right">
                    {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(entry.balance)}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" title="View Journal Entry">
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={pagination.totalCount}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default GeneralLedger; 