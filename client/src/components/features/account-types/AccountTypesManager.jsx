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
import accountTypeService from '../../../services/accountTypeService';

const AccountTypesManager = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchAccountTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountTypeService.getAll();
      setAccountTypes(response.data || response);
    } catch (err) {
      setError('Failed to fetch account types');
      toast({
        title: 'Error',
        description: 'Failed to load account types',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAccountTypes();
  }, [fetchAccountTypes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedType) {
        await accountTypeService.update(selectedType.id, formData);
        toast({
          title: 'Success',
          description: 'Account type updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        await accountTypeService.create(formData);
        toast({
          title: 'Success',
          description: 'Account type created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      fetchAccountTypes();
      handleClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save account type',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (accountType) => {
    setSelectedType(accountType);
    setFormData({
      value: accountType.value,
      label: accountType.label,
      description: accountType.description || ''
    });
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account type?')) {
      return;
    }
    
    try {
      await accountTypeService.delete(id);
      toast({
        title: 'Success',
        description: 'Account type deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchAccountTypes();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete account type',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setFormData({ value: '', label: '', description: '' });
    onClose();
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Account Types</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="brand"
          onClick={onOpen}
        >
          Add Account Type
        </Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedType ? 'Edit Account Type' : 'Add Account Type'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
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
                    <Button variant="ghost" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" colorScheme="brand">
                      {selectedType ? 'Update' : 'Create'}
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

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