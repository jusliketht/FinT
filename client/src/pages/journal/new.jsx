import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import accountService from '../../services/accountService';
import journalEntryService from '../../services/journalEntryService';

// Account creation modal components
// import Dialog from '@mui/material/Dialog';
// import DialogTitle from '@mui/material/DialogTitle';
// import DialogContent from '@mui/material/DialogContent';
// import DialogActions from '@mui/material/DialogActions';
// import Button from '@mui/material/Button';
// import TextField from '@mui/material/TextField';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import Select from '@mui/material/Select';
// import MenuItem from '@mui/material/MenuItem';
// import FormHelperText from '@mui/material/FormHelperText';
// TODO: Replace MUI components with Chakra UI equivalents

// Sample accounts data for dropdown
const sampleAccounts = [
  { id: '1000', name: 'Cash', type: 'Asset' },
  { id: '1200', name: 'Accounts Receivable', type: 'Asset' },
  { id: '1500', name: 'Office Equipment', type: 'Asset' },
  { id: '2000', name: 'Accounts Payable', type: 'Liability' },
  { id: '3000', name: 'Common Stock', type: 'Equity' },
  { id: '4000', name: 'Revenue', type: 'Revenue' },
  { id: '5000', name: 'Rent Expense', type: 'Expense' },
  { id: '5100', name: 'Utilities Expense', type: 'Expense' },
  { id: '5200', name: 'Salaries Expense', type: 'Expense' },
];

const NewJournalEntry = () => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // New account modal state
  const [newAccountModalOpen, setNewAccountModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ code: '', name: '', type: '' });
  const [newAccountErrors, setNewAccountErrors] = useState({});
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [selectedLineId, setSelectedLineId] = useState(null);
  
  // Available account types
  const accountTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];
  
  const [formData, setFormData] = useState({
    id: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    lines: [
      { id: 1, accountId: '', debit: '', credit: '', description: '' },
      { id: 2, accountId: '', debit: '', credit: '', description: '' },
    ],
  });

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const accountsData = await accountService.getAll();
        setAccounts(accountsData);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  // Auto-generate entry ID on load
  useEffect(() => {
    const generateEntryId = () => {
      const nextId = 'JE-' + Math.floor(Math.random() * 1000).toString().padStart(6, '0');
      setFormData(prev => ({ ...prev, id: nextId }));
    };

    generateEntryId();
  }, []);

  // Add a new line item to the journal entry
  const addLine = () => {
    const newLine = {
      id: formData.lines.length + 1,
      accountId: '',
      debit: '',
      credit: '',
      description: '',
    };
    setFormData({ ...formData, lines: [...formData.lines, newLine] });
  };

  // Remove a line item from the journal entry
  const removeLine = (id) => {
    if (formData.lines.length <= 2) return; // Minimum 2 lines required
    const updatedLines = formData.lines.filter(line => line.id !== id);
    setFormData({ ...formData, lines: updatedLines });
  };

  // Handle change in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear related error
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  // Handle change in line items
  const handleLineChange = (id, field, value) => {
    const updatedLines = formData.lines.map(line => {
      if (line.id === id) {
        // If debit field is updated, clear credit and vice versa
        if (field === 'debit' && value && line.credit) {
          return { ...line, [field]: value, credit: '' };
        } 
        if (field === 'credit' && value && line.debit) {
          return { ...line, [field]: value, debit: '' };
        }
        return { ...line, [field]: value };
      }
      return line;
    });
    setFormData({ ...formData, lines: updatedLines });
    
    // Clear balance error if it exists
    if (formErrors.balance) {
      setFormErrors({ ...formErrors, balance: '' });
    }
  };

  // Calculate totals
  const getTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;
    
    formData.lines.forEach(line => {
      if (line.debit) totalDebit += parseFloat(line.debit) || 0;
      if (line.credit) totalCredit += parseFloat(line.credit) || 0;
    });
    
    return {
      debit: totalDebit.toFixed(2),
      credit: totalCredit.toFixed(2),
      balanced: Math.abs(totalDebit - totalCredit) < 0.01 // Allow for floating point precision
    };
  };

  const { debit: totalDebit, credit: totalCredit, balanced } = getTotals();

  // Validate the form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.description) errors.description = 'Description is required';
    
    // Validate line items
    let hasAccountError = false;
    let hasValueError = false;
    
    formData.lines.forEach((line, index) => {
      if (!line.accountId) hasAccountError = true;
      if (!line.debit && !line.credit) hasValueError = true;
    });
    
    if (hasAccountError) errors.account = 'All lines must have an account selected';
    if (hasValueError) errors.value = 'All lines must have either a debit or credit value';
    
    // Check if debits = credits
    if (!balanced) {
      errors.balance = 'Debits must equal credits';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Format data for API
      const journalEntryData = {
        ...formData,
        lines: formData.lines.map(line => ({
          accountId: line.accountId,
          description: line.description,
          debit: line.debit ? parseFloat(line.debit) : null,
          credit: line.credit ? parseFloat(line.credit) : null,
        }))
      };
      
      // Submit to API
      await journalEntryService.create(journalEntryData);
      
      // Navigate back to the journal list page
      navigate('/journal');
    } catch (error) {
      console.error('Error creating journal entry:', error);
      setFormErrors({ submit: 'Failed to create journal entry. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Open the new account modal
  const openNewAccountModal = (lineId) => {
    setSelectedLineId(lineId);
    setNewAccount({ code: '', name: '', type: '' });
    setNewAccountErrors({});
    setNewAccountModalOpen(true);
  };
  
  // Handle change in new account form
  const handleNewAccountChange = (e) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (newAccountErrors[name]) {
      setNewAccountErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Validate new account form
  const validateNewAccount = () => {
    const errors = {};
    
    if (!newAccount.code) errors.code = 'Account code is required';
    else if (!/^[A-Z0-9]{2,20}$/.test(newAccount.code)) {
      errors.code = 'Code must be 2-20 characters (uppercase letters and numbers only)';
    }
    
    if (!newAccount.name) errors.name = 'Account name is required';
    else if (newAccount.name.length < 3 || newAccount.name.length > 100) {
      errors.name = 'Name must be 3-100 characters';
    }
    
    if (!newAccount.type) errors.type = 'Account type is required';
    
    return errors;
  };
  
  // Submit new account
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    
    const errors = validateNewAccount();
    if (Object.keys(errors).length > 0) {
      setNewAccountErrors(errors);
      return;
    }
    
    try {
      setCreatingAccount(true);
      
      // Create account via API
      const createdAccount = await accountService.createAccount(newAccount);
      
      // Add the new account to the accounts list
      setAccounts(prev => [...prev, createdAccount]);
      
      // Update the selected line with the new account
      if (selectedLineId) {
        const updatedLines = formData.lines.map(line => {
          if (line.id === selectedLineId) {
            return { ...line, accountId: createdAccount.id };
          }
          return line;
        });
        setFormData(prev => ({ ...prev, lines: updatedLines }));
      }
      
      // Close modal
      setNewAccountModalOpen(false);
    } catch (error) {
      console.error('Error creating account:', error);
      setNewAccountErrors({ submit: 'Failed to create account. Please try again.' });
    } finally {
      setCreatingAccount(false);
    }
  };

  return (
    <>
      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">New Journal Entry</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => navigate('/journal')}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className={`${
                submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } text-white px-4 py-2 rounded transition-colors`}
            >
              {submitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Entry ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Entry ID
                </label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>
              
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${formErrors.date ? 'border-red-500' : ''}`}
                />
                {formErrors.date && <p className="mt-1 text-sm text-red-500">{formErrors.date}</p>}
              </div>
              
              {/* Status - Always starts as Draft */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <input
                  type="text"
                  value="Draft"
                  readOnly
                  className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className={`w-full p-2 border rounded ${formErrors.description ? 'border-red-500' : ''}`}
                placeholder="Enter description..."
              ></textarea>
              {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
            </div>
            
            {/* Line Items Table */}
            <div>
              <h2 className="text-lg font-medium mb-3">Line Items</h2>
              
              {loading ? (
                <div className="text-center py-4">
                  <p>Loading accounts...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Account
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Debit
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Credit
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {formData.lines.map((line) => (
                        <tr key={line.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-3">
                            <div className="flex items-center">
                              <select
                                value={line.accountId}
                                onChange={(e) => handleLineChange(line.id, 'accountId', e.target.value)}
                                className={`w-full p-2 border rounded ${formErrors.account ? 'border-red-500' : ''}`}
                              >
                                <option value="">Select Account</option>
                                {accounts.map((account) => (
                                  <option key={account.id} value={account.id}>
                                    {account.code} - {account.name} ({account.type})
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => openNewAccountModal(line.id)}
                                className="ml-2 p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                                title="Create new account"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="text"
                              value={line.description}
                              onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                              placeholder="Line description"
                              className="w-full p-2 border rounded"
                            />
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={line.debit}
                              onChange={(e) => handleLineChange(line.id, 'debit', e.target.value)}
                              placeholder="0.00"
                              className={`w-full p-2 border rounded text-right ${formErrors.value ? 'border-red-500' : ''}`}
                            />
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="number"
                              step="0.01"
                              value={line.credit}
                              onChange={(e) => handleLineChange(line.id, 'credit', e.target.value)}
                              placeholder="0.00"
                              className={`w-full p-2 border rounded text-right ${formErrors.value ? 'border-red-500' : ''}`}
                            />
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(line.id)}
                              className="text-red-600 hover:text-red-900"
                              disabled={formData.lines.length <= 2}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Totals row */}
                      <tr className="bg-gray-50 dark:bg-gray-700 font-medium">
                        <td colSpan={2} className="px-6 py-3 text-right">
                          Totals
                        </td>
                        <td className="px-6 py-3 text-right">
                          {totalDebit}
                        </td>
                        <td className="px-6 py-3 text-right">
                          {totalCredit}
                        </td>
                        <td className="px-6 py-3"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Error messages */}
              {formErrors.balance && <p className="mt-2 text-sm text-red-500">{formErrors.balance}</p>}
              {formErrors.account && <p className="mt-2 text-sm text-red-500">{formErrors.account}</p>}
              {formErrors.value && <p className="mt-2 text-sm text-red-500">{formErrors.value}</p>}
              {formErrors.submit && <p className="mt-2 text-sm text-red-500">{formErrors.submit}</p>}
              
              {/* Balance indicator */}
              <div className={`mt-4 text-right font-medium ${balanced ? 'text-green-600' : 'text-red-600'}`}>
                {balanced ? 'Entry is balanced' : 'Entry is not balanced'}
              </div>
              
              {/* Add line button */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addLine}
                  className="text-blue-600 hover:text-blue-900"
                >
                  + Add Line
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* New Account Dialog */}
      {/* <Dialog
        open={newAccountModalOpen}
        onClose={() => setNewAccountModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Account</DialogTitle>
        <form onSubmit={handleCreateAccount}>
          <DialogContent>
            <div className="space-y-4 mt-2">
              <TextField
                fullWidth
                label="Account Code"
                name="code"
                value={newAccount.code}
                onChange={handleNewAccountChange}
                error={!!newAccountErrors.code}
                helperText={newAccountErrors.code || "e.g. 1000, 2000, BANK-001"}
                placeholder="Enter account code"
              />
              
              <TextField
                fullWidth
                label="Account Name"
                name="name"
                value={newAccount.name}
                onChange={handleNewAccountChange}
                error={!!newAccountErrors.name}
                helperText={newAccountErrors.name || "e.g. Cash, Accounts Receivable"}
                placeholder="Enter account name"
              />
              
              <FormControl fullWidth error={!!newAccountErrors.type}>
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="type"
                  value={newAccount.type}
                  onChange={handleNewAccountChange}
                  label="Account Type"
                >
                  {accountTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
                {newAccountErrors.type && <FormHelperText>{newAccountErrors.type}</FormHelperText>}
              </FormControl>
              
              {newAccountErrors.submit && (
                <p className="text-red-500">{newAccountErrors.submit}</p>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNewAccountModalOpen(false)} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              disabled={creatingAccount}
            >
              {creatingAccount ? 'Creating...' : 'Create Account'}
            </Button>
          </DialogActions>
        </form>
      </Dialog> */}
    </>
  );
};

export default NewJournalEntry; 