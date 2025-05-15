import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import accountService from '../../../services/accountService';

// New Account Modal validation schema
const newAccountSchema = Yup.object({
  code: Yup.string()
    .required('Account code is required')
    .matches(/^[A-Z0-9]+$/, 'Account code must contain only uppercase letters and numbers')
    .min(2, 'Account code must be at least 2 characters')
    .max(20, 'Account code must not exceed 20 characters'),
  name: Yup.string()
    .required('Account name is required')
    .min(3, 'Account name must be at least 3 characters')
    .max(100, 'Account name must not exceed 100 characters'),
  type: Yup.string()
    .required('Account type is required')
});

const validationSchema = Yup.object({
  date: Yup.date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),
  reference: Yup.string()
    .required('Reference is required')
    .matches(/^[A-Z0-9-]+$/, 'Reference must contain only uppercase letters, numbers, and hyphens')
    .min(3, 'Reference must be at least 3 characters')
    .max(20, 'Reference must not exceed 20 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must not exceed 500 characters'),
  lines: Yup.array()
    .of(
      Yup.object({
        accountId: Yup.string().required('Account is required'),
        description: Yup.string().max(200, 'Line description must not exceed 200 characters'),
        debit: Yup.number().min(0, 'Debit must be positive'),
        credit: Yup.number().min(0, 'Credit must be positive')
      })
    )
    .min(2, 'At least two lines are required')
    .test('balanced', 'Debits must equal credits', function(value) {
      if (!value) return false;
      const totalDebit = value.reduce((sum, line) => sum + (line.debit || 0), 0);
      const totalCredit = value.reduce((sum, line) => sum + (line.credit || 0), 0);
      return Math.abs(totalDebit - totalCredit) < 0.01;
    })
    .test('valid-lines', 'Each line must have either debit or credit', function(value) {
      if (!value) return false;
      return value.every(line => (line.debit || 0) > 0 !== (line.credit || 0) > 0);
    })
});

const JournalEntryForm = ({
  open,
  onClose,
  onSubmit,
  entry,
  accounts,
  loading
}) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  
  // New account modal state
  const [newAccountModalOpen, setNewAccountModalOpen] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(null);
  const [accountCreating, setAccountCreating] = useState(false);
  
  // Account types
  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  const formik = useFormik({
    initialValues: {
      date: entry?.date ? new Date(entry.date) : new Date(),
      reference: entry?.reference || '',
      description: entry?.description || '',
      lines: entry?.lines || [
        { accountId: '', description: '', debit: '', credit: '' },
        { accountId: '', description: '', debit: '', credit: '' }
      ]
    },
    validationSchema,
    onSubmit: (values) => {
      // Convert empty strings to null for debit/credit
      const processedValues = {
        ...values,
        lines: values.lines.map(line => ({
          ...line,
          debit: line.debit ? parseFloat(line.debit) : null,
          credit: line.credit ? parseFloat(line.credit) : null
        }))
      };
      onSubmit(processedValues);
    }
  });

  // Form for the new account
  const newAccountFormik = useFormik({
    initialValues: {
      code: '',
      name: '',
      type: ''
    },
    validationSchema: newAccountSchema,
    onSubmit: async (values) => {
      try {
        setAccountCreating(true);
        const newAccount = await accountService.createAccount(values);
        
        // Update the account selection for the current line
        if (currentLineIndex !== null) {
          formik.setFieldValue(`lines.${currentLineIndex}.accountId`, newAccount.id);
        }
        
        // Close the modal
        setNewAccountModalOpen(false);
        newAccountFormik.resetForm();
        
        // You might want to refresh the accounts list here
        // This depends on how your app manages state - you might need to add a callback prop
      } catch (error) {
        console.error('Error creating account:', error);
        // Handle error, perhaps set an error state in the modal
      } finally {
        setAccountCreating(false);
      }
    }
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const handleAddLine = () => {
    formik.setFieldValue('lines', [
      ...formik.values.lines,
      { accountId: '', description: '', debit: '', credit: '' }
    ]);
  };

  const handleRemoveLine = (index) => {
    const newLines = [...formik.values.lines];
    newLines.splice(index, 1);
    formik.setFieldValue('lines', newLines);
  };

  const handleAccountChange = (index, accountId) => {
    formik.setFieldValue(`lines.${index}.accountId`, accountId);
    // Clear debit/credit when account changes
    formik.setFieldValue(`lines.${index}.debit`, '');
    formik.setFieldValue(`lines.${index}.credit`, '');
  };

  const handleAmountChange = (index, field, value) => {
    formik.setFieldValue(`lines.${index}.${field}`, value);
    // Clear the other amount field
    const otherField = field === 'debit' ? 'credit' : 'debit';
    formik.setFieldValue(`lines.${index}.${otherField}`, '');
  };
  
  const openNewAccountModal = (index) => {
    setCurrentLineIndex(index);
    setNewAccountModalOpen(true);
  };

  const calculateTotals = () => {
    const totalDebit = formik.values.lines.reduce(
      (sum, line) => sum + (parseFloat(line.debit) || 0),
      0
    );
    const totalCredit = formik.values.lines.reduce(
      (sum, line) => sum + (parseFloat(line.credit) || 0),
      0
    );
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {entry ? 'Edit Journal Entry' : 'New Journal Entry'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Date"
                  value={formik.values.date}
                  onChange={(date) => formik.setFieldValue('date', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: formik.touched.date && Boolean(formik.errors.date),
                      helperText: formik.touched.date && formik.errors.date
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="reference"
                  name="reference"
                  label="Reference"
                  value={formik.values.reference}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                  helperText={formik.touched.reference && formik.errors.reference}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={2}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </Grid>

              {/* Journal Entry Lines */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">Entry Lines</Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={handleAddLine}
                    size="small"
                  >
                    Add Line
                  </Button>
                </Box>

                {formik.values.lines.map((line, index) => (
                  <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <Box display="flex" alignItems="center">
                        <FormControl
                          fullWidth
                          error={
                            formik.touched.lines?.[index]?.accountId &&
                            Boolean(formik.errors.lines?.[index]?.accountId)
                          }
                          sx={{ flexGrow: 1, mr: 1 }}
                        >
                          <InputLabel>Account</InputLabel>
                          <Select
                            value={line.accountId}
                            onChange={(e) => handleAccountChange(index, e.target.value)}
                            label="Account"
                          >
                            {accounts.map((account) => (
                              <MenuItem key={account.id} value={account.id}>
                                {account.code} - {account.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.lines?.[index]?.accountId &&
                            formik.errors.lines?.[index]?.accountId && (
                              <FormHelperText>
                                {formik.errors.lines[index].accountId}
                              </FormHelperText>
                            )}
                        </FormControl>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => openNewAccountModal(index)}
                          title="Create new account"
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={line.description}
                        onChange={(e) =>
                          formik.setFieldValue(`lines.${index}.description`, e.target.value)
                        }
                        error={
                          formik.touched.lines?.[index]?.description &&
                          Boolean(formik.errors.lines?.[index]?.description)
                        }
                        helperText={
                          formik.touched.lines?.[index]?.description &&
                          formik.errors.lines?.[index]?.description
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Debit"
                        type="number"
                        value={line.debit}
                        onChange={(e) => handleAmountChange(index, 'debit', e.target.value)}
                        error={
                          formik.touched.lines?.[index]?.debit &&
                          Boolean(formik.errors.lines?.[index]?.debit)
                        }
                        helperText={
                          formik.touched.lines?.[index]?.debit &&
                          formik.errors.lines?.[index]?.debit
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        label="Credit"
                        type="number"
                        value={line.credit}
                        onChange={(e) => handleAmountChange(index, 'credit', e.target.value)}
                        error={
                          formik.touched.lines?.[index]?.credit &&
                          Boolean(formik.errors.lines?.[index]?.credit)
                        }
                        helperText={
                          formik.touched.lines?.[index]?.credit &&
                          formik.errors.lines?.[index]?.credit
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        onClick={() => handleRemoveLine(index)}
                        disabled={formik.values.lines.length <= 2}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}

                {/* Totals */}
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Typography variant="subtitle1">
                    Total Debit: {totalDebit.toFixed(2)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Total Credit: {totalCredit.toFixed(2)}
                  </Typography>
                </Box>

                {/* Form-level errors */}
                {formik.errors.lines && typeof formik.errors.lines === 'string' && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {formik.errors.lines}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || !formik.isValid || !formik.dirty}
            >
              {entry ? 'Save Changes' : 'Create Entry'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* New Account Modal */}
      <Dialog 
        open={newAccountModalOpen} 
        onClose={() => setNewAccountModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={newAccountFormik.handleSubmit}>
          <DialogTitle>Create New Account</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="code"
                  name="code"
                  label="Account Code"
                  value={newAccountFormik.values.code}
                  onChange={newAccountFormik.handleChange}
                  onBlur={newAccountFormik.handleBlur}
                  error={newAccountFormik.touched.code && Boolean(newAccountFormik.errors.code)}
                  helperText={newAccountFormik.touched.code && newAccountFormik.errors.code}
                  placeholder="e.g. 1000, 2000, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Account Name"
                  value={newAccountFormik.values.name}
                  onChange={newAccountFormik.handleChange}
                  onBlur={newAccountFormik.handleBlur}
                  error={newAccountFormik.touched.name && Boolean(newAccountFormik.errors.name)}
                  helperText={newAccountFormik.touched.name && newAccountFormik.errors.name}
                  placeholder="e.g. Cash, Accounts Receivable, etc."
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl 
                  fullWidth
                  error={newAccountFormik.touched.type && Boolean(newAccountFormik.errors.type)}
                >
                  <InputLabel>Account Type</InputLabel>
                  <Select
                    id="type"
                    name="type"
                    value={newAccountFormik.values.type}
                    onChange={newAccountFormik.handleChange}
                    onBlur={newAccountFormik.handleBlur}
                    label="Account Type"
                  >
                    {accountTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {newAccountFormik.touched.type && newAccountFormik.errors.type && (
                    <FormHelperText>{newAccountFormik.errors.type}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewAccountModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={accountCreating || !newAccountFormik.isValid}
            >
              {accountCreating ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

JournalEntryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  entry: PropTypes.shape({
    id: PropTypes.string,
    date: PropTypes.string,
    reference: PropTypes.string,
    description: PropTypes.string,
    lines: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        accountId: PropTypes.string,
        description: PropTypes.string,
        debit: PropTypes.number,
        credit: PropTypes.number
      })
    )
  }),
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })
  ).isRequired,
  loading: PropTypes.bool
};

export default JournalEntryForm; 