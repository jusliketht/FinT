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
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from '@chakra-ui/react';
import { customerService } from '../../services/customerService';
import { useBusiness } from '../../contexts/BusinessContext';

const CustomerForm = ({ isOpen, onClose, customer, onSubmit }) => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxId: '',
    creditLimit: '',
    paymentTerms: 30,
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        postalCode: customer.postalCode || '',
        country: customer.country || '',
        taxId: customer.taxId || '',
        creditLimit: customer.creditLimit || '',
        paymentTerms: customer.paymentTerms || 30,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        taxId: '',
        creditLimit: '',
        paymentTerms: 30,
      });
    }
  }, [customer]);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Customer name is required',
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
        businessId: selectedBusiness?.id,
        creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
        paymentTerms: parseInt(formData.paymentTerms),
      };

      if (customer) {
        await customerService.update(customer.id, data);
        toast({
          title: 'Success',
          description: 'Customer updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await customerService.create(data);
        toast({
          title: 'Success',
          description: 'Customer created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      onSubmit();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to save customer',
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
      [field]: value,
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {customer ? 'Edit Customer' : 'Add New Customer'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Customer name"
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Email address"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Phone</FormLabel>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Address</FormLabel>
              <Textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Full address"
                rows={3}
              />
            </FormControl>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>City</FormLabel>
                <Input
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                />
              </FormControl>

              <FormControl>
                <FormLabel>State</FormLabel>
                <Input
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State"
                />
              </FormControl>
            </HStack>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>Postal Code</FormLabel>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="Postal code"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Country</FormLabel>
                <Input
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Country"
                />
              </FormControl>
            </HStack>

            <HStack spacing={4} width="100%">
              <FormControl>
                <FormLabel>Tax ID</FormLabel>
                <Input
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder="Tax ID/GST number"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Credit Limit</FormLabel>
                <NumberInput
                  value={formData.creditLimit}
                  onChange={(value) => handleInputChange('creditLimit', value)}
                  min={0}
                >
                  <NumberInputField placeholder="Credit limit" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>Payment Terms (days)</FormLabel>
              <NumberInput
                value={formData.paymentTerms}
                onChange={(value) => handleInputChange('paymentTerms', value)}
                min={0}
                max={365}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Saving"
          >
            {customer ? 'Update' : 'Create'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerForm; 