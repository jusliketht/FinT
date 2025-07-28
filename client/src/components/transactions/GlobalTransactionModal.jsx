import React, { useState, useEffect, useCallback, useMemo } from 'react';

import {
  AddIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useBusiness } from '../../contexts/BusinessContext';
import { useTransaction } from '../../contexts/TransactionContext';
import { LoadingSpinner } from '../common/LoadingStates';
import { useApi } from '../../hooks/useApi';

const GlobalTransactionModal = () => {
  const { isModalOpen, selectedTransaction, closeModal, handleTransactionSuccess } = useTransaction();
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    code: '',
    type: '',
    description: '',
  });

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
    transactionType: Yup.string()
      .required('Transaction type is required')
      .oneOf(['Income', 'Expense', 'Transfer', 'Adjustment'], 'Invalid transaction type'),
    category: Yup.string()
      .required('Category is required'),
    accountId: Yup.string()
      .required('Account is required'),
    personEntity: Yup.string()
      .max(100, 'Person/Entity must be less than 100 characters'),
    paymentMethod: Yup.string()
      .required('Payment method is required'),
    referenceNumber: Yup.string()
      .max(100, 'Reference number must be less than 100 characters'),
    notes: Yup.string()
      .max(500, 'Notes must be less than 500 characters'),
  });

  // Formik form setup
  const formik = useFormik({
    initialValues: {
      date: selectedTransaction?.date ? new Date(selectedTransaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      amount: selectedTransaction?.amount || '',
      description: selectedTransaction?.description || '',
      transactionType: selectedTransaction?.transactionType || 'Expense',
      category: selectedTransaction?.category || '',
      accountId: selectedTransaction?.accountId || '',
      personEntity: selectedTransaction?.personEntity || '',
      paymentMethod: selectedTransaction?.paymentMethod || 'Cash',
      referenceNumber: selectedTransaction?.referenceNumber || '',
      notes: selectedTransaction?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const data = {
          ...values,
          businessId: selectedBusiness?.id || null,
          amount: parseFloat(values.amount),
          attachments: attachments.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type,
          })),
        };

        if (selectedTransaction) {
          await api.put(`/transactions/${selectedTransaction.id}`, data, {}, {
            successMessage: 'Transaction updated successfully',
            errorMessage: 'Failed to update transaction',
          });
        } else {
          await api.post('/transactions', data, {}, {
            successMessage: 'Transaction created successfully',
            errorMessage: 'Failed to create transaction',
          });
        }

        handleTransactionSuccess();
        resetForm();
      } catch (error) {
        console.error('Transaction form error:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Memoized functions
  const resetForm = useCallback(() => {
    formik.resetForm();
    setAttachments([]);
    setShowAddAccount(false);
    setNewAccount({ name: '', code: '', type: '', description: '' });
  }, [formik]);

  const loadFormData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountsData, categoriesData] = await Promise.all([
        api.get('/accounts', { 
          params: { 
            businessId: selectedBusiness?.id || null,
            includePersonal: !selectedBusiness
          } 
        }),
        api.get('/account-categories'),
      ]);
      
      setAccounts(accountsData.data || []);
      setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load form data',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [api, selectedBusiness, toast]);

  const handleAmountChange = useCallback((value) => {
    formik.setFieldValue('amount', value);
  }, [formik]);

  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
  }, []);

  const removeAttachment = useCallback((index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddAccount = useCallback(async () => {
    try {
      const accountData = {
        ...newAccount,
        businessId: selectedBusiness?.id || null,
      };
      
      const response = await api.post('/accounts', accountData);
      
      if (response && response.id) {
        // Add the new account to the accounts list
        setAccounts(prev => [...prev, response]);
        // Set the new account as selected
        formik.setFieldValue('accountId', response.id);
        // Close the add account form
        setShowAddAccount(false);
        // Reset the new account form
        setNewAccount({ name: '', code: '', type: '', description: '' });
        
        toast({
          title: 'Account Created',
          description: 'New account has been created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to create account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [api, newAccount, selectedBusiness, formik, toast]);

  const getFieldError = useCallback((fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  }, [formik]);

  const isFieldInvalid = useCallback((fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  }, [formik]);

  // Memoized computed values
  const filteredCategories = useMemo(() => 
    categories.filter(cat => 
      cat.type === formik.values.transactionType || cat.type === 'general'
    ), [categories, formik.values.transactionType]);

  const filteredAccounts = useMemo(() => 
    accounts.filter(acc => {
      if (formik.values.transactionType === 'Income') {
        return acc.type === 'REVENUE' || acc.type === 'ASSET';
      } else if (formik.values.transactionType === 'Expense') {
        return acc.type === 'EXPENSE' || acc.type === 'ASSET';
      } else if (formik.values.transactionType === 'Transfer') {
        return acc.type === 'ASSET';
      }
      return true;
    }), [accounts, formik.values.transactionType]);

  // Effects
  useEffect(() => {
    if (isModalOpen) {
      loadFormData();
    }
  }, [isModalOpen, loadFormData]);





  if (loading) {
    return (
      <Modal isOpen={isModalOpen} onClose={closeModal} size="xl">
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
    <Modal isOpen={isModalOpen} onClose={closeModal} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <form onSubmit={formik.handleSubmit}>
            <VStack spacing={4} align="stretch">
              {/* Date Field */}
              <FormControl isInvalid={isFieldInvalid('date')}>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  {...formik.getFieldProps('date')}
                />
                <FormErrorMessage>{getFieldError('date')}</FormErrorMessage>
              </FormControl>

              {/* Amount Field */}
              <FormControl isInvalid={isFieldInvalid('amount')}>
                <FormLabel>Amount</FormLabel>
                <NumberInput
                  value={formik.values.amount}
                  onChange={handleAmountChange}
                  precision={2}
                  min={0}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormErrorMessage>{getFieldError('amount')}</FormErrorMessage>
              </FormControl>

              {/* Description Field */}
              <FormControl isInvalid={isFieldInvalid('description')}>
                <FormLabel>Description</FormLabel>
                <Input
                  {...formik.getFieldProps('description')}
                  placeholder="Enter transaction description"
                />
                <FormErrorMessage>{getFieldError('description')}</FormErrorMessage>
              </FormControl>

              {/* Transaction Type Field */}
              <FormControl isInvalid={isFieldInvalid('transactionType')}>
                <FormLabel>Transaction Type</FormLabel>
                <Select {...formik.getFieldProps('transactionType')}>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Adjustment">Adjustment</option>
                </Select>
                <FormErrorMessage>{getFieldError('transactionType')}</FormErrorMessage>
              </FormControl>

              {/* Category Field */}
              <FormControl isInvalid={isFieldInvalid('category')}>
                <FormLabel>Category</FormLabel>
                <Select {...formik.getFieldProps('category')}>
                  <option value="">Select a category</option>
                  {filteredCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{getFieldError('category')}</FormErrorMessage>
              </FormControl>

              {/* Account Field */}
              <FormControl isInvalid={isFieldInvalid('accountId')}>
                <FormLabel>Account</FormLabel>
                <HStack>
                  <Select {...formik.getFieldProps('accountId')} flex={1}>
                    <option value="">Select an account</option>
                    {filteredAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </Select>
                  <Button
                    size="sm"
                    leftIcon={<AddIcon />}
                    onClick={() => setShowAddAccount(true)}
                  >
                    Add Account
                  </Button>
                </HStack>
                <FormErrorMessage>{getFieldError('accountId')}</FormErrorMessage>
              </FormControl>

              {/* Add Account Form */}
              {showAddAccount && (
                <Box p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <Text fontWeight="bold" mb={3}>Add New Account</Text>
                  <VStack spacing={3}>
                    <FormControl>
                      <FormLabel>Account Name</FormLabel>
                      <Input
                        value={newAccount.name}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter account name"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Account Code</FormLabel>
                      <Input
                        value={newAccount.code}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="Enter account code"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Account Type</FormLabel>
                      <Select
                        value={newAccount.type}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="">Select account type</option>
                        <option value="ASSET">Asset</option>
                        <option value="LIABILITY">Liability</option>
                        <option value="EQUITY">Equity</option>
                        <option value="REVENUE">Revenue</option>
                        <option value="EXPENSE">Expense</option>
                      </Select>
                    </FormControl>
                    <HStack>
                      <Button size="sm" onClick={handleAddAccount} colorScheme="blue">
                        Save Account
                      </Button>
                      <Button size="sm" onClick={() => setShowAddAccount(false)}>
                        Cancel
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              )}

              {/* Person/Entity Field */}
              <FormControl isInvalid={isFieldInvalid('personEntity')}>
                <FormLabel>Person/Entity</FormLabel>
                <Input
                  {...formik.getFieldProps('personEntity')}
                  placeholder="Enter person or entity name"
                />
                <FormErrorMessage>{getFieldError('personEntity')}</FormErrorMessage>
              </FormControl>

              {/* Payment Method Field */}
              <FormControl isInvalid={isFieldInvalid('paymentMethod')}>
                <FormLabel>Payment Method</FormLabel>
                <Select {...formik.getFieldProps('paymentMethod')}>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                  <option value="Digital Payment">Digital Payment</option>
                </Select>
                <FormErrorMessage>{getFieldError('paymentMethod')}</FormErrorMessage>
              </FormControl>

              {/* Reference Number Field */}
              <FormControl isInvalid={isFieldInvalid('referenceNumber')}>
                <FormLabel>Reference Number</FormLabel>
                <Input
                  {...formik.getFieldProps('referenceNumber')}
                  placeholder="Enter reference number"
                />
                <FormErrorMessage>{getFieldError('referenceNumber')}</FormErrorMessage>
              </FormControl>

              {/* Notes Field */}
              <FormControl isInvalid={isFieldInvalid('notes')}>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  {...formik.getFieldProps('notes')}
                  placeholder="Enter additional notes"
                  rows={3}
                />
                <FormErrorMessage>{getFieldError('notes')}</FormErrorMessage>
              </FormControl>

              {/* File Attachments */}
              <FormControl>
                <FormLabel>Attachments</FormLabel>
                <Input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                <FormHelperText>Upload supporting documents (PDF, images, documents)</FormHelperText>
              </FormControl>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <Box>
                  <Text fontWeight="bold" mb={2}>Uploaded Files:</Text>
                  <VStack spacing={2} align="stretch">
                    {attachments.map((file, index) => (
                      <Flex key={index} justify="space-between" align="center" p={2} bg="gray.50" borderRadius="md">
                        <Text fontSize="sm">{file.name}</Text>
                        <IconButton
                          size="sm"
                          icon={<CloseIcon />}
                          onClick={() => removeAttachment(index)}
                          aria-label={`Remove ${file.name}`}
                        />
                      </Flex>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </form>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={closeModal}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={formik.handleSubmit}
            isLoading={submitting}
            loadingText="Saving..."
          >
            {selectedTransaction ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GlobalTransactionModal; 