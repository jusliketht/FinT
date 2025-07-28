import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  HStack,
  IconButton,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { invoiceService } from '../../services/invoiceService';
import { useBusiness } from '../../contexts/BusinessContext';

const InvoiceForm = ({ isOpen, onClose, invoice, onSuccess }) => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    issueDate: '',
    dueDate: '',
    paymentTerms: '30',
    subtotal: 0,
    taxRate: 18,
    taxAmount: 0,
    discountRate: 0,
    discountAmount: 0,
    totalAmount: 0,
    notes: '',
    terms: '',
  });

  const [lineItems, setLineItems] = useState([
    { id: 1, description: '', quantity: 1, rate: 0, amount: 0 }
  ]);

  // Sample customers
  const customers = [
    { id: 1, name: 'Acme Corp', email: 'contact@acme.com' },
    { id: 2, name: 'Tech Solutions', email: 'info@techsolutions.com' },
    { id: 3, name: 'Global Industries', email: 'sales@global.com' },
  ];

  // Sample products/services
  const products = [
    { id: 1, name: 'Web Development', rate: 100 },
    { id: 2, name: 'Consulting Services', rate: 150 },
    { id: 3, name: 'Software License', rate: 500 },
    { id: 4, name: 'Maintenance Support', rate: 75 },
  ];

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        customerId: invoice.customerId || '',
        issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        paymentTerms: invoice.paymentTerms || '30',
        subtotal: invoice.subtotal || 0,
        taxRate: invoice.taxRate || 18,
        taxAmount: invoice.taxAmount || 0,
        discountRate: invoice.discountRate || 0,
        discountAmount: invoice.discountAmount || 0,
        totalAmount: invoice.totalAmount || 0,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
      });
    } else {
      setFormData({
        invoiceNumber: '',
        customerId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        paymentTerms: '30',
        subtotal: 0,
        taxRate: 18,
        taxAmount: 0,
        discountRate: 0,
        discountAmount: 0,
        totalAmount: 0,
        notes: '',
        terms: '',
      });
      setLineItems([{ id: 1, description: '', quantity: 1, rate: 0, amount: 0 }]);
    }
  }, [invoice, isOpen]);

  const handleSubmit = async () => {
    if (!selectedBusiness) {
      toast({
        title: 'Error',
        description: 'Please select a business first',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        lineItems,
        businessId: selectedBusiness.id,
      };

      if (invoice) {
        await invoiceService.update(invoice.id, data);
        toast({
          title: 'Success',
          description: 'Invoice updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await invoiceService.create(data);
        toast({
          title: 'Success',
          description: 'Invoice created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save invoice',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addLineItem = () => {
    const newId = Math.max(...lineItems.map(item => item.id)) + 1;
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, rate: 0, amount: 0 }]);
  };

  const removeLineItem = (id) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id, field, value) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const selectProduct = (id, productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      updateLineItem(id, 'description', product.name);
      updateLineItem(id, 'rate', product.rate);
    }
  };

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = (subtotal * formData.taxRate) / 100;
  const discountAmount = (subtotal * formData.discountRate) / 100;
  const totalAmount = subtotal + taxAmount - discountAmount;

  // Update form data when calculations change
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      discountAmount,
      totalAmount,
    }));
  }, [subtotal, taxAmount, discountAmount, totalAmount]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {invoice ? 'Edit Invoice' : 'Create Invoice'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Invoice Header */}
            <HStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Invoice Number</FormLabel>
                <Input
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                  placeholder="INV-001"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Customer</FormLabel>
                <Select
                  value={formData.customerId}
                  onChange={(e) => handleInputChange('customerId', e.target.value)}
                  placeholder="Select customer"
                >
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Payment Terms</FormLabel>
                <Select
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                >
                  <option value="0">Due on receipt</option>
                  <option value="7">Net 7 days</option>
                  <option value="15">Net 15 days</option>
                  <option value="30">Net 30 days</option>
                  <option value="45">Net 45 days</option>
                  <option value="60">Net 60 days</option>
                </Select>
              </FormControl>
            </HStack>

            <HStack spacing={6}>
              <FormControl isRequired>
                <FormLabel>Issue Date</FormLabel>
                <Input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Due Date</FormLabel>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                />
              </FormControl>
            </HStack>

            {/* Line Items */}
            <Box>
              <HStack justify="space-between" mb={4}>
                <Text fontWeight="medium">Line Items</Text>
                <Button
                  leftIcon={<AddIcon />}
                  size="sm"
                  onClick={addLineItem}
                >
                  Add Item
                </Button>
              </HStack>

              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Description</Th>
                    <Th>Quantity</Th>
                    <Th>Rate</Th>
                    <Th>Amount</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {lineItems.map((item) => (
                    <Tr key={item.id}>
                      <Td>
                        <Select
                          placeholder="Select product/service"
                          value=""
                          onChange={(e) => selectProduct(item.id, e.target.value)}
                          size="sm"
                        >
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name}
                            </option>
                          ))}
                        </Select>
                        <Input
                          mt={2}
                          placeholder="Or enter description"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          size="sm"
                        />
                      </Td>
                      <Td>
                        <NumberInput
                          value={item.quantity}
                          onChange={(value) => updateLineItem(item.id, 'quantity', parseInt(value) || 0)}
                          min={1}
                          size="sm"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Td>
                      <Td>
                        <NumberInput
                          value={item.rate}
                          onChange={(value) => updateLineItem(item.id, 'rate', parseFloat(value) || 0)}
                          min={0}
                          size="sm"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Td>
                      <Td>
                        <Text fontFamily="mono" fontWeight="medium">
                          {formatCurrency(item.amount)}
                        </Text>
                      </Td>
                      <Td>
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => removeLineItem(item.id)}
                          isDisabled={lineItems.length === 1}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Totals */}
            <Box>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text>Subtotal:</Text>
                  <Text fontFamily="mono" fontWeight="medium">
                    {formatCurrency(subtotal)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Tax ({formData.taxRate}%):</Text>
                  <Text fontFamily="mono" fontWeight="medium">
                    {formatCurrency(taxAmount)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Discount ({formData.discountRate}%):</Text>
                  <Text fontFamily="mono" fontWeight="medium" color="red.500">
                    -{formatCurrency(discountAmount)}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontWeight="bold">Total:</Text>
                  <Text fontFamily="mono" fontWeight="bold" fontSize="lg">
                    {formatCurrency(totalAmount)}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Notes and Terms */}
            <HStack spacing={6}>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes for the customer..."
                  rows={3}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Terms & Conditions</FormLabel>
                <Textarea
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  placeholder="Payment terms and conditions..."
                  rows={3}
                />
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
              loadingText="Saving..."
            >
              {invoice ? 'Update Invoice' : 'Create Invoice'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceForm; 