import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import accountService from '../../services/accountService';
import accountCategoryService from '../../services/accountCategoryService';

const ChartOfAccounts = ({ businessId }) => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [accountsData, categoriesData] = await Promise.all([
        accountService.getAll({ businessId }),
        accountCategoryService.getAll()
      ]);
      setAccounts(accountsData.data || accountsData);
      setCategories(categoriesData.data || categoriesData);
    } catch (err) {
      setError('Failed to fetch chart of accounts');
      toast({
        title: 'Error',
        description: 'Failed to load chart of accounts',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [businessId, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = () => {
    setSelectedAccount(null);
    onOpen();
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    onOpen();
  };

  const handleDelete = async (account) => {
    if (!window.confirm(`Are you sure you want to delete account ${account.code} - ${account.name}?`)) {
      return;
    }

    try {
      await accountService.delete(account.id);
      toast({
        title: 'Success',
        description: 'Account deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchData();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete account',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFormSuccess = () => {
    onClose();
    fetchData();
    toast({
      title: 'Success',
      description: selectedAccount ? 'Account updated successfully' : 'Account created successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      asset: 'green',
      liability: 'red',
      equity: 'purple',
      revenue: 'blue',
      expense: 'orange'
    };
    return colors[type] || 'gray';
  };

  const getAccountTypeLabel = (type) => {
    const labels = {
      asset: 'Asset',
      liability: 'Liability',
      equity: 'Equity',
      revenue: 'Revenue',
      expense: 'Expense'
    };
    return labels[type] || type;
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || account.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedAccounts = filteredAccounts.reduce((groups, account) => {
    const type = account.type.toLowerCase();
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {});

  const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading chart of accounts...</Text>
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
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Chart of Accounts</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleCreate}
        >
          Add Account
        </Button>
      </HStack>

      {/* Filters */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4}>
            <FormControl maxW="300px">
              <FormLabel>Search</FormLabel>
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormControl>
            <FormControl maxW="200px">
              <FormLabel>Category</FormLabel>
              <Select
                placeholder="All categories"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>
        </CardBody>
      </Card>

      {filteredAccounts.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500" mb={4}>
              {searchTerm || selectedCategory ? 'No accounts match your filters' : 'No accounts found'}
            </Text>
            <Button colorScheme="blue" onClick={handleCreate}>
              Add First Account
            </Button>
          </CardBody>
        </Card>
      ) : (
        <Accordion allowMultiple>
          {accountTypes.map(type => {
            const typeAccounts = groupedAccounts[type] || [];
            if (typeAccounts.length === 0) return null;

            return (
              <AccordionItem key={type}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <HStack>
                      <Badge colorScheme={getAccountTypeColor(type)}>
                        {getAccountTypeLabel(type)}
                      </Badge>
                      <Text fontWeight="medium">
                        {typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}
                      </Text>
                    </HStack>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Code</Th>
                          <Th>Name</Th>
                          <Th>Category</Th>
                          <Th>Balance</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {typeAccounts.map(account => (
                          <Tr key={account.id}>
                            <Td fontWeight="medium">{account.code}</Td>
                            <Td>{account.name}</Td>
                            <Td>
                              <Badge size="sm" variant="outline">
                                {account.category?.name || 'N/A'}
                              </Badge>
                            </Td>
                            <Td>
                              <Text fontSize="sm" color="gray.600">
                                $0.00
                              </Text>
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <IconButton
                                  icon={<EditIcon />}
                                  aria-label="Edit account"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(account)}
                                />
                                <IconButton
                                  icon={<DeleteIcon />}
                                  aria-label="Delete account"
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => handleDelete(account)}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Account Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedAccount ? 'Edit Account' : 'Add New Account'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <AccountForm
              account={selectedAccount}
              categories={categories}
              businessId={businessId}
              onSuccess={handleFormSuccess}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

// Account Form Component
const AccountForm = ({ account, categories, businessId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    categoryId: '',
    description: '',
    parentId: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (account) {
      setFormData({
        code: account.code || '',
        name: account.name || '',
        type: account.type || '',
        categoryId: account.categoryId || '',
        description: account.description || '',
        parentId: account.parentId || ''
      });
    }
  }, [account]);

  const accountTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'expense', label: 'Expense' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Account code is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Account name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Account type is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        businessId
      };

      if (account) {
        await accountService.update(account.id, submitData);
      } else {
        await accountService.create(submitData);
      }
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save account';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired isInvalid={!!errors.code}>
          <FormLabel>Account Code</FormLabel>
          <Input
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="e.g., 1000"
          />
          <FormErrorMessage>{errors.code}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Account Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Cash"
          />
          <FormErrorMessage>{errors.name}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.type}>
          <FormLabel>Account Type</FormLabel>
          <Select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            placeholder="Select account type"
          >
            {accountTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.type}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.categoryId}>
          <FormLabel>Category</FormLabel>
          <Select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            placeholder="Select category"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.categoryId}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Input
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Optional description"
          />
        </FormControl>

        <HStack justify="flex-end" spacing={4}>
          <Button onClick={onCancel} variant="ghost">
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Saving..."
          >
            {account ? 'Update Account' : 'Create Account'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ChartOfAccounts; 