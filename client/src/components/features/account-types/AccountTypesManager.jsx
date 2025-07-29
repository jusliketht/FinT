import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  IconButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
} from '@chakra-ui/react';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../../contexts/BusinessContext';
import { useToast } from '../../../contexts/ToastContext';

const AccountTypesManager = () => {
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    category: 'ASSET'
  });

  const fetchAccountTypes = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockTypes = [
        {
          id: '1',
          name: 'Current Assets',
          code: 'CA',
          description: 'Assets that can be converted to cash within one year',
          category: 'ASSET',
          isActive: true
        },
        {
          id: '2',
          name: 'Fixed Assets',
          code: 'FA',
          description: 'Long-term assets used in business operations',
          category: 'ASSET',
          isActive: true
        },
        {
          id: '3',
          name: 'Current Liabilities',
          code: 'CL',
          description: 'Obligations due within one year',
          category: 'LIABILITY',
          isActive: true
        }
      ];
      setAccountTypes(mockTypes);
    } catch (err) {
      setError('Failed to fetch account types');
      showToast('error', 'Failed to fetch account types');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchAccountTypes();
    }
  }, [selectedBusiness, fetchAccountTypes]);

  const handleSubmit = async () => {
    try {
      if (editingType) {
        // Update existing type
        setAccountTypes(types => 
          types.map(t => 
            t.id === editingType.id 
              ? { ...t, ...formData }
              : t
          )
        );
        showToast('success', 'Account type updated successfully');
      } else {
        // Create new type
        const newType = {
          id: Date.now().toString(),
          ...formData,
          isActive: true
        };
        setAccountTypes([...accountTypes, newType]);
        showToast('success', 'Account type created successfully');
      }
      
      setFormData({
        name: '',
        code: '',
        description: '',
        category: 'ASSET'
      });
      setEditingType(null);
      onClose();
    } catch (err) {
      showToast('error', 'Failed to save account type');
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      code: type.code,
      description: type.description,
      category: type.category
    });
    onOpen();
  };

  const handleDelete = async (typeId) => {
    try {
      setAccountTypes(types => types.filter(t => t.id !== typeId));
      showToast('success', 'Account type deleted successfully');
    } catch (err) {
      showToast('error', 'Failed to delete account type');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      category: 'ASSET'
    });
    setEditingType(null);
    onClose();
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading account types...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Account Types</Heading>
          <Button
            colorScheme="blue"
            onClick={onOpen}
          >
            Add Account Type
          </Button>
        </HStack>

        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Manage Account Types ({accountTypes.length})
            </Text>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th>Category</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {accountTypes.map((type) => (
                  <Tr key={type.id}>
                    <Td>
                      <Text fontWeight="semibold">{type.code}</Text>
                    </Td>
                    <Td>{type.name}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          type.category === 'ASSET' ? 'green' :
                          type.category === 'LIABILITY' ? 'red' :
                          type.category === 'EQUITY' ? 'blue' :
                          type.category === 'REVENUE' ? 'purple' : 'gray'
                        }
                        variant="subtle"
                      >
                        {type.category}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {type.description}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={type.isActive ? 'green' : 'gray'}
                        variant="subtle"
                      >
                        {type.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          icon={<EditIcon />}
                          onClick={() => handleEdit(type)}
                          aria-label="Edit account type"
                        />
                        <IconButton
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          icon={<DeleteIcon />}
                          onClick={() => handleDelete(type.id)}
                          aria-label="Delete account type"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </VStack>

      {/* Add/Edit Modal */}
      <Modal isOpen={isOpen} onClose={handleCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingType ? 'Edit Account Type' : 'Add Account Type'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Account Type Name"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Code</FormLabel>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  placeholder="Short Code"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="ASSET">Asset</option>
                  <option value="LIABILITY">Liability</option>
                  <option value="EQUITY">Equity</option>
                  <option value="REVENUE">Revenue</option>
                  <option value="EXPENSE">Expense</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description"
                />
              </FormControl>
              
              <HStack spacing={4} width="100%">
                <Button variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleSubmit}>
                  {editingType ? 'Update' : 'Create'}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AccountTypesManager; 