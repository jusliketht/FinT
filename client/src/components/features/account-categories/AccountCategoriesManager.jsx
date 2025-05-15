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
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  CircularProgress,
  Alert,
  Snackbar,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import accountCategoryService from '../../../services/accountCategoryService';
import accountTypeService from '../../../services/accountTypeService';

const AccountCategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState({ name: '', typeId: '' });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({ typeId: '' });

  // Fetch data on component mount
  useEffect(() => {
    Promise.all([
      fetchAccountTypes(),
      fetchCategories()
    ]);
  }, []);

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
  const fetchCategories = async (typeIdFilter = filters.typeId) => {
    setLoading(true);
    try {
      const filterParams = typeIdFilter ? { typeId: typeIdFilter } : {};
      const data = await accountCategoryService.getAll(filterParams);
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch account categories');
      console.error('Error fetching account categories:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (event) => {
    const { value } = event.target;
    setFilters({ ...filters, typeId: value });
    fetchCategories(value);
  };

  // Open dialog for adding a new category
  const handleAddClick = () => {
    setDialogMode('add');
    setCurrentCategory({ name: '', typeId: '' });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Open dialog for editing a category
  const handleEditClick = (category) => {
    setDialogMode('edit');
    setCurrentCategory({ ...category });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (!currentCategory.name) {
      errors.name = 'Name is required';
    }
    
    if (!currentCategory.typeId) {
      errors.typeId = 'Account type is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (dialogMode === 'add') {
        await accountCategoryService.create(currentCategory);
        setSnackbar({ 
          open: true, 
          message: 'Account category created successfully', 
          severity: 'success' 
        });
      } else {
        await accountCategoryService.update(currentCategory.id, currentCategory);
        setSnackbar({ 
          open: true, 
          message: 'Account category updated successfully', 
          severity: 'success' 
        });
      }
      
      setOpenDialog(false);
      fetchCategories();
    } catch (err) {
      console.error('Error saving account category:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.response?.data?.message || 'Failed to save account category'}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle category deletion
  const handleDeleteClick = async (category) => {
    if (!window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await accountCategoryService.delete(category.id);
      fetchCategories();
      setSnackbar({ 
        open: true, 
        message: 'Account category deleted successfully', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error deleting account category:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.response?.data?.message || 'Failed to delete account category'}`, 
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

  // Get account type display name by ID
  const getAccountTypeName = (typeId) => {
    const type = accountTypes.find(t => t.id === typeId);
    return type ? type.label : typeId;
  };

  // Get account type color by typeId
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
          Account Categories
        </Typography>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAddClick}
            disabled={loading}
          >
            Add New
          </Button>
        </Box>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="type-filter-label">Filter by Type</InputLabel>
          <Select
            labelId="type-filter-label"
            value={filters.typeId}
            onChange={handleFilterChange}
            label="Filter by Type"
            size="small"
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
        <IconButton 
          onClick={() => fetchCategories(filters.typeId)}
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
              <TableCell>Name</TableCell>
              <TableCell>Account Type</TableCell>
              <TableCell>Accounts</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No account categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getAccountTypeName(category.typeId)} 
                      color={getTypeColor(category.typeId)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{category.accounts?.length || 0}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleEditClick(category)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClick(category)}
                      disabled={loading || (category.accounts?.length > 0)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Account Category' : 'Edit Account Category'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              name="name"
              value={currentCategory.name}
              onChange={handleInputChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
              margin="normal"
              placeholder="e.g. Cash, Accounts Receivable, Expenses"
            />
            <FormControl 
              fullWidth 
              margin="normal" 
              error={!!formErrors.typeId}
            >
              <InputLabel id="type-label">Account Type</InputLabel>
              <Select
                labelId="type-label"
                name="typeId"
                value={currentCategory.typeId}
                onChange={handleInputChange}
                label="Account Type"
              >
                {accountTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.typeId && (
                <FormHelperText>{formErrors.typeId}</FormHelperText>
              )}
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default AccountCategoriesManager; 