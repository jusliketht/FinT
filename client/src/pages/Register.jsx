import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  Box,
  Button,
  Input,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
  Container,
  Card,
  CardBody,
  IconButton,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.access_token);
        showToast('Registration successful!', 'success');
        navigate('/');
      } else {
        showToast(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showToast('An error occurred during registration', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="md">
        <Card bg="white" shadow="lg">
          <CardBody p={8}>
            <VStack spacing={6}>
              <Heading size="lg" textAlign="center">
                Create Account
              </Heading>
              <Text color="gray.600" textAlign="center">
                Sign up to get started with your financial management
              </Text>

              <Box as="form" w="100%" onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <Box mb={4} w="100%">
                    <Text fontWeight="medium" mb={2}>Full Name</Text>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </Box>

                  <Box mb={4} w="100%">
                    <Text fontWeight="medium" mb={2}>Email</Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                    />
                  </Box>

                  <Box mb={4} w="100%">
                    <Text fontWeight="medium" mb={2}>Password</Text>
                    <Box position="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        pr="2.5rem"
                      />
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        position="absolute"
                        top="50%"
                        right="0.5rem"
                        transform="translateY(-50%)"
                        onClick={() => setShowPassword(!showPassword)}
                      />
                    </Box>
                  </Box>

                  <Box mb={4} w="100%">
                    <Text fontWeight="medium" mb={2}>Confirm Password</Text>
                    <Box position="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        pr="2.5rem"
                      />
                      <IconButton
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        variant="ghost"
                        size="sm"
                        position="absolute"
                        top="50%"
                        right="0.5rem"
                        transform="translateY(-50%)"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    </Box>
                  </Box>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="100%"
                    isLoading={isLoading}
                    loadingText="Creating account..."
                  >
                    Create Account
                  </Button>
                </VStack>
              </Box>

              <VStack spacing={2}>
                <Text>
                  Already have an account?{' '}
                  <ChakraLink as={Link} to="/login" color="blue.500">
                    Sign in
                  </ChakraLink>
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Register; 