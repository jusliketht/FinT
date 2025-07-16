import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
  Grid,
  GridItem,
  useToast,
  Spinner
} from '@chakra-ui/react';
import businessService from '../../services/businessService';

const BusinessForm = ({ business, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    registrationNumber: '',
    description: '',
    incorporationDate: '',
    fiscalYearStart: '',
    fiscalYearEnd: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    taxId: '',
    phone: '',
    email: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        type: business.type || '',
        registrationNumber: business.registrationNumber || '',
        description: business.description || '',
        incorporationDate: business.incorporationDate ? business.incorporationDate.split('T')[0] : '',
        fiscalYearStart: business.fiscalYearStart ? business.fiscalYearStart.split('T')[0] : '',
        fiscalYearEnd: business.fiscalYearEnd ? business.fiscalYearEnd.split('T')[0] : '',
        address: business.address || '',
        city: business.city || '',
        state: business.state || '',
        postalCode: business.postalCode || '',
        country: business.country || '',
        taxId: business.taxId || '',
        phone: business.phone || '',
        email: business.email || '',
        website: business.website || ''
      });
    }
  }, [business]);

  const businessTypes = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'llc', label: 'Limited Liability Company (LLC)' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Business type is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Please enter a valid URL starting with http:// or https://';
    }

    if (formData.fiscalYearStart && formData.fiscalYearEnd) {
      const start = new Date(formData.fiscalYearStart);
      const end = new Date(formData.fiscalYearEnd);
      if (start >= end) {
        newErrors.fiscalYearEnd = 'End date must be after start date';
      }
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
      if (business) {
        await businessService.update(business.id, formData);
      } else {
        await businessService.create(formData);
      }
      onSuccess();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to save business';
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
      <VStack spacing={6} align="stretch">
        {/* Basic Information */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem colSpan={2}>
            <FormControl isRequired isInvalid={!!errors.name}>
              <FormLabel>Business Name</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter business name"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <FormControl isRequired isInvalid={!!errors.type}>
            <FormLabel>Business Type</FormLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="Select business type"
            >
              {businessTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
            <FormErrorMessage>{errors.type}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.registrationNumber}>
            <FormLabel>Registration Number</FormLabel>
            <Input
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              placeholder="Enter registration number"
            />
            <FormErrorMessage>{errors.registrationNumber}</FormErrorMessage>
          </FormControl>
        </Grid>

        {/* Description */}
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter business description"
            rows={3}
          />
        </FormControl>

        {/* Dates */}
        <Grid templateColumns="repeat(3, 1fr)" gap={4}>
          <FormControl>
            <FormLabel>Incorporation Date</FormLabel>
            <Input
              name="incorporationDate"
              type="date"
              value={formData.incorporationDate}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Fiscal Year Start</FormLabel>
            <Input
              name="fiscalYearStart"
              type="date"
              value={formData.fiscalYearStart}
              onChange={handleInputChange}
            />
          </FormControl>

          <FormControl isInvalid={!!errors.fiscalYearEnd}>
            <FormLabel>Fiscal Year End</FormLabel>
            <Input
              name="fiscalYearEnd"
              type="date"
              value={formData.fiscalYearEnd}
              onChange={handleInputChange}
            />
            <FormErrorMessage>{errors.fiscalYearEnd}</FormErrorMessage>
          </FormControl>
        </Grid>

        {/* Address */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel>Address</FormLabel>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter street address"
              />
            </FormControl>
          </GridItem>

          <FormControl>
            <FormLabel>City</FormLabel>
            <Input
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter city"
            />
          </FormControl>

          <FormControl>
            <FormLabel>State/Province</FormLabel>
            <Input
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              placeholder="Enter state or province"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Postal Code</FormLabel>
            <Input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Enter postal code"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Country</FormLabel>
            <Input
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              placeholder="Enter country"
            />
          </FormControl>
        </Grid>

        {/* Contact Information */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <FormControl>
            <FormLabel>Tax ID</FormLabel>
            <Input
              name="taxId"
              value={formData.taxId}
              onChange={handleInputChange}
              placeholder="Enter tax identification number"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Phone</FormLabel>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </FormControl>

          <FormControl isInvalid={!!errors.email}>
            <FormLabel>Email</FormLabel>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.website}>
            <FormLabel>Website</FormLabel>
            <Input
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
            />
            <FormErrorMessage>{errors.website}</FormErrorMessage>
          </FormControl>
        </Grid>

        {/* Action Buttons */}
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
            {business ? 'Update Business' : 'Create Business'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default BusinessForm; 