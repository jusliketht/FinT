import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
} from '@chakra-ui/react';
import axios from 'axios';
import AuthLayout from '../../components/Layout/AuthLayout';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setStatus({
        type: 'success',
        message: 'Password reset instructions have been sent to your email.',
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to process request.',
      });
    } finally {
      setLoading(false);
    }
  };

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <AuthLayout>
      <Box
        w="full"
        maxW="400px"
        p={8}
        borderRadius="xl"
        boxShadow="lg"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2}>
              Reset Password
            </Heading>
            <Text color="gray.600">
              Enter your email to receive reset instructions
            </Text>
          </Box>

          {status.message && (
            <Alert
              status={status.type}
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="md"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1}>
                {status.type === 'success' ? 'Success!' : 'Error'}
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                {status.message}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  isDisabled={loading}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                width="full"
                mt={6}
                isLoading={loading}
                loadingText="Sending..."
              >
                Send Reset Instructions
              </Button>
            </VStack>
          </form>

          <Box textAlign="center">
            <Text color="gray.600">
              Remember your password?{' '}
              <Link
                as={RouterLink}
                to="/login"
                color="brand.500"
                _hover={{ color: 'brand.600' }}
              >
                Sign In
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </AuthLayout>
  );
};

export default ForgotPassword; 