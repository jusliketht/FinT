import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Text,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useDisclosure,
  Box,
  Divider,
  Flex,
  Badge,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { transactionSchema, formatCurrency } from '../../utils/validation';
import { useApi } from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import { LoadingSpinner } from '../common/LoadingStates';

// Account Creation Modal Component
const AccountCreationModal = ({ isOpen, onClose, onAccountCreated }) => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const api = useApi();
  const [submitting, setSubmitting] = useState(false);

  const accountFormik = useFormik({
    initialValues: {
      code: '',
      name: '',
      type: 'asset',
      description: '',
    },
    validationSchema: Yup.object().shape({
      code: Yup.string()
        .required('Account code is required')
        .min(2, 'Code must be at least 2 characters')
        .max(10, 'Code must be less than 10 characters'),
      name: Yup.string()
        .required('Account name is required')
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name must be less than 100 characters'),
      type: Yup.string()
        .required('Account type is required')
        .oneOf(['asset', 'liability', 'equity', 'revenue', 'expense'], 'Invalid account type'),
      description: Yup.string()
        .max(200, 'Description must be less than 200 characters'),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const response = await api.post('/api/accounting/accounts', {
          ...values,
          businessId: selectedBusiness?.id || null,
        });
        
        toast({
          title: 'Account created successfully',
          status: 'success',
          duration: 3000,
        });
        
        onAccountCreated(response.data);
        onClose();
      } catch (error) {
        toast({
          title: 'Failed to create account',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={accountFormik.handleSubmit}>
          <ModalHeader>Add New Account</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={accountFormik.touched.code && accountFormik.errors.code} isRequired>
                <FormLabel>Account Code</FormLabel>
                <Input
                  name="code"
                  value={accountFormik.values.code}
                  onChange={accountFormik.handleChange}
                  onBlur={accountFormik.handleBlur}
                  placeholder="e.g., 1000"
                />
                <FormErrorMessage>{accountFormik.errors.code}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={accountFormik.touched.name && accountFormik.errors.name} isRequired>
                <FormLabel>Account Name</FormLabel>
                <Input
                  name="name"
                  value={accountFormik.values.name}
                  onChange={accountFormik.handleChange}
                  onBlur={accountFormik.handleBlur}
                  placeholder="e.g., Cash"
                />
                <FormErrorMessage>{accountFormik.errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={accountFormik.touched.type && accountFormik.errors.type} isRequired>
                <FormLabel>Account Type</FormLabel>
                <Select
                  name="type"
                  value={accountFormik.values.type}
                  onChange={accountFormik.handleChange}
                  onBlur={accountFormik.handleBlur}
                >
                  <option value="asset">Asset</option>
                  <option value="liability">Liability</option>
                  <option value="equity">Equity</option>
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                </Select>
                <FormErrorMessage>{accountFormik.errors.type}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={accountFormik.touched.description && accountFormik.errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={accountFormik.values.description}
                  onChange={accountFormik.handleChange}
                  onBlur={accountFormik.handleBlur}
                  placeholder="Optional description"
                  rows={3}
                />
                <FormErrorMessage>{accountFormik.errors.description}</FormErrorMessage>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose} isDisabled={submitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={submitting}
                loadingText="Creating..."
                isDisabled={!accountFormik.isValid || submitting}
              >
                Create Account
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

const TransactionForm = ({ isOpen, onClose, transaction, onSuccess }) => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Account creation modal state
  const { isOpen: isAccountModalOpen, onOpen: onAccountModalOpen, onClose: onAccountModalClose } = useDisclosure();

  // Handle account creation
  const handleAccountCreated = (newAccount) => {
    setAccounts(prev => [...prev, newAccount]);
    formik.setFieldValue('accountId', newAccount.id);
    toast({
      title: 'Account added successfully',
      description: `${newAccount.name} has been added and selected`,
      status: 'success',
      duration: 3000,
    });
  };

  // Form validation schema
  const validationSchema = Yup.object().shape({
    date: Yup.date()
      .required('Date is required')
      .max(new Date(), 'Date cannot be in the future'),
    amount: Yup.number()
      .required('Amount is required')
      .positive('Amount must be positive')
      .typeError('Amount must be a valid number'),
    description: Yup.string()
      .required('Description is required')
      .min(3, 'Description must be at least 3 characters')
      .max(200, 'Description must be less than 200 characters'),
    type: Yup.string()
      .required('Transaction type is required')
      .oneOf(['income', 'expense', 'transfer'], 'Invalid transaction type'),
    category: Yup.string()
      .required('Category is required'),
    accountId: Yup.string()
      .required('Account is required'),
    reference: Yup.string()
      .max(100, 'Reference must be less than 100 characters'),
    notes: Yup.string()
      .max(500, 'Notes must be less than 500 characters'),
  });

  // Formik form setup
  const formik = useFormik({
    initialValues: {
      date: transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      amount: transaction?.amount || '',
      description: transaction?.description || '',
      type: transaction?.type || 'expense',
      category: transaction?.category || '',
      accountId: transaction?.accountId || '',
      reference: transaction?.reference || '',
      notes: transaction?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const data = {
          ...values,
          businessId: selectedBusiness?.id || null, // Allow null for personal transactions
          amount: parseFloat(values.amount),
        };

        if (transaction) {
          await api.put(`/transactions/${transaction.id}`, data, {}, {
            successMessage: 'Transaction updated successfully',
            errorMessage: 'Failed to update transaction',
          });
        } else {
          await api.post('/transactions', data, {}, {
            successMessage: 'Transaction created successfully',
            errorMessage: 'Failed to create transaction',
          });
        }

        onSuccess();
        onClose();
      } catch (error) {
        console.error('Transaction form error:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Load accounts and categories
  useEffect(() => {
    if (isOpen) {
      loadFormData();
    }
  }, [isOpen, selectedBusiness]);

  const loadFormData = async () => {
    setLoading(true);
    try {
      const [accountsData, categoriesData] = await Promise.all([
        api.get('/accounts', { 
          params: { 
            businessId: selectedBusiness?.id || null,
            includePersonal: !selectedBusiness // Include personal accounts if no business selected
          } 
        }),
        api.get('/account-categories'),
      ]);
      
      setAccounts(accountsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast.showError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts by transaction type
  const filteredAccounts = accounts.filter(acc => {
    if (formik.values.type === 'income') {
      return acc.type === 'REVENUE' || acc.type === 'ASSET';
    } else if (formik.values.type === 'expense') {
      return acc.type === 'EXPENSE' || acc.type === 'ASSET';
    } else if (formik.values.type === 'transfer') {
      return acc.type === 'ASSET';
    }
    return true;
  });

  // Filter categories by transaction type
  const filteredCategories = categories.filter(cat => {
    if (formik.values.type === 'income') {
      return cat.type === 'REVENUE';
    } else if (formik.values.type === 'expense') {
      return cat.type === 'EXPENSE';
    }
    return true;
  });

  const handleAmountChange = (value) => {
    formik.setFieldValue('amount', value);
  };

  const getFieldError = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  const isFieldInvalid = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <LoadingSpinner message="Loading form data..." />
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader>
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Transaction Type Selection */}
              <FormControl isInvalid={isFieldInvalid('type')}>
                <FormLabel>Transaction Type</FormLabel>
                <Select
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </Select>
                <FormErrorMessage>{getFieldError('type')}</FormErrorMessage>
              </FormControl>

              {/* Date and Amount */}
              <HStack spacing={4}>
                <FormControl isInvalid={isFieldInvalid('date')} isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <FormErrorMessage>{getFieldError('date')}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={isFieldInvalid('amount')} isRequired>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput
                    value={formik.values.amount}
                    onChange={handleAmountChange}
                    min={0}
                    precision={2}
                  >
                    <NumberInputField
                      name="amount"
                      onBlur={formik.handleBlur}
                      placeholder="0.00"
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>
                    {formik.values.amount && formatCurrency(formik.values.amount)}
                  </FormHelperText>
                  <FormErrorMessage>{getFieldError('amount')}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Description */}
              <FormControl isInvalid={isFieldInvalid('description')} isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter transaction description"
                />
                <FormHelperText>
                  {formik.values.description.length}/200 characters
                </FormHelperText>
                <FormErrorMessage>{getFieldError('description')}</FormErrorMessage>
              </FormControl>

              {/* Category and Account */}
              <HStack spacing={4}>
                <FormControl isInvalid={isFieldInvalid('category')} isRequired>
                  <FormLabel>Category</FormLabel>
                  <Select
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Select category"
                  >
                    {filteredCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{getFieldError('category')}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={isFieldInvalid('accountId')} isRequired>
                  <FormLabel>Account</FormLabel>
                  <HStack spacing={2}>
                    <Select
                      name="accountId"
                      value={formik.values.accountId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Select account"
                      flex={1}
                    >
                      {filteredAccounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.code})
                        </option>
                      ))}
                    </Select>
                    <Tooltip label="Add new account">
                      <IconButton
                        icon={<AddIcon />}
                        onClick={onAccountModalOpen}
                        colorScheme="blue"
                        variant="outline"
                        size="md"
                        aria-label="Add new account"
                      />
                    </Tooltip>
                  </HStack>
                  <FormErrorMessage>{getFieldError('accountId')}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Reference */}
              <FormControl isInvalid={isFieldInvalid('reference')}>
                <FormLabel>Reference</FormLabel>
                <Input
                  name="reference"
                  value={formik.values.reference}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Optional reference number or ID"
                />
                <FormHelperText>
                  Invoice number, receipt number, or other reference
                </FormHelperText>
                <FormErrorMessage>{getFieldError('reference')}</FormErrorMessage>
              </FormControl>

              {/* Notes */}
              <FormControl isInvalid={isFieldInvalid('notes')}>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
                <FormHelperText>
                  {formik.values.notes.length}/500 characters
                </FormHelperText>
                <FormErrorMessage>{getFieldError('notes')}</FormErrorMessage>
              </FormControl>

              {/* Validation Summary */}
              {Object.keys(formik.errors).length > 0 && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Please fix the following errors:</AlertTitle>
                    <AlertDescription>
                      <VStack align="start" spacing={1} mt={2}>
                        {Object.entries(formik.errors).map(([field, error]) => (
                          <Text key={field} fontSize="sm">
                            • {error}
                          </Text>
                        ))}
                      </VStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={onClose}
                isDisabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={submitting}
                loadingText="Saving..."
                isDisabled={!formik.isValid || submitting}
              >
                {transaction ? 'Update Transaction' : 'Create Transaction'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
      
      {/* Account Creation Modal */}
      <AccountCreationModal
        isOpen={isAccountModalOpen}
        onClose={onAccountModalClose}
        onAccountCreated={handleAccountCreated}
      />
    </Modal>
  );
};

export default TransactionForm; 