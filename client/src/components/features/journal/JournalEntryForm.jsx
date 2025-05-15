import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';
import ledgerService from '../../../services/ledgerService';
import accountService from '../../../services/accountService';
import { useNavigate } from 'react-router-dom';

const JournalEntryForm = () => {
  const navigate = useNavigate();
  
  // State for journal entry form
  const [journalEntry, setJournalEntry] = useState({
    date: new Date(),
    reference: `JE-${Date.now()}`,
    description: '',
    items: [
      { accountId: '', description: '', debitAmount: 0, creditAmount: 0 }
    ]
  });
  
  // Other state
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [postedJournalId, setPostedJournalId] = useState(null);
  
  // Calculate totals
  const totalDebits = journalEntry.items.reduce(
    (sum, item) => sum + parseFloat(item.debitAmount || 0), 
    0
  );
  
  const totalCredits = journalEntry.items.reduce(
    (sum, item) => sum + parseFloat(item.creditAmount || 0), 
    0
  );
  
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  // Fetch accounts for dropdowns
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await accountService.getAll();
        setAccounts(data);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to load accounts');
      }
    };
    
    fetchAccounts();
  }, []);

  // Handle journal entry field changes
  const handleJournalEntryChange = (field, value) => {
    setJournalEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...journalEntry.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    setJournalEntry(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Add a new line item
  const handleAddItem = () => {
    setJournalEntry(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0 }
      ]
    }));
  };

  // Remove a line item
  const handleRemoveItem = (index) => {
    if (journalEntry.items.length <= 1) return;
    
    const updatedItems = [...journalEntry.items];
    updatedItems.splice(index, 1);
    
    setJournalEntry(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  // Submit the journal entry
  const handleSubmit = async () => {
    // Basic validation
    if (!journalEntry.date || !journalEntry.description) {
      setError('Date and description are required');
      return;
    }
    
    if (journalEntry.items.length < 2) {
      setError('Journal entry must have at least two line items');
      return;
    }
    
    if (!isBalanced) {
      setError('Total debits must equal total credits');
      return;
    }
    
    // Check for empty account selections
    const hasEmptyAccounts = journalEntry.items.some(item => !item.accountId);
    if (hasEmptyAccounts) {
      setError('All line items must have an account selected');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Format the data for API submission
      const formattedEntry = {
        date: format(journalEntry.date, 'yyyy-MM-dd'),
        reference: journalEntry.reference,
        description: journalEntry.description,
        items: journalEntry.items.map(item => ({
          accountId: item.accountId,
          description: item.description || journalEntry.description,
          debitAmount: parseFloat(item.debitAmount) || 0,
          creditAmount: parseFloat(item.creditAmount) || 0
        }))
      };
      
      const response = await ledgerService.postJournalEntry(formattedEntry);
      
      setSuccess(true);
      setPostedJournalId(response.journalId);
      setSuccessDialogOpen(true);
      
      // Reset form
      setJournalEntry({
        date: new Date(),
        reference: `JE-${Date.now()}`,
        description: '',
        items: [
          { accountId: '', description: '', debitAmount: 0, creditAmount: 0 }
        ]
      });
      
    } catch (err) {
      console.error('Error posting journal entry:', err);
      setError(err.response?.data?.message || 'Failed to post journal entry');
    } finally {
      setLoading(false);
    }
  };

  // Format currency display
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // View general ledger after posting journal entry
  const handleViewGeneralLedger = () => {
    setSuccessDialogOpen(false);
    navigate('/ledgers');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        New Journal Entry
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && !successDialogOpen && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Journal entry posted successfully!
          </Alert>
        )}
        
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {/* Date picker */}
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={journalEntry.date}
              onChange={(newDate) => handleJournalEntryChange('date', newDate)}
              renderInput={(params) => 
                <TextField {...params} required sx={{ width: 200 }} />
              }
              inputFormat="MM/dd/yyyy"
            />
          </LocalizationProvider>
          
          {/* Reference number */}
          <TextField 
            label="Reference"
            value={journalEntry.reference}
            onChange={(e) => handleJournalEntryChange('reference', e.target.value)}
            sx={{ width: 200 }}
          />
          
          {/* Description */}
          <TextField 
            label="Description"
            value={journalEntry.description}
            onChange={(e) => handleJournalEntryChange('description', e.target.value)}
            required
            fullWidth
            sx={{ minWidth: 300 }}
          />
        </Box>
        
        {/* Line items table */}
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {journalEntry.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <FormControl fullWidth required>
                      <InputLabel>Account</InputLabel>
                      <Select
                        value={item.accountId}
                        label="Account"
                        onChange={(e) => handleItemChange(index, 'accountId', e.target.value)}
                      >
                        {accounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      placeholder={journalEntry.description || "Line item description"}
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.debitAmount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleItemChange(index, 'debitAmount', value);
                        // If entering debit amount, clear credit amount
                        if (value && value > 0) {
                          handleItemChange(index, 'creditAmount', 0);
                        }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.creditAmount || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleItemChange(index, 'creditAmount', value);
                        // If entering credit amount, clear debit amount
                        if (value && value > 0) {
                          handleItemChange(index, 'debitAmount', 0);
                        }
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      sx={{ width: 120 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                      disabled={journalEntry.items.length <= 1}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Totals row */}
              <TableRow>
                <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                  TOTALS:
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(totalDebits)}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(totalCredits)}
                </TableCell>
                <TableCell />
              </TableRow>
              
              {/* Out of balance row */}
              {!isBalanced && (
                <TableRow>
                  <TableCell colSpan={2} align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    OUT OF BALANCE:
                  </TableCell>
                  <TableCell colSpan={2} align="right" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                    {formatCurrency(Math.abs(totalDebits - totalCredits))}
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}
              
              {/* Add line button */}
              <TableRow>
                <TableCell colSpan={5} align="left">
                  <Button 
                    startIcon={<AddIcon />} 
                    onClick={handleAddItem}
                  >
                    Add Line
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Submit button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading || !isBalanced}
          >
            {loading ? <CircularProgress size={24} /> : 'Post Journal Entry'}
          </Button>
        </Box>
      </Paper>
      
      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onClose={() => setSuccessDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircleIcon color="success" sx={{ mr: 1 }} />
            Journal Entry Posted Successfully
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Your journal entry has been successfully posted to the ledger with reference {journalEntry.reference}.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Would you like to view the updated general ledger?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessDialogOpen(false)}>Close</Button>
          <Button 
            variant="contained" 
            onClick={handleViewGeneralLedger} 
            autoFocus
          >
            View General Ledger
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JournalEntryForm; 