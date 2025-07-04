import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  IconButton
} from '@chakra-ui/react';
import accountService from '../../services/accountService';
import accountTypeService from '../../services/accountTypeService';
import accountCategoryService from '../../services/accountCategoryService';

const AccountForm = ({ open, onClose, account = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: '',
    category: '',
    description: '',
    parentAccount: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [accountTypes, setAccountTypes] = useState([]);
  const [accountCategories, setAccountCategories] = useState([]);
  const [parentAccounts, setParentAccounts] = useState([]);
  const toast = useToast();

  useEffect(() => {
    if (open) {
      fetchInitialData();
      if (account) {
        setFormData({
          name: account.name || '',
          code: account.code || '',
          type: account.type || '',
          category: account.category || '',
          description: account.description || '',
          parentAccount: account.parentAccount || ''
        });
      } else {
        setFormData({
          name: '',
          code: '',
          type: '',
          category: '',
          description: '',
          parentAccount: ''
        });
      }
    }
  }, [open, account]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [types, categories, accounts] = await Promise.all([
        accountTypeService.getAll(),
        accountCategoryService.getAll(),
        accountService.getAll()
      ]);
      
      setAccountTypes(types);
      setAccountCategories(categories);
      setParentAccounts(accounts.filter(acc => acc.type === 'asset' || acc.type === 'liability'));
      setError(null);
    } catch (err) {
      setError('Failed to load form data');
      console.error('Error loading form data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (account) {
        await accountService.update(account.id, formData);
        toast({
          title: 'Success',
          description: 'Account updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await accountService.create(formData);
        toast({
          title: 'Success',
          description: 'Account created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Error saving account:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to save account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW="600px"
        w="full"
        maxH="90vh"
        overflowY="auto"
      >
        <Text fontSize="xl" fontWeight="bold" mb={6}>
          {account ? 'Edit Account' : 'Create New Account'}
        </Text>

        {error && (
          <div style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spinner size="lg" />
            <Text mt={4}>Loading form data...</Text>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Account Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Cash, Accounts Receivable"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Account Code</label>
                <Input
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000, 1100"
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Account Type</label>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  placeholder="Select account type"
                >
                  {accountTypes.map(type => (
                    <option key={type.id} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Account Category</label>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="Select account category"
                >
                  {accountCategories.map(category => (
                    <option key={category.id} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Parent Account</label>
                <Select
                  name="parentAccount"
                  value={formData.parentAccount}
                  onChange={handleInputChange}
                  placeholder="Select parent account (optional)"
                >
                  {parentAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.code})
                    </option>
                  ))}
                </Select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Description</label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Optional description"
                />
              </div>
            </VStack>

            <HStack spacing={3} mt={6} justify="flex-end">
              <Button variant="ghost" onClick={onClose} isDisabled={submitting}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                colorScheme="blue" 
                isLoading={submitting}
              >
                {account ? 'Update' : 'Create'}
              </Button>
            </HStack>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default AccountForm; 