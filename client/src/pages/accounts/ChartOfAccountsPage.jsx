import React, { useState, useEffect } from 'react';
// import { Container, Box, Typography, Alert, Dialog, Tabs, Tab } from '@mui/material';
import { useSnackbar } from 'notistack';
import ChartOfAccounts from '../../components/accounts/ChartOfAccounts';
import AccountForm from '../../components/accounts/AccountForm';
import AccountCategoryManager from '../../components/accounts/AccountCategoryManager';
import accountService from '../../services/accountService';
import accountCategoryService from '../../services/accountCategoryService';
import accountTypeService from '../../services/accountTypeService';

const ChartOfAccountsPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsResponse, categoriesResponse, typesResponse] = await Promise.all([
        accountService.getAll(),
        accountCategoryService.getAll(),
        accountTypeService.getAll()
      ]);
      setAccounts(accountsResponse.data);
      setCategories(categoriesResponse.data);
      setAccountTypes(typesResponse.data);
    } catch (err) {
      setError('Failed to fetch data');
      enqueueSnackbar('Failed to load data', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedAccount(null);
    setIsFormOpen(true);
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setIsFormOpen(true);
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Are you sure you want to delete account ${account.code} - ${account.name}?`)) {
      return;
    }

    try {
      setLoading(true);
      await accountService.delete(account.id);
      enqueueSnackbar('Account deleted successfully', { variant: 'success' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      enqueueSnackbar('Failed to delete account', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (selectedAccount) {
        await accountService.update(selectedAccount.id, values);
        enqueueSnackbar('Account updated successfully', { variant: 'success' });
      } else {
        await accountService.create(values);
        enqueueSnackbar('Account created successfully', { variant: 'success' });
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

  const handleAddCategory = async (values) => {
    try {
      setLoading(true);
      await accountCategoryService.create(values);
      enqueueSnackbar('Category created successfully', { variant: 'success' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create category');
      enqueueSnackbar('Failed to create category', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (id, values) => {
    try {
      setLoading(true);
      await accountCategoryService.update(id, values);
      enqueueSnackbar('Category updated successfully', { variant: 'success' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update category');
      enqueueSnackbar('Failed to update category', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setLoading(true);
      await accountCategoryService.delete(id);
      enqueueSnackbar('Category deleted successfully', { variant: 'success' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      enqueueSnackbar('Failed to delete category', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async (values) => {
    try {
      setLoading(true);
      await accountTypeService.create(values);
      enqueueSnackbar('Account type created successfully', { variant: 'success' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create account type');
      enqueueSnackbar('Failed to create account type', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditType = async (id, values) => {
    try {
      setLoading(true);
      await accountTypeService.update(id, values);
      enqueueSnackbar('Account type updated successfully', { variant: 'success' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update account type');
      enqueueSnackbar('Failed to update account type', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account type?')) {
      return;
    }

    try {
      setLoading(true);
      await accountTypeService.delete(id);
      enqueueSnackbar('Account type deleted successfully', { variant: 'success' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete account type');
      enqueueSnackbar('Failed to delete account type', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chart of Accounts
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Accounts" />
          <Tab label="Categories & Types" />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        <ChartOfAccounts
          accounts={accounts}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isLoading={loading}
        />
      ) : (
        <AccountCategoryManager
          categories={categories}
          accountTypes={accountTypes}
          onAddCategory={handleAddCategory}
          onEditCategory={handleEditCategory}
          onDeleteCategory={handleDeleteCategory}
          onAddType={handleAddType}
          onEditType={handleEditType}
          onDeleteType={handleDeleteType}
          isLoading={loading}
        />
      )}

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <AccountForm
          account={selectedAccount}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={loading}
          categories={categories}
          accountTypes={accountTypes}
        />
      </Dialog>
    </Container>
  );
};

export default ChartOfAccountsPage; 