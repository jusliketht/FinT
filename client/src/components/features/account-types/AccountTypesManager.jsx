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
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import accountTypeService from '../../../services/accountTypeService';

const AccountTypesManager = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [currentAccountType, setCurrentAccountType] = useState({ value: '', label: '' });
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch account types on component mount
  useEffect(() => {
    fetchAccountTypes();
  }, []);

  // Fetch account types from API
  const fetchAccountTypes = async () => {
    setLoading(true);
    try {
      const data = await accountTypeService.getAll();
      setAccountTypes(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch account types');
      console.error('Error fetching account types:', err);
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for adding a new account type
  const handleAddClick = () => {
    setDialogMode('add');
    setCurrentAccountType({ value: '', label: '' });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Open dialog for editing an account type
  const handleEditClick = (accountType) => {
    setDialogMode('edit');
    setCurrentAccountType({ ...accountType });
    setFormErrors({});
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAccountType((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    
    if (!currentAccountType.value) {
      errors.value = 'Value is required';
    } else if (!/^[a-z0-9-]+$/.test(currentAccountType.value)) {
      errors.value = 'Value must contain only lowercase letters, numbers, and hyphens';
    }
    
    if (!currentAccountType.label) {
      errors.label = 'Label is required';
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
        await accountTypeService.create(currentAccountType);
        setSnackbar({ 
          open: true, 
          message: 'Account type created successfully', 
          severity: 'success' 
        });
      } else {
        await accountTypeService.update(currentAccountType.id, currentAccountType);
        setSnackbar({ 
          open: true, 
          message: 'Account type updated successfully', 
          severity: 'success' 
        });
      }
      
      setOpenDialog(false);
      fetchAccountTypes();
    } catch (err) {
      console.error('Error saving account type:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.response?.data?.message || 'Failed to save account type'}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle account type deletion
  const handleDeleteClick = async (accountType) => {
    if (!window.confirm(`Are you sure you want to delete "${accountType.label}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await accountTypeService.delete(accountType.id);
      fetchAccountTypes();
      setSnackbar({ 
        open: true, 
        message: 'Account type deleted successfully', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error deleting account type:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.response?.data?.message || 'Failed to delete account type'}`, 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Create default account types
  const handleCreateDefaults = async () => {
    setLoading(true);
    try {
      await accountTypeService.createDefaults();
      fetchAccountTypes();
      setSnackbar({ 
        open: true, 
        message: 'Default account types created successfully', 
        severity: 'success' 
      });
    } catch (err) {
      console.error('Error creating default account types:', err);
      setSnackbar({ 
        open: true, 
        message: `Error: ${err.response?.data?.message || 'Failed to create default account types'}`, 
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Account Types
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleCreateDefaults} 
            sx={{ mr: 1 }}
            disabled={loading}
          >
            Create Defaults
          </Button>
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Value</TableCell>
              <TableCell>Label</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && accountTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : accountTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No account types found
                </TableCell>
              </TableRow>
            ) : (
              accountTypes.map((accountType) => (
                <TableRow key={accountType.id}>
                  <TableCell>{accountType.value}</TableCell>
                  <TableCell>{accountType.label}</TableCell>
                  <TableCell>{accountType.categories?.length || 0}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      onClick={() => handleEditClick(accountType)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClick(accountType)}
                      disabled={loading || (accountType.categories?.length > 0)}
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
          {dialogMode === 'add' ? 'Add New Account Type' : 'Edit Account Type'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Value"
              name="value"
              value={currentAccountType.value}
              onChange={handleInputChange}
              error={!!formErrors.value}
              helperText={formErrors.value || "Unique identifier (e.g. 'asset', 'liability')"}
              margin="normal"
              disabled={dialogMode === 'edit'} // Cannot change value in edit mode
              inputProps={{
                pattern: "[a-z0-9-]+"
              }}
            />
            <TextField
              fullWidth
              label="Label"
              name="label"
              value={currentAccountType.label}
              onChange={handleInputChange}
              error={!!formErrors.label}
              helperText={formErrors.label || "Display name (e.g. 'Asset', 'Liability')"}
              margin="normal"
            />
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

export default AccountTypesManager; 