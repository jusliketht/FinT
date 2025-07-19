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
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { invoiceService } from '../../services/invoiceService';
import { useBusiness } from '../../contexts/BusinessContext';

const InvoiceForm = ({ isOpen, onClose, invoice, onSubmit }) => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    issueDate: '',
    dueDate: '',
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    notes: '',
    terms: '',
  });

  useEffect(() => {
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber || '',
        customerId: invoice.customerId || '',
        issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : '',
        dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
        subtotal: invoice.subtotal || 0,
        taxAmount: invoice.taxAmount || 0,
        discountAmount: invoice.discountAmount || 0,
        totalAmount: invoice.totalAmount || 0,
        notes: invoice.notes || '',
        terms: invoice.terms || '',
      });
    } else {
      setFormData({
        invoiceNumber: '',
        customerId: '',
        issueDate: '',
        dueDate: '',
        subtotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        notes: '',
        terms: '',
      });
    }
  }, [invoice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      onSubmit();
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            {invoice ? 'Edit Invoice' : 'Create Invoice'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} width="100%">
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
                    {/* Customer options would be populated from API */}
                    <option value="customer1">Customer 1</option>
                    <option value="customer2">Customer 2</option>
                  </Select>
                </FormControl>
              </HStack>

              <HStack spacing={4} width="100%">
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

              <HStack spacing={4} width="100%">
                <FormControl>
                  <FormLabel>Subtotal</FormLabel>
                  <NumberInput
                    value={formData.subtotal}
                    onChange={(value) => handleInputChange('subtotal', parseFloat(value) || 0)}
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
                  <FormLabel>Tax Amount</FormLabel>
                  <NumberInput
                    value={formData.taxAmount}
                    onChange={(value) => handleInputChange('taxAmount', parseFloat(value) || 0)}
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
                  <FormLabel>Discount</FormLabel>
                  <NumberInput
                    value={formData.discountAmount}
                    onChange={(value) => handleInputChange('discountAmount', parseFloat(value) || 0)}
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Input
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes..."
                />
              </FormControl>

              <FormControl>
                <FormLabel>Terms</FormLabel>
                <Input
                  value={formData.terms}
                  onChange={(e) => handleInputChange('terms', e.target.value)}
                  placeholder="Payment terms..."
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={loading}
              loadingText="Saving..."
            >
              {invoice ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceForm; 