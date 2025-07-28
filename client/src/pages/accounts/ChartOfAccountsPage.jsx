import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
} from '@chakra-ui/react';
import ChartOfAccounts from '../../components/accounts/ChartOfAccounts';
import AccountForm from '../../components/features/accounts/AccountForm';
import AccountCategoryManager from '../../components/features/account-categories/AccountCategoriesManager';
import accountService from '../../services/accountService';
import accountCategoryService from '../../services/accountCategoryService';
import accountTypeService from '../../services/accountTypeService';

const ChartOfAccountsPage = () => {
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchData = useCallback(async () => {
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
      toast({
        title: 'Failed to load data',
        description: err.message || 'Failed to load data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      toast({
        title: 'Account deleted successfully',
        description: 'Account deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      toast({
        title: 'Failed to delete account',
        description: err.message || 'Failed to delete account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (selectedAccount) {
        await accountService.update(selectedAccount.id, values);
        toast({
          title: 'Account updated successfully',
          description: 'Account updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await accountService.create(values);
        toast({
          title: 'Account created successfully',
          description: 'Account created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      setIsFormOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save account');
      toast({
        title: 'Failed to save account',
        description: err.message || 'Failed to save account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (values) => {
    try {
      setLoading(true);
      await accountCategoryService.create(values);
      toast({
        title: 'Category created successfully',
        description: 'Category created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create category');
      toast({
        title: 'Failed to create category',
        description: err.message || 'Failed to create category',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = async (id, values) => {
    try {
      setLoading(true);
      await accountCategoryService.update(id, values);
      toast({
        title: 'Category updated successfully',
        description: 'Category updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update category');
      toast({
        title: 'Failed to update category',
        description: err.message || 'Failed to update category',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: 'Category deleted successfully',
        description: 'Category deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      toast({
        title: 'Failed to delete category',
        description: err.message || 'Failed to delete category',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async (values) => {
    try {
      setLoading(true);
      await accountTypeService.create(values);
      toast({
        title: 'Account type created successfully',
        description: 'Account type created successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create account type');
      toast({
        title: 'Failed to create account type',
        description: err.message || 'Failed to create account type',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditType = async (id, values) => {
    try {
      setLoading(true);
      await accountTypeService.update(id, values);
      toast({
        title: 'Account type updated successfully',
        description: 'Account type updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update account type');
      toast({
        title: 'Failed to update account type',
        description: err.message || 'Failed to update account type',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
      toast({
        title: 'Account type deleted successfully',
        description: 'Account type deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete account type');
      toast({
        title: 'Failed to delete account type',
        description: err.message || 'Failed to delete account type',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="lg" mt={4} mb={4}>
      <Heading size="lg" mb={4}>
        Chart of Accounts
      </Heading>

      {error && (
        <Alert status="error" mb={4} onClose={() => setError(null)}>
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs index={activeTab} onChange={setActiveTab} mb={4}>
        <TabList>
          <Tab>Accounts</Tab>
          <Tab>Categories & Types</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <ChartOfAccounts
              accounts={accounts}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isLoading={loading}
            />
          </TabPanel>
          <TabPanel>
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
          </TabPanel>
        </TabPanels>
      </Tabs>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAccount ? 'Edit Account' : 'Add New Account'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AccountForm
              account={selectedAccount}
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={loading}
              categories={categories}
              accountTypes={accountTypes}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default ChartOfAccountsPage; 