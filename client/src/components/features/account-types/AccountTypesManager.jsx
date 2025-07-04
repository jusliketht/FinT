import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  Table,
  IconButton,
  Input,
  FormHelperText,
  Alert,
  Spinner,
  HStack,
  VStack,
  Select
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import accountTypeService from '../../../services/accountTypeService';
import { useToast } from '../../../contexts/ToastContext';
import { useApi } from '../../../hooks/useApi';

const AccountTypesManager = () => {
  const api = useApi();
  const { showToast } = useToast();
  
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    value: '',
    label: '',
    description: ''
  });

  useEffect(() => {
    fetchAccountTypes();
  }, []);

  const fetchAccountTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/account-types');
      setAccountTypes(response.data);
    } catch (error) {
      showToast('Failed to fetch account types', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedType) {
        await api.put(`/account-types/${selectedType.id}`, formData);
        showToast('Account type updated successfully', 'success');
      } else {
        await api.post('/account-types', formData);
        showToast('Account type created successfully', 'success');
      }
      
      fetchAccountTypes();
      handleClose();
    } catch (error) {
      showToast('Failed to save account type', 'error');
    }
  };

  const handleEdit = (accountType) => {
    setSelectedType(accountType);
    setFormData({
      value: accountType.value,
      label: accountType.label,
      description: accountType.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account type?')) {
      return;
    }
    
    try {
      await api.delete(`/account-types/${id}`);
      showToast('Account type deleted successfully', 'success');
      fetchAccountTypes();
    } catch (error) {
      showToast('Failed to delete account type', 'error');
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setFormData({ value: '', label: '', description: '' });
    setShowForm(false);
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Account Types</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="brand"
          onClick={() => setShowForm(true)}
        >
          Add Account Type
        </Button>
      </HStack>

      {showForm && (
        <Box borderWidth="1px" borderRadius="lg" p={6} bg="gray.50">
          <VStack spacing={4}>
            <Heading size="md">
              {selectedType ? 'Edit Account Type' : 'Add Account Type'}
            </Heading>
            
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={4}>
                <Box width="100%">
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Value *</label>
                  <Input
                    value={formData.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="e.g., asset, liability"
                    required
                  />
                </Box>
                
                <Box width="100%">
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Label *</label>
                  <Input
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="e.g., Asset, Liability"
                    required
                  />
                </Box>
                
                <Box width="100%">
                  <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                  />
                </Box>
                
                <HStack spacing={3}>
                  <Button variant="ghost" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button type="submit" colorScheme="brand">
                    {selectedType ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </VStack>
        </Box>
      )}

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table variant="simple">
          <thead>
            <tr>
              <th>Value</th>
              <th>Label</th>
              <th>Categories</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && accountTypes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  <Spinner size="sm" />
                </td>
              </tr>
            ) : accountTypes.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  No account types found
                </td>
              </tr>
            ) : (
              accountTypes.map((accountType) => (
                <tr key={accountType.id}>
                  <td>{accountType.value}</td>
                  <td>{accountType.label}</td>
                  <td>{accountType.categories?.length || 0}</td>
                  <td style={{ textAlign: 'right' }}>
                    <IconButton 
                      size="sm"
                      icon={<EditIcon />}
                      onClick={() => handleEdit(accountType)}
                      variant="ghost"
                      aria-label="Edit account type"
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(accountType.id)}
                      variant="ghost"
                      colorScheme="red"
                      aria-label="Delete account type"
                      ml={2}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Box>
    </VStack>
  );
};

export default AccountTypesManager; 