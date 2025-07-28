import React, { useState } from 'react';
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
  InputGroup,
  InputRightElement,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useApi } from '../../hooks/useApi';

const PasswordChangeForm = ({ onSubmit, loading }) => {
  const toast = useToast();
  const api = useApi();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Current password is required'),
    newPassword: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      )
      .required('New password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const formik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
        formik.resetForm();
        toast({
          title: 'Password Changed',
          description: 'Your password has been changed successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Password Change Failed',
          description: error.message || 'Failed to change password.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    },
  });

  return (
    <VStack spacing={6} align="stretch">
      {/* Security Status */}
      <Alert status="info" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Security Settings</AlertTitle>
          <AlertDescription>
            <HStack spacing={4} mt={2}>
              <Badge colorScheme="green" variant="subtle">
                Two-Factor Auth: Enabled
              </Badge>
              <Badge colorScheme="blue" variant="subtle">
                Last Login: Today
              </Badge>
            </HStack>
          </AlertDescription>
        </Box>
      </Alert>

      {/* Password Requirements */}
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Password Requirements</AlertTitle>
          <AlertDescription>
            <VStack align="start" spacing={1} mt={2}>
              <Text fontSize="sm">• At least 8 characters long</Text>
              <Text fontSize="sm">• Contains uppercase and lowercase letters</Text>
              <Text fontSize="sm">• Contains at least one number</Text>
              <Text fontSize="sm">• Contains at least one special character (@$!%*?&)</Text>
            </VStack>
          </AlertDescription>
        </Box>
      </Alert>

      {/* Password Change Form */}
      <form onSubmit={formik.handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={formik.touched.currentPassword && formik.errors.currentPassword}>
            <FormLabel>Current Password</FormLabel>
            <InputGroup>
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Enter your current password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.currentPassword}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  icon={showCurrentPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{formik.errors.currentPassword}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={formik.touched.newPassword && formik.errors.newPassword}>
            <FormLabel>New Password</FormLabel>
            <InputGroup>
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.newPassword}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  icon={showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
            <FormHelperText>Must meet the requirements above</FormHelperText>
            <FormErrorMessage>{formik.errors.newPassword}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={formik.touched.confirmPassword && formik.errors.confirmPassword}>
            <FormLabel>Confirm New Password</FormLabel>
            <InputGroup>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant="ghost"
                  size="sm"
                />
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{formik.errors.confirmPassword}</FormErrorMessage>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            isLoading={loading}
            loadingText="Changing Password..."
            w="full"
          >
            Change Password
          </Button>
        </VStack>
      </form>
    </VStack>
  );
};

export default PasswordChangeForm; 