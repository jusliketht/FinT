import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  Snackbar,
  Chip,
  Tooltip,
  TablePagination,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import accountService from '../../../services/accountService';
import accountTypeService from '../../../services/accountTypeService';
import accountCategoryService from '../../../services/accountCategoryService';
import AccountForm from './AccountForm';
import AccountDetail from './AccountDetail';

const AccountsManager = () => {
  // State
  const [accounts, setAccounts] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({ typeId: '', categoryId: '', search: '' });
  const [pagination, setPagination] = useState({
    page: 0,
    rowsPerPage: 10,
    totalCount: 0
  });
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    Promise.all([
      fetchAccountTypes(),
      fetchCategories(),
    ]).then(() => {
      fetchAccounts();
    });
  }, []);

  // Update filtered categories when account type changes
  useEffect(() => {
    if (filters.typeId) {
      const typeCategories = categories.filter(cat => cat.typeId === filters.typeId);
      setFilteredCategories(typeCategories);
      
      // Reset category filter if current selection doesn't match the type
      if (filters.categoryId) {
        const categoryExists = typeCategories.some(cat => cat.id === filters.categoryId);
        if (!categoryExists) {
          setFilters(prev => ({ ...prev, categoryId: '' }));
        }
      }
    } else {
      setFilteredCategories(categories);
    }
  }, [filters.typeId, categories]);

  // Fetch accounts from API
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const { typeId, categoryId, search } = filters;
      const { page, rowsPerPage } = pagination;
      
      const filterParams = {
        ...(typeId && { typeId }),
        ...(categoryId && { categoryId }),
        ...(search && { search }),
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage
      };
      
      const { data, totalCount } = await accountService.getAll(filterParams);
      setAccounts(data);
      setPagination(prev => ({ ...prev, totalCount }));
      setError(null);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch account types from API
  const fetchAccountTypes = async () => {
    try {
      const data = await accountTypeService.getAll();
      setAccountTypes(data);
    } catch (err) {
      console.error('Error fetching account types:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch account types',
        severity: 'error'
      });
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const data = await accountCategoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching account categories:', err);
      setSnackbar({
        open: true,
        message: 'Failed to fetch account categories',
        severity: 'error'
      });
    }
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, page: 0 }));
    
    // If we change the account type, we might need to update filtered categories
    if (name === 'typeId' && value) {
      setFilters(prev => ({ ...prev, categoryId: '' }));
    }
  };

  // Handle search input change with debounce
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
      setPagination(prev => ({ ...prev, page: 0 }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setPagination(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  // Effects for pagination and filter changes
  useEffect(() => {
    fetchAccounts();
  }, [pagination.page, pagination.rowsPerPage, filters]);

  // Open form for adding a new account
  const handleAddClick = () => {
    setSelectedAccount(null);
    setFormOpen(true);
  };

  // Open form for editing an account
  const handleEditClick = (account) => {
    setSelectedAccount(account);
    setFormOpen(true);
  };

  // Open detail view for an account
  const handleViewClick = (account) => {
    setSelectedAccount(account);
    setDetailOpen(true);
  };

  // Handle form submission (create/update)
  const handleFormSubmit = async (accountData) => {
    setLoading(true);
    try {
      if (selectedAccount) {
        // Update existing account
        await accountService.update(selectedAccount.id, accountData);
        setSnackbar({ 
          open: true, 
          message: 'Account updated successfully', 
          severity: 'success' 
        });
      } else {
        // Create new account
        await accountService.create(accountData);
        setSnackbar({ 
          open: true, 
          message: 'Account created successfully', 
          severity: 'success' 
        });
      }
      
      setFormOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error('Error saving account:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.response?.data?.message || 'Failed to save account'}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteClick = async (account) => {
    if (!window.confirm(`Are you sure you want to delete account "${account.code} - ${account.name}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await accountService.delete(account.id);
      fetchAccounts();
      setSnackbar({ 
        open: true, 
        message: 'Account deleted successfully', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error deleting account:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.response?.data?.message || 'Failed to delete account'}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Helper functions for display
  const getAccountTypeName = (typeId) => {
    const type = accountTypes.find(t => t.id === typeId);
    return type ? type.label : 'Unknown';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getTypeColor = (typeId) => {
    const type = accountTypes.find(t => t.id === typeId);
    if (!type) return 'default';
    
    switch(type.value) {
      case 'asset': return 'primary';
      case 'liability': return 'secondary';
      case 'equity': return 'info';
      case 'revenue': return 'success';
      case 'expense': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Accounts
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddClick}
            disabled={loading}
          >
            Add New Account
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="type-filter-label">Account Type</InputLabel>
          <Select
            labelId="type-filter-label"
            name="typeId"
            value={filters.typeId}
            onChange={handleFilterChange}
            label="Account Type"
          >
            <MenuItem value="">
              <em>All Types</em>
            </MenuItem>
            {accountTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            name="categoryId"
            value={filters.categoryId}
            onChange={handleFilterChange}
            label="Category"
            disabled={!filters.typeId || filteredCategories.length === 0}
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {filteredCategories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Search accounts..."
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 240 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <IconButton 
          onClick={fetchAccounts}
          disabled={loading}
          size="small"
          color="primary"
          title="Refresh"
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No accounts found
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.code}</TableCell>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getAccountTypeName(account.typeId)} 
                      color={getTypeColor(account.typeId)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{getCategoryName(account.categoryId)}</TableCell>
                  <TableCell align="right">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(account.balance)}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton 
                        onClick={() => handleViewClick(account)}
                        disabled={loading}
                        size="small"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton 
                        onClick={() => handleEditClick(account)}
                        disabled={loading}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton 
                        onClick={() => handleDeleteClick(account)}
                        disabled={loading}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={pagination.totalCount}
          rowsPerPage={pagination.rowsPerPage}
          page={pagination.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Account Form Dialog */}
      <AccountForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        account={selectedAccount}
        categories={categories}
        loading={loading}
      />

      {/* Account Detail Dialog */}
      {selectedAccount && (
        <AccountDetail
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          account={selectedAccount}
          transactions={[]}
          totalCount={0}
          page={0}
          rowsPerPage={10}
          onPageChange={() => {}}
          onRowsPerPageChange={() => {}}
        />
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountsManager; 