import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  Input,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  Text,
  Badge,
  useColorModeValue,
  Grid,
  GridItem,
  Box,
  Divider,
  Select,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useApi } from '../../hooks/useApi';

const BusinessRegistrationForm = ({ business, onSubmit, loading }) => {
  const toast = useToast();
  const api = useApi();

  const validationSchema = Yup.object({
    businessName: Yup.string()
      .min(2, 'Business name must be at least 2 characters')
      .max(100, 'Business name must be less than 100 characters')
      .required('Business name is required'),
    panNumber: Yup.string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)')
      .required('PAN number is required'),
    gstNumber: Yup.string()
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST format')
      .required('GST number is required'),
    businessAddress: Yup.string()
      .min(10, 'Address must be at least 10 characters')
      .max(200, 'Address must be less than 200 characters')
      .required('Business address is required'),
    businessPhone: Yup.string()
      .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number')
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number must be less than 15 digits')
      .required('Business phone is required'),
    businessEmail: Yup.string()
      .email('Invalid email address')
      .required('Business email is required'),
    registrationDate: Yup.date()
      .max(new Date(), 'Registration date cannot be in the future')
      .required('Registration date is required'),
    businessType: Yup.string()
      .oneOf(['Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited', 'Public Limited', 'Other'])
      .required('Business type is required'),
  });

  const formik = useFormik({
    initialValues: {
      businessName: business?.name || '',
      panNumber: business?.panNumber || '',
      gstNumber: business?.gstNumber || '',
      businessAddress: business?.address || '',
      businessPhone: business?.phone || '',
      businessEmail: business?.email || '',
      registrationDate: business?.registrationDate ? new Date(business.registrationDate).toISOString().split('T')[0] : '',
      businessType: business?.businessType || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        toast({
          title: 'Business Details Updated',
          description: 'Business registration details have been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Update Failed',
          description: error.message || 'Failed to update business details.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <VStack spacing={6} align="stretch">
      {/* Business Status */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Business Registration Status</AlertTitle>
          <AlertDescription>
            <HStack spacing={4} mt={2}>
              <Badge colorScheme="green" variant="subtle">
                Active Registration
              </Badge>
              <Badge colorScheme="blue" variant="subtle">
                GST: Verified
              </Badge>
              <Badge colorScheme="purple" variant="subtle">
                PAN: Verified
              </Badge>
            </HStack>
          </AlertDescription>
        </Box>
      </Alert>

      {/* Registration Form */}
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={6} align="stretch">
          {/* Basic Business Information */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Basic Business Information
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem colSpan={2}>
                <FormControl isInvalid={formik.touched.businessName && formik.errors.businessName}>
                  <FormLabel>Business Name</FormLabel>
                  <Input
                    id="businessName"
                    name="businessName"
                    type="text"
                    placeholder="Enter your business name"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.businessName}
                  />
                  <FormErrorMessage>{formik.errors.businessName}</FormErrorMessage>
                </FormControl>
              </GridItem>

              <FormControl isInvalid={formik.touched.businessType && formik.errors.businessType}>
                <FormLabel>Business Type</FormLabel>
                <Select
                  id="businessType"
                  name="businessType"
                  placeholder="Select business type"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.businessType}
                >
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                  <option value="Partnership">Partnership</option>
                  <option value="LLP">LLP</option>
                  <option value="Private Limited">Private Limited</option>
                  <option value="Public Limited">Public Limited</option>
                  <option value="Other">Other</option>
                </Select>
                <FormErrorMessage>{formik.errors.businessType}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.registrationDate && formik.errors.registrationDate}>
                <FormLabel>Registration Date</FormLabel>
                <Input
                  id="registrationDate"
                  name="registrationDate"
                  type="date"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.registrationDate}
                />
                <FormErrorMessage>{formik.errors.registrationDate}</FormErrorMessage>
              </FormControl>
            </Grid>
          </Box>

          <Divider />

          {/* Tax Registration Information */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Tax Registration Information
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isInvalid={formik.touched.panNumber && formik.errors.panNumber}>
                <FormLabel>PAN Number</FormLabel>
                <Input
                  id="panNumber"
                  name="panNumber"
                  type="text"
                  placeholder="ABCDE1234F"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.panNumber}
                  textTransform="uppercase"
                />
                <FormHelperText>Format: ABCDE1234F</FormHelperText>
                <FormErrorMessage>{formik.errors.panNumber}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.gstNumber && formik.errors.gstNumber}>
                <FormLabel>GST Number</FormLabel>
                <Input
                  id="gstNumber"
                  name="gstNumber"
                  type="text"
                  placeholder="22AAAAA0000A1Z5"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.gstNumber}
                  textTransform="uppercase"
                />
                <FormHelperText>Format: 22AAAAA0000A1Z5</FormHelperText>
                <FormErrorMessage>{formik.errors.gstNumber}</FormErrorMessage>
              </FormControl>
            </Grid>
          </Box>

          <Divider />

          {/* Contact Information */}
          <Box>
            <Text fontSize="lg" fontWeight="semibold" mb={4}>
              Contact Information
            </Text>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl isInvalid={formik.touched.businessEmail && formik.errors.businessEmail}>
                <FormLabel>Business Email</FormLabel>
                <Input
                  id="businessEmail"
                  name="businessEmail"
                  type="email"
                  placeholder="business@example.com"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.businessEmail}
                />
                <FormErrorMessage>{formik.errors.businessEmail}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={formik.touched.businessPhone && formik.errors.businessPhone}>
                <FormLabel>Business Phone</FormLabel>
                <Input
                  id="businessPhone"
                  name="businessPhone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.businessPhone}
                />
                <FormErrorMessage>{formik.errors.businessPhone}</FormErrorMessage>
              </FormControl>

              <GridItem colSpan={2}>
                <FormControl isInvalid={formik.touched.businessAddress && formik.errors.businessAddress}>
                  <FormLabel>Business Address</FormLabel>
                  <Input
                    id="businessAddress"
                    name="businessAddress"
                    type="text"
                    placeholder="Enter complete business address"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.businessAddress}
                  />
                  <FormHelperText>Complete address for tax and legal purposes</FormHelperText>
                  <FormErrorMessage>{formik.errors.businessAddress}</FormErrorMessage>
                </FormControl>
              </GridItem>
            </Grid>
          </Box>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={loading}
            loadingText="Updating..."
            w="full"
          >
            Update Business Details
          </Button>
        </VStack>
      </form>
    </VStack>
  );
};

export default BusinessRegistrationForm; 