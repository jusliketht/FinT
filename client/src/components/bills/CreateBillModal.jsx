import React, { useState } from 'react';
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
  FormErrorMessage,
  Input,
  Textarea,
  Grid,
  GridItem,
  Text,
  IconButton,
  Box,
  Divider,
  VStack,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';

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
      taxRate: Yup.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%'),
    })
  ).min(1, 'At least one item is required'),
});

const CreateBillModal = ({ isOpen, onClose, onSubmit }) => {
  const toast = useToast();
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }
  ]);

  const formik = useFormik({
    initialValues: {
      vendorName: '',
      vendorEmail: '',
      vendorPhone: '',
      vendorAddress: '',
      dueDate: '',
      notes: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const billData = {
        ...values,
        items: items.filter(item => item.description && item.quantity > 0 && item.unitPrice > 0),
      };
      onSubmit(billData);
    },
  });

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  };

  const calculateTaxAmount = () => {
    return items.reduce((total, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return total + (itemTotal * (item.taxRate || 0) / 100);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount();
  };

  const handleSubmit = () => {
    if (items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all item details correctly',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    formik.handleSubmit();
  };

  const resetForm = () => {
    formik.resetForm();
    setItems([{ description: '', quantity: 1, unitPrice: 0, taxRate: 0 }]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create New Bill</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Vendor Information */}
            <Box>
              <Text fontWeight="bold" mb={3}>Vendor Information</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem colSpan={2}>
                  <FormControl isInvalid={formik.touched.vendorName && formik.errors.vendorName}>
                    <FormLabel>Vendor Name *</FormLabel>
                    <Input
                      name="vendorName"
                      value={formik.values.vendorName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Enter vendor name"
                    />
                  </FormControl>
                </GridItem>
                <FormControl isInvalid={formik.touched.vendorEmail && formik.errors.vendorEmail}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="vendorEmail"
                    type="email"
                    value={formik.values.vendorEmail}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="vendor@example.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    name="vendorPhone"
                    value={formik.values.vendorPhone}
                    onChange={formik.handleChange}
                    placeholder="+91 98765 43210"
                  />
                </FormControl>
                <GridItem colSpan={2}>
                  <FormControl>
                    <FormLabel>Address</FormLabel>
                    <Textarea
                      name="vendorAddress"
                      value={formik.values.vendorAddress}
                      onChange={formik.handleChange}
                      placeholder="Enter vendor address"
                      rows={2}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Bill Details */}
            <Box>
              <Text fontWeight="bold" mb={3}>Bill Details</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl isInvalid={formik.touched.dueDate && formik.errors.dueDate}>
                  <FormLabel>Due Date *</FormLabel>
                  <Input
                    name="dueDate"
                    type="date"
                    value={formik.values.dueDate}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea
                    name="notes"
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </FormControl>
              </Grid>
            </Box>

            <Divider />

            {/* Bill Items */}
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontWeight="bold">Bill Items</Text>
                <Button size="sm" leftIcon={<AddIcon />} onClick={addItem}>
                  Add Item
                </Button>
              </HStack>
              
              <VStack spacing={3} align="stretch">
                {items.map((item, index) => (
                  <Box key={index} p={3} border="1px" borderColor="gray.200" borderRadius="md">
                    <Grid templateColumns="2fr 1fr 1fr 1fr auto" gap={3} alignItems="end">
                      <FormControl>
                        <FormLabel fontSize="sm">Description</FormLabel>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          size="sm"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Qty</FormLabel>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          size="sm"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Unit Price</FormLabel>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          size="sm"
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Tax %</FormLabel>
                        <Input
                          type="number"
                          value={item.taxRate}
                          onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                          min="0"
                          max="100"
                          step="0.01"
                          size="sm"
                        />
                      </FormControl>
                      <IconButton
                        size="sm"
                        icon={<DeleteIcon />}
                        onClick={() => removeItem(index)}
                        colorScheme="red"
                        variant="ghost"
                        isDisabled={items.length === 1}
                      />
                    </Grid>
                    <Text fontSize="sm" color="gray.600" mt={2}>
                      Total: ₹{((item.quantity * item.unitPrice) * (1 + (item.taxRate || 0) / 100)).toFixed(2)}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </Box>

            <Divider />

            {/* Totals */}
            <Box>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text>Subtotal:</Text>
                  <Text fontWeight="bold">₹{calculateSubtotal().toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Tax Amount:</Text>
                  <Text fontWeight="bold">₹{calculateTaxAmount().toFixed(2)}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">Total:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    ₹{calculateTotal().toFixed(2)}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Create Bill
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateBillModal; 