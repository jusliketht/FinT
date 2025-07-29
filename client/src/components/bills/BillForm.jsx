import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  Text,
  useToast,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import billService from '../../services/billService';
import { useBusiness } from '../../contexts/BusinessContext';

const BillForm = ({ bill, onSuccess, onCancel }) => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const validationSchema = Yup.object({
    vendorName: Yup.string().required('Vendor name is required'),
    vendorEmail: Yup.string().email('Invalid email format'),
    vendorPhone: Yup.string(),
    vendorAddress: Yup.string(),
    dueDate: Yup.date().required('Due date is required'),
    notes: Yup.string(),
    items: Yup.array().of(
      Yup.object({
        description: Yup.string().required('Description is required'),
        quantity: Yup.number().positive('Quantity must be positive').required('Quantity is required'),
        unitPrice: Yup.number().positive('Unit price must be positive').required('Unit price is required'),
        taxRate: Yup.number().min(0, 'Tax rate cannot be negative'),
      })
    ).min(1, 'At least one item is required'),
  });

  const formik = useFormik({
    initialValues: {
      vendorName: bill?.vendorName || '',
      vendorEmail: bill?.vendorEmail || '',
      vendorPhone: bill?.vendorPhone || '',
      vendorAddress: bill?.vendorAddress || '',
      dueDate: bill?.dueDate ? new Date(bill.dueDate).toISOString().split('T')[0] : '',
      notes: bill?.notes || '',
      items: bill?.BillItems?.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate || 0,
      })) || [{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }],
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        if (bill) {
          await billService.update(bill.id, values);
        } else {
          await billService.create(values);
        }
        onSuccess();
      } catch (error) {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to save bill',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  const addItem = () => {
    formik.setFieldValue('items', [
      ...formik.values.items,
      { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }
    ]);
  };

  const removeItem = (index) => {
    if (formik.values.items.length > 1) {
      const newItems = formik.values.items.filter((_, i) => i !== index);
      formik.setFieldValue('items', newItems);
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formik.values.items];
    newItems[index] = { ...newItems[index], [field]: value };
    formik.setFieldValue('items', newItems);
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = subtotal * (item.taxRate / 100);
    return subtotal + taxAmount;
  };

  const calculateTotal = () => {
    return formik.values.items.reduce((total, item) => {
      return total + calculateItemTotal(item);
    }, 0);
  };

  return (
    <Box as="form" onSubmit={formik.handleSubmit}>
      <VStack spacing={6} align="stretch">
        {/* Vendor Information */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Vendor Information
          </Text>
          <VStack spacing={4}>
            <FormControl isInvalid={formik.touched.vendorName && formik.errors.vendorName}>
              <FormLabel>Vendor Name *</FormLabel>
              <Input
                {...formik.getFieldProps('vendorName')}
                placeholder="Enter vendor name"
              />
              <FormErrorMessage>{formik.errors.vendorName}</FormErrorMessage>
            </FormControl>

            <HStack spacing={4} w="full">
              <FormControl isInvalid={formik.touched.vendorEmail && formik.errors.vendorEmail}>
                <FormLabel>Email</FormLabel>
                <Input
                  {...formik.getFieldProps('vendorEmail')}
                  type="email"
                  placeholder="vendor@example.com"
                />
                <FormErrorMessage>{formik.errors.vendorEmail}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.vendorPhone && formik.errors.vendorPhone}>
                <FormLabel>Phone</FormLabel>
                <Input
                  {...formik.getFieldProps('vendorPhone')}
                  placeholder="+1234567890"
                />
                <FormErrorMessage>{formik.errors.vendorPhone}</FormErrorMessage>
              </FormControl>
            </HStack>

            <FormControl isInvalid={formik.touched.vendorAddress && formik.errors.vendorAddress}>
              <FormLabel>Address</FormLabel>
              <Textarea
                {...formik.getFieldProps('vendorAddress')}
                placeholder="Enter vendor address"
                rows={3}
              />
              <FormErrorMessage>{formik.errors.vendorAddress}</FormErrorMessage>
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Bill Details */}
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={4}>
            Bill Details
          </Text>
          <VStack spacing={4}>
            <FormControl isInvalid={formik.touched.dueDate && formik.errors.dueDate}>
              <FormLabel>Due Date *</FormLabel>
              <Input
                {...formik.getFieldProps('dueDate')}
                type="date"
              />
              <FormErrorMessage>{formik.errors.dueDate}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={formik.touched.notes && formik.errors.notes}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                {...formik.getFieldProps('notes')}
                placeholder="Additional notes..."
                rows={3}
              />
              <FormErrorMessage>{formik.errors.notes}</FormErrorMessage>
            </FormControl>
          </VStack>
        </Box>

        <Divider />

        {/* Bill Items */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              Bill Items
            </Text>
            <Button
              size="sm"
              leftIcon={<AddIcon />}
              onClick={addItem}
              colorScheme="blue"
            >
              Add Item
            </Button>
          </HStack>

          <VStack spacing={4}>
            {formik.values.items.map((item, index) => (
              <Box
                key={index}
                p={4}
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                w="full"
              >
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight="medium">Item {index + 1}</Text>
                  {formik.values.items.length > 1 && (
                    <IconButton
                      size="sm"
                      icon={<CloseIcon />}
                      onClick={() => removeItem(index)}
                      colorScheme="red"
                      variant="ghost"
                    />
                  )}
                </HStack>

                <VStack spacing={3}>
                  <FormControl>
                    <FormLabel>Description *</FormLabel>
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </FormControl>

                  <HStack spacing={4} w="full">
                    <FormControl>
                      <FormLabel>Quantity *</FormLabel>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) => updateItem(index, 'quantity', parseFloat(value) || 0)}
                        min={0}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Unit Price *</FormLabel>
                      <NumberInput
                        value={item.unitPrice}
                        onChange={(value) => updateItem(index, 'unitPrice', parseFloat(value) || 0)}
                        min={0}
                        precision={2}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <NumberInput
                        value={item.taxRate}
                        onChange={(value) => updateItem(index, 'taxRate', parseFloat(value) || 0)}
                        min={0}
                        max={100}
                        precision={2}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <HStack justify="space-between" w="full">
                    <Text fontSize="sm" color="gray.600">
                      Subtotal: ₹{(item.quantity * item.unitPrice).toFixed(2)}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Tax: ₹{((item.quantity * item.unitPrice) * (item.taxRate / 100)).toFixed(2)}
                    </Text>
                    <Text fontWeight="bold">
                      Total: ₹{calculateItemTotal(item).toFixed(2)}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>

        <Divider />

        {/* Total */}
        <Box textAlign="right">
          <Text fontSize="xl" fontWeight="bold">
            Total Amount: ₹{calculateTotal().toFixed(2)}
          </Text>
        </Box>

        {/* Form Errors */}
        {formik.errors.items && (
          <Text color="red.500" fontSize="sm">
            {formik.errors.items}
          </Text>
        )}

        {/* Actions */}
        <HStack justify="flex-end" spacing={4}>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={submitting}
            loadingText="Saving..."
          >
            {bill ? 'Update Bill' : 'Create Bill'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default BillForm; 