import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  Alert,
  CircularProgress
} from '@mui/material';
import { useSnackbar } from 'notistack';
import BankAccountForm from '../../components/accounts/BankAccountForm';
import CreditCardForm from '../../components/accounts/CreditCardForm';
import BankAccountCard from '../../components/accounts/BankAccountCard';
import CreditCardCard from '../../components/accounts/CreditCardCard';
import { bankAccountsAPI, creditCardsAPI } from '../../services/api';

const FinancialAccountsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [activeTab, setActiveTab] = useState(0);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isBankAccount, setIsBankAccount] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 0) {
        const response = await bankAccountsAPI.getAll();
        setBankAccounts(response.data);
      } else {
        const response = await creditCardsAPI.getAll();
        setCreditCards(response.data);
      }
    } catch (err) {
      setError('Failed to fetch accounts');
      enqueueSnackbar('Failed to load accounts', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setIsBankAccount(newValue === 0);
  };

  const handleAddNew = () => {
    setSelectedAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (isBankAccount) {
        if (selectedAccount) {
          await bankAccountsAPI.update(selectedAccount.id, values);
          enqueueSnackbar('Bank account updated successfully', { variant: 'success' });
        } else {
          await bankAccountsAPI.create(values);
          enqueueSnackbar('Bank account created successfully', { variant: 'success' });
        }
      } else {
        if (selectedAccount) {
          await creditCardsAPI.update(selectedAccount.id, values);
          enqueueSnackbar('Credit card updated successfully', { variant: 'success' });
        } else {
          await creditCardsAPI.create(values);
          enqueueSnackbar('Credit card created successfully', { variant: 'success' });
        }
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save account');
      enqueueSnackbar('Failed to save account', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      setLoading(true);
      if (isBankAccount) {
        await bankAccountsAPI.delete(id);
        enqueueSnackbar('Bank account deleted successfully', { variant: 'success' });
      } else {
        await creditCardsAPI.delete(id);
        enqueueSnackbar('Credit card deleted successfully', { variant: 'success' });
      }
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      enqueueSnackbar('Failed to delete account', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (id) => {
    try {
      setLoading(true);
      await bankAccountsAPI.reconcile(id);
      enqueueSnackbar('Bank account reconciled successfully', { variant: 'success' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to reconcile account');
      enqueueSnackbar('Failed to reconcile account', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleViewStatement = async (id) => {
    try {
      setLoading(true);
      const response = await creditCardsAPI.getStatement(id);
      // Handle statement view logic here
      enqueueSnackbar('Statement loaded successfully', { variant: 'success' });
    } catch (err) {
      setError(err.message || 'Failed to load statement');
      enqueueSnackbar('Failed to load statement', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Financial Accounts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your bank accounts and credit cards
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Bank Accounts" />
          <Tab label="Credit Cards" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleAddNew}
          disabled={loading}
        >
          Add New {isBankAccount ? 'Bank Account' : 'Credit Card'}
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {isBankAccount ? (
            <Box>
              {bankAccounts.map((account) => (
                <Box key={account.id} sx={{ mb: 2 }}>
                  <BankAccountCard
                    account={account}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReconcile={handleReconcile}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Box>
              {creditCards.map((card) => (
                <Box key={card.id} sx={{ mb: 2 }}>
                  <CreditCardCard
                    card={card}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onViewStatement={handleViewStatement}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {isBankAccount ? (
          <BankAccountForm
            bankAccount={selectedAccount}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={loading}
          />
        ) : (
          <CreditCardForm
            creditCard={selectedAccount}
            onSubmit={handleSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={loading}
          />
        )}
      </Dialog>
    </Container>
  );
};

export default FinancialAccountsPage; 