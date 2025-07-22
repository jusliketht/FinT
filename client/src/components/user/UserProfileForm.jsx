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
  Box,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useApi } from '../../services/api';

const UserProfileForm = ({ user, onSubmit, loading }) => {
  const toast = useToast();
  const api = useApi();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .required('Name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    contactNumber: Yup.string()
      .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number')
      .min(10, 'Phone number must be at least 10 digits')
      .max(15, 'Phone number must be less than 15 digits'),
    pan: Yup.string()
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must be in format: ABCDE1234F')
      .max(10, 'PAN must be exactly 10 characters'),
    gstRegistrationNumber: Yup.string()
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'GST must be in format: 22AAAAA0000A1Z5')
      .max(15, 'GST must be exactly 15 characters'),
    address: Yup.string()
      .max(200, 'Address must be less than 200 characters'),
  });

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      contactNumber: user?.contactNumber || '',
      pan: user?.pan || '',
      gstRegistrationNumber: user?.gstRegistrationNumber || '',
      address: user?.address || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Update Failed',
          description: error.message || 'Failed to update profile.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <VStack spacing={6} align="stretch">
      {/* Account Status */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Account Status</AlertTitle>
          <AlertDescription>
            <HStack spacing={4} mt={2}>
              <Badge colorScheme="green" variant="subtle">
                Active
              </Badge>
              <Text fontSize="sm">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </HStack>
          </AlertDescription>
        </Box>
      </Alert>

      {/* Profile Form */}
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={formik.touched.name && formik.errors.name}>
            <FormLabel>Full Name</FormLabel>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your full name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
            />
            <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={formik.touched.email && formik.errors.email}>
            <FormLabel>Email Address</FormLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
            />
            <FormHelperText>This will be used for login and notifications</FormHelperText>
            <FormErrorMessage>{formik.errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={formik.touched.contactNumber && formik.errors.contactNumber}>
            <FormLabel>Contact Number</FormLabel>
            <Input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              placeholder="Enter your contact number"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.contactNumber}
            />
            <FormHelperText>Optional - for account recovery and notifications</FormHelperText>
            <FormErrorMessage>{formik.errors.contactNumber}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={formik.touched.pan && formik.errors.pan}>
            <FormLabel>PAN (Permanent Account Number)</FormLabel>
            <Input
              id="pan"
              name="pan"
              type="text"
              placeholder="ABCDE1234F"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.pan}
              textTransform="uppercase"
            />
            <FormHelperText>Optional - 10 character PAN in format ABCDE1234F</FormHelperText>
            <FormErrorMessage>{formik.errors.pan}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={formik.touched.gstRegistrationNumber && formik.errors.gstRegistrationNumber}>
            <FormLabel>GST Registration Number</FormLabel>
            <Input
              id="gstRegistrationNumber"
              name="gstRegistrationNumber"
              type="text"
              placeholder="22AAAAA0000A1Z5"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.gstRegistrationNumber}
              textTransform="uppercase"
            />
            <FormHelperText>Optional - 15 character GST in format 22AAAAA0000A1Z5</FormHelperText>
            <FormErrorMessage>{formik.errors.gstRegistrationNumber}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={formik.touched.address && formik.errors.address}>
            <FormLabel>Address</FormLabel>
            <Input
              id="address"
              name="address"
              type="text"
              placeholder="Enter your address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
            />
            <FormHelperText>Optional - for billing and tax purposes</FormHelperText>
            <FormErrorMessage>{formik.errors.address}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={loading}
            loadingText="Updating..."
            w="full"
          >
            Update Profile
          </Button>
        </VStack>
      </form>
    </VStack>
  );
};

export default UserProfileForm; 