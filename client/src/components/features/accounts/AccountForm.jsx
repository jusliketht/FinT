import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Select,
  VStack,
  Heading,
  Alert,
  Text,
} from '@chakra-ui/react';
import { useToast } from '../../../contexts/ToastContext';
import useApi from '../../../hooks/useApi';

const AccountForm = ({ account, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    code: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = useApi();
  const { showToast } = useToast();

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        type: account.type || '',
        code: account.code || '',
        description: account.description || '',
      });
    }
  }, [account]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.code) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (account) {
        response = await api.put(`/api/accounts/${account.id}`, formData);
        showToast('Account updated successfully', 'success');
      } else {
        response = await api.post('/api/accounts', formData);
        showToast('Account created successfully', 'success');
      }

      if (onSave) {
        onSave(response.data);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6}>
      <Heading size="lg" mb={6}>
        {account ? 'Edit Account' : 'Create New Account'}
      </Heading>

      {error && (
        <Alert status="error" mb={4}>
          {error}
        </Alert>
      )}

      <Box as="form" onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Box mb={4} w="100%">
            <Text fontWeight="medium" mb={2}>Account Name</Text>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter account name"
            />
          </Box>

          <Box mb={4} w="100%">
            <Text fontWeight="medium" mb={2}>Account Type</Text>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              placeholder="Select account type"
            >
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </Select>
          </Box>

          <Box mb={4} w="100%">
            <Text fontWeight="medium" mb={2}>Account Code</Text>
            <Input
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter account code"
            />
          </Box>

          <Box mb={4} w="100%">
            <Text fontWeight="medium" mb={2}>Description</Text>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description (optional)"
            />
          </Box>

          <Box w="100%" display="flex" gap={4}>
            <Button
              type="submit"
              colorScheme="blue"
              isLoading={loading}
              flex={1}
            >
              {account ? 'Update Account' : 'Create Account'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              flex={1}
            >
              Cancel
            </Button>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
};

export default AccountForm; 