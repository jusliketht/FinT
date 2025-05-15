import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Grid, MenuItem, IconButton, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const initialLine = { accountId: '', type: 'debit', amount: '' };
const accountTypes = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Expense', label: 'Expense' },
];

const AddJournalEntry = () => {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([{ ...initialLine }]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: '', code: '' });
  const [accountError, setAccountError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = () => {
    axios.get('/api/v1/accounts')
      .then(res => setAccounts(res.data.data || []))
      .catch(() => setAccounts([]));
  };

  const handleLineChange = (idx, field, value) => {
    const updated = lines.map((line, i) =>
      i === idx ? { ...line, [field]: value } : line
    );
    setLines(updated);
  };

  const addLine = () => setLines([...lines, { ...initialLine }]);
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const debitLine = lines.find(l => l.type === 'debit');
      const creditLine = lines.find(l => l.type === 'credit');
      if (!debitLine || !creditLine) {
        setError('Please provide both a debit and a credit line.');
        setLoading(false);
        return;
      }
      const payload = {
        date,
        description,
        debitAccountId: debitLine.accountId,
        creditAccountId: creditLine.accountId,
        amount: parseFloat(debitLine.amount || creditLine.amount),
      };
      await axios.post('/api/journal-entries', payload);
      setSuccess('Journal entry submitted!');
      setDate('');
      setDescription('');
      setLines([{ ...initialLine }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting entry');
    }
    setLoading(false);
  };

  // Account Head Dialog Handlers
  const handleOpenDialog = () => {
    setNewAccount({ name: '', type: '', code: '' });
    setAccountError('');
    setOpenDialog(true);
  };
  const handleCloseDialog = () => setOpenDialog(false);
  const handleAccountChange = (field, value) => setNewAccount(acc => ({ ...acc, [field]: value }));
  const handleAddAccount = async () => {
    setAccountError('');
    if (!newAccount.name || !newAccount.type || !newAccount.code) {
      setAccountError('All fields are required.');
      return;
    }
    try {
      await axios.post('/api/v1/accounts', newAccount);
      fetchAccounts();
      setOpenDialog(false);
    } catch (err) {
      setAccountError(err.response?.data?.message || 'Error adding account head');
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', mt: 4 }}>
      <Button variant="outlined" sx={{ mb: 2 }} onClick={() => navigate('/accounting/journal')}>
        Back to Journal
      </Button>
      <Typography variant="h5" gutterBottom>
        Add Journal Entry
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Date"
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          required
        />
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Lines
        </Typography>
        {lines.map((line, idx) => (
          <Grid container spacing={2} alignItems="center" key={idx} sx={{ mb: 1 }}>
            <Grid item xs={5} sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                select
                label="Account"
                value={line.accountId}
                onChange={e => handleLineChange(idx, 'accountId', e.target.value)}
                fullWidth
                required
              >
                {accounts.map(acc => (
                  <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                ))}
              </TextField>
              <IconButton sx={{ ml: 1 }} onClick={handleOpenDialog} size="small" color="primary">
                <AddIcon />
              </IconButton>
            </Grid>
            <Grid item xs={3}>
              <TextField
                select
                label="Type"
                value={line.type}
                onChange={e => handleLineChange(idx, 'type', e.target.value)}
                fullWidth
                required
              >
                <MenuItem value="debit">Debit</MenuItem>
                <MenuItem value="credit">Credit</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Amount"
                type="number"
                value={line.amount}
                onChange={e => handleLineChange(idx, 'amount', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton onClick={() => removeLine(idx)} disabled={lines.length === 1}>
                <RemoveIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button startIcon={<AddIcon />} onClick={addLine} sx={{ mb: 2 }}>
          Add Line
        </Button>
        <Box>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            Submit Entry
          </Button>
        </Box>
      </form>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Account Head</DialogTitle>
        <DialogContent>
          <TextField
            label="Account Name"
            value={newAccount.name}
            onChange={e => handleAccountChange('name', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            label="Account Code"
            value={newAccount.code}
            onChange={e => handleAccountChange('code', e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
          <TextField
            select
            label="Type"
            value={newAccount.type}
            onChange={e => handleAccountChange('type', e.target.value)}
            fullWidth
            required
          >
            {accountTypes.map(type => (
              <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
            ))}
          </TextField>
          {accountError && <Alert severity="error" sx={{ mt: 2 }}>{accountError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddAccount} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddJournalEntry; 