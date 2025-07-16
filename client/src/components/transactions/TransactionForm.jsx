import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  Spinner,
  Alert,
  Divider,
  Badge,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import transactionService from '../../services/transactionService';
import accountService from '../../services/accountService';
import { useBusiness } from '../../contexts/BusinessContext';

const TransactionForm = ({ transaction = null, onSuccess, onCancel, isLoading = false }) => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
    transactionType: 'expense',
    paymentMethod: '',
    reference: '',
    notes: '',
    accountId: ''
  });

  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Payment method options
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'other', label: 'Other' }
  ];

  // Transaction type options
  const transactionTypes = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'adjustment', label: 'Adjustment' }
  ];

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: new Date(transaction.date).toISOString().split('T')[0],
        description: transaction.description || '',
        amount: transaction.amount?.toString() || '',
        category: transaction.category || '',
        transactionType: transaction.transactionType || 'expense',
        paymentMethod: transaction.paymentMethod || '',
        reference: transaction.reference || '',
        notes: transaction.notes || '',
        accountId: transaction.accountId || ''
      });
    }
    loadCategories();
    loadAccounts();
  }, [transaction]);

  const loadCategories = async () => {
    try {
      const categoriesData = await transactionService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const loadAccounts = async () => {
    try {
      const accountsData = await accountService.getAll();
      setAccounts(accountsData);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load accounts',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.transactionType) {
      newErrors.transactionType = 'Transaction type is required';
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
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        businessId: selectedBusiness?.id
      };

      if (transaction) {
        await transactionService.update(transaction.id, transactionData);
        toast({
          title: 'Success',
          description: 'Transaction updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await transactionService.create(transactionData);
        toast({
          title: 'Success',
          description: 'Transaction created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save transaction',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCategoryChange = (value) => {
    handleInputChange('category', value);
    
    // Auto-suggest payment method based on category
    const category = value.toLowerCase();
    if (category.includes('salary') || category.includes('income')) {
      handleInputChange('paymentMethod', 'bank_transfer');
    } else if (category.includes('food') || category.includes('dining')) {
      handleInputChange('paymentMethod', 'cash');
    }
  };

  const formatCurrency = (value) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return numericValue;
  };

  const handleAmountChange = (value) => {
    const formattedValue = formatCurrency(value);
    handleInputChange('amount', formattedValue);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        {/* Basic Information */}
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          Transaction Details
        </Text>

        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.date}>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              isDisabled={loading || isLoading}
            />
            {errors.date && <Text color="red.500" fontSize="sm">{errors.date}</Text>}
          </FormControl>

          <FormControl isInvalid={!!errors.transactionType}>
            <FormLabel>Type</FormLabel>
            <Select
              value={formData.transactionType}
              onChange={(e) => handleInputChange('transactionType', e.target.value)}
              isDisabled={loading || isLoading}
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            {errors.transactionType && <Text color="red.500" fontSize="sm">{errors.transactionType}</Text>}
          </FormControl>
        </HStack>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Input
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter transaction description"
            isDisabled={loading || isLoading}
          />
          {errors.description && <Text color="red.500" fontSize="sm">{errors.description}</Text>}
        </FormControl>

        <HStack spacing={4}>
          <FormControl isInvalid={!!errors.amount}>
            <FormLabel>Amount</FormLabel>
            <Input
              type="text"
              value={formData.amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              isDisabled={loading || isLoading}
            />
            {errors.amount && <Text color="red.500" fontSize="sm">{errors.amount}</Text>}
          </FormControl>

          <FormControl isInvalid={!!errors.category}>
            <FormLabel>Category</FormLabel>
            <Select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              placeholder="Select category"
              isDisabled={loading || isLoading}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            {errors.category && <Text color="red.500" fontSize="sm">{errors.category}</Text>}
          </FormControl>
        </HStack>

        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Payment Method</FormLabel>
            <Select
              value={formData.paymentMethod}
              onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              placeholder="Select payment method"
              isDisabled={loading || isLoading}
            >
              {paymentMethods.map(method => (
                <option key={method.value} value={method.value}>
                  {method.method}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Account</FormLabel>
            <Select
              value={formData.accountId}
              onChange={(e) => handleInputChange('accountId', e.target.value)}
              placeholder="Select account (optional)"
              isDisabled={loading || isLoading}
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.code} - {account.name}
                </option>
              ))}
            </Select>
          </FormControl>
        </HStack>

        {/* Advanced Options */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          leftIcon={showAdvanced ? <CloseIcon /> : <AddIcon />}
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
        </Button>

        {showAdvanced && (
          <VStack spacing={4} align="stretch" p={4} bg="gray.50" borderRadius="md">
            <FormControl>
              <FormLabel>Reference Number</FormLabel>
              <Input
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                placeholder="Check number, invoice number, etc."
                isDisabled={loading || isLoading}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes..."
                rows={3}
                isDisabled={loading || isLoading}
              />
            </FormControl>
          </VStack>
        )}

        {/* Action Buttons */}
        <HStack spacing={4} justify="flex-end" pt={4}>
          <Button
            variant="outline"
            onClick={onCancel}
            isDisabled={loading || isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading || isLoading}
            loadingText={transaction ? 'Updating...' : 'Creating...'}
          >
            {transaction ? 'Update Transaction' : 'Create Transaction'}
          </Button>
        </HStack>

        {/* Business Context */}
        {selectedBusiness && (
          <Box p={3} bg="blue.50" borderRadius="md">
            <Text fontSize="sm" color="blue.700">
              <Badge colorScheme="blue" mr={2}>Business</Badge>
              {selectedBusiness.name}
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default TransactionForm; 