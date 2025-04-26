import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  InputGroup,
  InputRightElement,
  IconButton,
  Alert,
  AlertIcon,
  useColorModeValue,
  Checkbox,
  HStack,
  Flex,
  Divider,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon, EmailIcon, LockIcon } from '@chakra-ui/icons';
import { FaGoogle, FaGithub } from 'react-icons/fa';
import { login, clearError } from '../../redux/slices/authSlice';
import AuthLayout from '../../components/Layout/AuthLayout';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error: reduxError } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: localStorage.getItem('rememberMe') === 'true' || false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
    
    // Check if user is already authenticated
    if (isAuthenticated) {
      console.log('User is authenticated, redirecting to dashboard...');
      navigate('/app/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    // Handle remember me checkbox
    if (e.target.name === 'rememberMe') {
      localStorage.setItem('rememberMe', value);
    }
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const result = await dispatch(login(formData)).unwrap();
      console.log('Login successful:', result);
      
      // Save email if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Use the redirectTo from the response or default to /app/dashboard
      const redirectPath = result.redirectTo || '/app/dashboard';
      navigate(redirectPath.startsWith('/app') ? redirectPath : `/app${redirectPath}`, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err || 'Login failed. Please try again.');
    }
  };

  // Pre-fill email if remembered
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && formData.rememberMe) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail
      }));
    }
  }, []);

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.800');
  const socialBtnBg = useColorModeValue('gray.50', 'gray.700');
  const socialBtnHoverBg = useColorModeValue('gray.100', 'gray.600');

  return (
    <AuthLayout>
      <Box
        w="full"
        maxW="400px"
        p={8}
        borderRadius="xl"
        boxShadow="xl"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2} color="brand.500">
              Welcome Back
            </Heading>
            <Text color="gray.600">
              Sign in to manage your finances
            </Text>
          </Box>

          {(error || reduxError) && (
            <Alert status="error" borderRadius="lg" variant="left-accent">
              <AlertIcon />
              {error || reduxError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <InputGroup>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    isDisabled={loading}
                    bg={inputBg}
                    borderRadius="lg"
                    size="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={2} color="gray.500">
                    <EmailIcon />
                  </Box>
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    isDisabled={loading}
                    bg={inputBg}
                    borderRadius="lg"
                    size="lg"
                    pl={10}
                  />
                  <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={2} color="gray.500">
                    <LockIcon />
                  </Box>
                  <InputRightElement h="full">
                    <IconButton
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      isDisabled={loading}
                    />
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              <HStack justify="space-between" w="full">
                <Checkbox
                  name="rememberMe"
                  isChecked={formData.rememberMe}
                  onChange={handleChange}
                  colorScheme="brand"
                  size="md"
                >
                  <Text fontSize="sm">Remember me</Text>
                </Checkbox>
                <Link
                  as={RouterLink}
                  to="/forgot-password"
                  color="brand.500"
                  fontSize="sm"
                  _hover={{ color: 'brand.600', textDecoration: 'none' }}
                >
                  Forgot Password?
                </Link>
              </HStack>

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                width="full"
                mt={6}
                isLoading={loading}
                loadingText="Signing In..."
                borderRadius="lg"
                boxShadow="md"
                _hover={{
                  boxShadow: 'lg',
                  transform: 'translateY(-1px)',
                }}
                _active={{
                  boxShadow: 'sm',
                  transform: 'translateY(0)',
                }}
              >
                Sign In
              </Button>
            </VStack>
          </form>

          <VStack spacing={4} pt={2}>
            <HStack w="full">
              <Divider />
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap" px={2}>
                or continue with
              </Text>
              <Divider />
            </HStack>

            <HStack spacing={4} w="full">
              <Button
                w="full"
                variant="outline"
                leftIcon={<FaGoogle />}
                bg={socialBtnBg}
                _hover={{ bg: socialBtnHoverBg }}
                size="lg"
                borderRadius="lg"
              >
                Google
              </Button>
              <Button
                w="full"
                variant="outline"
                leftIcon={<FaGithub />}
                bg={socialBtnBg}
                _hover={{ bg: socialBtnHoverBg }}
                size="lg"
                borderRadius="lg"
              >
                GitHub
              </Button>
            </HStack>
          </VStack>

          <Box textAlign="center" pt={4}>
            <Text color="gray.600">
              Don't have an account?{' '}
              <Link
                as={RouterLink}
                to="/register"
                color="brand.500"
                fontWeight="semibold"
                _hover={{ color: 'brand.600', textDecoration: 'none' }}
              >
                Sign Up
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </AuthLayout>
  );
};

export default Login; 