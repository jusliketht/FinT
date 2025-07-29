import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../../contexts/BusinessContext';
import { useToast as useToastContext } from '../../../contexts/ToastContext';
import accountService from '../../../services/accountService';

const AccountsManager = () => {
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToastContext();
  const toast = useToast();
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [isOpen, onOpen, onClose] = useDisclosure();

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedBusiness?.id) {
        setAccounts([]);
        return;
      }

      const response = await accountService.getAll({
        businessId: selectedBusiness.id,
        search: searchTerm,
        type: accountTypeFilter
      });
      
      setAccounts(response.data || response);
    } catch (err) {
      setError('Failed to fetch accounts');
      showToast('error', 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness?.id, searchTerm, accountTypeFilter, showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchAccounts();
    }
  }, [selectedBusiness, fetchAccounts]);

  const handleCreateAccount = async (accountData) => {
    try {
      const newAccount = await accountService.create({
        ...accountData,
        businessId: selectedBusiness.id
      });
      
      setAccounts([...accounts, newAccount]);
      setShowForm(false);
      setEditingAccount(null);
      showToast('success', 'Account created successfully');
    } catch (err) {
      showToast('error', 'Failed to create account');
    }
  };

  const handleUpdateAccount = async (accountId, accountData) => {
    try {
      const updatedAccount = await accountService.update(accountId, accountData);
      
      setAccounts(accounts.map(acc => 
        acc.id === accountId ? updatedAccount : acc
      ));
      
      setShowForm(false);
      setEditingAccount(null);
      showToast('success', 'Account updated successfully');
    } catch (err) {
      showToast('error', 'Failed to update account');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    try {
      await accountService.delete(accountId);
      
      setAccounts(accounts.filter(acc => acc.id !== accountId));
      showToast('success', 'Account deleted successfully');
    } catch (err) {
      showToast('error', 'Failed to delete account');
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'asset': return 'blue';
      case 'liability': return 'red';
      case 'equity': return 'green';
      case 'revenue': return 'purple';
      case 'expense': return 'orange';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !accountTypeFilter || account.type === accountTypeFilter;
    return matchesSearch && matchesType;
  });

  if (!selectedBusiness) {
    return (
      <Box p={6}>
        <Alert status="info">
          <AlertIcon />
          Please select a business to manage accounts.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Chart of Accounts</Heading>
            <Text color="gray.600">Manage your business accounts</Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              setEditingAccount(null);
              setShowForm(true);
              onOpen();
            }}
          >
            Add Account
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search accounts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select
            placeholder="Filter by type"
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
            maxW="200px"
          >
            <option value="ASSET">Assets</option>
            <option value="LIABILITY">Liabilities</option>
            <option value="EQUITY">Equity</option>
            <option value="REVENUE">Revenue</option>
            <option value="EXPENSE">Expenses</option>
          </Select>
        </HStack>

        {/* Accounts Table */}
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Loading accounts...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th>Type</Th>
                  <Th>Balance</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAccounts.map((account) => (
                  <Tr key={account.id}>
                    <Td fontWeight="bold">{account.code}</Td>
                    <Td>{account.name}</Td>
                    <Td>
                      <Badge colorScheme={getAccountTypeColor(account.type)}>
                        {account.type}
                      </Badge>
                    </Td>
                    <Td>{formatCurrency(account.balance)}</Td>
                    <Td>
                      <Badge colorScheme={account.isActive ? 'green' : 'red'}>
                        {account.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          size="sm"
                          icon={<EditIcon />}
                          aria-label="Edit account"
                          variant="ghost"
                          onClick={() => {
                            setEditingAccount(account);
                            setShowForm(true);
                            onOpen();
                          }}
                        />
                        <IconButton
                          size="sm"
                          icon={<DeleteIcon />}
                          aria-label="Delete account"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteAccount(account.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* Account Form Modal */}
        {showForm && (
          <AccountForm
            isOpen={isOpen}
            onClose={() => {
              onClose();
              setShowForm(false);
              setEditingAccount(null);
            }}
            account={editingAccount}
            onSubmit={editingAccount ? handleUpdateAccount : handleCreateAccount}
          />
        )}
      </VStack>
    </Box>
  );
};

// Account Form Component
const AccountForm = ({ isOpen, onClose, account, onSubmit }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    category: '',
    description: '',
    isActive: true
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code || '',
        name: account.name || '',
        type: account.type || '',
        category: account.category || '',
        description: account.description || '',
        isActive: account.isActive !== false
      });
    } else {
      setFormData({
        code: '',
        name: '',
        type: '',
        category: '',
        description: '',
        isActive: true
      });
    }
  }, [account]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (account) {
        await onSubmit(account.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {account ? 'Edit Account' : 'Create New Account'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Input
                placeholder="Account Code (e.g., 1000)"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                required
              />
              
              <Input
                placeholder="Account Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              
              <Select
                placeholder="Select Account Type"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                required
              >
                <option value="ASSET">Asset</option>
                <option value="LIABILITY">Liability</option>
                <option value="EQUITY">Equity</option>
                <option value="REVENUE">Revenue</option>
                <option value="EXPENSE">Expense</option>
              </Select>
              
              <Select
                placeholder="Select Category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="CURRENT_ASSET">Current Asset</option>
                <option value="FIXED_ASSET">Fixed Asset</option>
                <option value="CURRENT_LIABILITY">Current Liability</option>
                <option value="LONG_TERM_LIABILITY">Long Term Liability</option>
                <option value="OWNERS_EQUITY">Owner's Equity</option>
                <option value="OPERATING_REVENUE">Operating Revenue</option>
                <option value="OPERATING_EXPENSE">Operating Expense</option>
              </Select>
              
              <Input
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              
              <HStack spacing={4} w="full">
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText="Saving..."
                  w="full"
                >
                  {account ? 'Update Account' : 'Create Account'}
                </Button>
                <Button onClick={onClose} w="full">
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AccountsManager; 