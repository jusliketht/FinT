import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  SimpleGrid,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import accountService from '../../../services/accountService';

const AccountsManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountService.getAll();
      setAccounts(response.data || response);
    } catch (err) {
      setError('Failed to fetch accounts');
      toast({
        title: 'Error',
        description: 'Failed to load accounts',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSave = async (accountData) => {
    try {
      if (selectedAccount) {
        await accountService.update(selectedAccount.id, accountData);
        toast({
          title: 'Account updated',
          description: 'Account updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await accountService.create(accountData);
        toast({
          title: 'Account created',
          description: 'Account created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      fetchAccounts();
      onClose();
      setSelectedAccount(null);
    } catch (error) {
      toast({
        title: 'Error saving account',
        description: 'Failed to save account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await api.delete(`/api/accounts/${accountId}`);
        showToast('Account deleted successfully', 'success');
        fetchAccounts();
      } catch (error) {
        showToast('Error deleting account', 'error');
      }
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAccount(null);
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || account.type === filterType;
    const matchesCategory = !filterCategory || account.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];

  if (showForm) {
    return (
      <Box p={6}>
        <Heading size="lg" mb={6}>
          {editingAccount ? 'Edit Account' : 'Create New Account'}
        </Heading>
        
        <AccountForm
          account={editingAccount}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Box>
    );
  }

  return (
    <Box p={6}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Accounts Management</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => setShowForm(true)}
        >
          Add Account
        </Button>
      </HStack>

      {/* Filters */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4}>
            <Box mb={4}>
              <Text fontWeight="medium" mb={2}>Search</Text>
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                pr="2.5rem"
              />
            </Box>

            <Box mb={4}>
              <Text fontWeight="medium" mb={2}>Type</Text>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                placeholder="All types"
              >
                {accountTypes.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </Box>

            <Box mb={4}>
              <Text fontWeight="medium" mb={2}>Category</Text>
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                placeholder="All categories"
              >
                <option value="current">Current</option>
                <option value="non-current">Non-Current</option>
              </Select>
            </Box>
          </HStack>
        </CardBody>
      </Card>

      {/* Accounts List */}
      {loading ? (
        <Text>Loading accounts...</Text>
      ) : filteredAccounts.length === 0 ? (
        <Alert status="info">
          No accounts found.
        </Alert>
      ) : (
        <VStack spacing={4}>
          {filteredAccounts.map(account => (
            <Card key={account.id} w="100%">
              <CardBody>
                <HStack justify="space-between">
                  <Box>
                    <HStack spacing={2} mb={2}>
                      <Text fontWeight="bold">{account.name}</Text>
                      <Badge colorScheme="blue">{account.code}</Badge>
                      <Badge colorScheme="green">{account.type}</Badge>
                    </HStack>
                    {account.description && (
                      <Text color="gray.600" fontSize="sm">
                        {account.description}
                      </Text>
                    )}
                  </Box>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<EditIcon />}
                      onClick={() => handleEdit(account)}
                      variant="ghost"
                      colorScheme="blue"
                      size="sm"
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(account.id)}
                      variant="ghost"
                      colorScheme="red"
                      size="sm"
                    />
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default AccountsManager; 