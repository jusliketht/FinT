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
  Box,
  Divider,
  IconButton,
  InputGroup,
  InputLeftElement,
  useDisclosure,
  Badge,
  Flex,
  Spinner,
} from '@chakra-ui/react';
import {
  AddIcon,
  CalendarIcon,
  InfoIcon,
  SearchIcon,
  AttachmentIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useApi } from '../../services/api';
import { useBusiness } from '../../contexts/BusinessContext';
import { useTransaction } from '../../contexts/TransactionContext';
import { LoadingSpinner } from '../common/LoadingStates';

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

  const resetForm = () => {
    formik.resetForm();
    setAttachments([]);
    setShowAddAccount(false);
    setNewAccount({ name: '', code: '', type: '', description: '' });
  };

  // Load accounts and categories
  useEffect(() => {
    if (isModalOpen) {
      loadFormData();
    }
  }, [isModalOpen, selectedBusiness]);

  const loadFormData = async () => {
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
  };

  // Filter categories by transaction type
  const filteredCategories = categories.filter(cat => 
    cat.type === formik.values.transactionType || cat.type === 'general'
  );

  // Filter accounts by transaction type
  const filteredAccounts = accounts.filter(acc => {
    if (formik.values.transactionType === 'Income') {
      return acc.type === 'REVENUE' || acc.type === 'ASSET';
    } else if (formik.values.transactionType === 'Expense') {
      return acc.type === 'EXPENSE' || acc.type === 'ASSET';
    } else if (formik.values.transactionType === 'Transfer') {
      return acc.type === 'ASSET';
    }
    return true;
  });

  const handleAmountChange = (value) => {
    formik.setFieldValue('amount', value);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddAccount = async () => {
    try {
      const accountData = {
        ...newAccount,
        businessId: selectedBusiness?.id || null,
      };
      
      const newAccountResponse = await api.post('/accounts', accountData, {}, {
        successMessage: 'Account created successfully',
        errorMessage: 'Failed to create account',
      });
      
      setAccounts(prev => [...prev, newAccountResponse]);
      formik.setFieldValue('accountId', newAccountResponse.id);
      setShowAddAccount(false);
      setNewAccount({ name: '', code: '', type: '', description: '' });
      
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const getFieldError = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  const isFieldInvalid = (fieldName) => {
    return formik.touched[fieldName] && formik.errors[fieldName];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

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
    <Modal isOpen={isModalOpen} onClose={closeModal} size="2xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={formik.handleSubmit}>
          <ModalHeader>
            <HStack spacing={3}>
              <AddIcon color="blue.500" />
              <Text>{selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Transaction Type Selection */}
              <FormControl isInvalid={isFieldInvalid('transactionType')}>
                <FormLabel>Transaction Type</FormLabel>
                <Select
                  name="transactionType"
                  value={formik.values.transactionType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Adjustment">Adjustment</option>
                </Select>
                <FormErrorMessage>{getFieldError('transactionType')}</FormErrorMessage>
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
                <FormLabel>Description/Narration</FormLabel>
                <Textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Enter detailed transaction description"
                  rows={3}
                />
                <FormHelperText>
                  {formik.values.description.length}/200 characters
                </FormHelperText>
                <FormErrorMessage>{getFieldError('description')}</FormErrorMessage>
              </FormControl>

              {/* Category and Account */}
              <HStack spacing={4}>
                <FormControl isInvalid={isFieldInvalid('category')} isRequired>
                  <FormLabel>Category/Account</FormLabel>
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
                      flex="1"
                    >
                      {filteredAccounts.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.name} ({account.code})
                        </option>
                      ))}
                    </Select>
                    <IconButton
                      aria-label="Add new account"
                      icon={<AddIcon />}
                      size="md"
                      variant="outline"
                      onClick={() => setShowAddAccount(true)}
                    />
                  </HStack>
                  <FormErrorMessage>{getFieldError('accountId')}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Person/Entity Tag */}
              <FormControl isInvalid={isFieldInvalid('personEntity')}>
                <FormLabel>Person/Entity Tag</FormLabel>
                <Input
                  name="personEntity"
                  value={formik.values.personEntity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Customer, vendor, employee, or other entity"
                />
                <FormHelperText>
                  Tag this transaction with a specific person or entity
                </FormHelperText>
                <FormErrorMessage>{getFieldError('personEntity')}</FormErrorMessage>
              </FormControl>

              {/* Payment Method and Reference */}
              <HStack spacing={4}>
                <FormControl isInvalid={isFieldInvalid('paymentMethod')} isRequired>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    name="paymentMethod"
                    value={formik.values.paymentMethod}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Other">Other</option>
                  </Select>
                  <FormErrorMessage>{getFieldError('paymentMethod')}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={isFieldInvalid('referenceNumber')}>
                  <FormLabel>Reference Number</FormLabel>
                  <Input
                    name="referenceNumber"
                    value={formik.values.referenceNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Invoice number, cheque number, etc."
                  />
                  <FormErrorMessage>{getFieldError('referenceNumber')}</FormErrorMessage>
                </FormControl>
              </HStack>

              {/* Attachments */}
              <FormControl>
                <FormLabel>Attachments</FormLabel>
                <VStack spacing={3} align="stretch">
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={handleFileUpload}
                    p={1}
                  />
                  <FormHelperText>
                    Upload receipts, invoices, or other supporting documents
                  </FormHelperText>
                  
                  {attachments.length > 0 && (
                    <VStack spacing={2} align="stretch">
                      <Text fontSize="sm" fontWeight="medium">Uploaded Files:</Text>
                      {attachments.map((file, index) => (
                        <Flex key={index} justify="space-between" align="center" p={2} bg="gray.50" borderRadius="md">
                          <HStack spacing={2}>
                            <AttachmentIcon />
                            <Text fontSize="sm">{file.name}</Text>
                            <Badge size="sm" variant="subtle">
                              {(file.size / 1024).toFixed(1)} KB
                            </Badge>
                          </HStack>
                          <IconButton
                            aria-label="Remove file"
                            icon={<CloseIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAttachment(index)}
                          />
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </VStack>
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

              {/* Add New Account Modal */}
              {showAddAccount && (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <AlertTitle>Add New Account</AlertTitle>
                    <AlertDescription>
                      <VStack spacing={3} mt={3}>
                        <HStack spacing={3}>
                          <Input
                            placeholder="Account Name"
                            value={newAccount.name}
                            onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                            size="sm"
                          />
                          <Input
                            placeholder="Account Code"
                            value={newAccount.code}
                            onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
                            size="sm"
                          />
                        </HStack>
                        <Select
                          placeholder="Account Type"
                          value={newAccount.type}
                          onChange={(e) => setNewAccount(prev => ({ ...prev, type: e.target.value }))}
                          size="sm"
                        >
                          <option value="ASSET">Asset</option>
                          <option value="LIABILITY">Liability</option>
                          <option value="EQUITY">Equity</option>
                          <option value="REVENUE">Revenue</option>
                          <option value="EXPENSE">Expense</option>
                        </Select>
                        <HStack spacing={2}>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={handleAddAccount}
                            isDisabled={!newAccount.name || !newAccount.code || !newAccount.type}
                          >
                            Add Account
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowAddAccount(false)}
                          >
                            Cancel
                          </Button>
                        </HStack>
                      </VStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}

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
                onClick={() => {
                  closeModal();
                  resetForm();
                }}
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
                {selectedTransaction ? 'Update Transaction' : 'Create Transaction'}
              </Button>
            </HStack>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default GlobalTransactionModal; 