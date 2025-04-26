import React from 'react';
import {
  Box,
  Container,
  Flex,
  VStack,
  Text,
  Link,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  // Enhanced color mode values
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900)'
  );
  const navBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)');
  const footerBg = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const brandColor = useColorModeValue('brand.500', 'brand.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box minH="100vh" position="relative">
      {/* Background Pattern */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient={bgGradient}
        zIndex={-2}
      />
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        opacity={0.4}
        backgroundImage="url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
        zIndex={-1}
      />

      {/* Header/Nav with Glassmorphism */}
      <Box
        as="nav"
        py={4}
        px={8}
        bg={navBg}
        borderBottom="1px"
        borderColor={borderColor}
        backdropFilter="blur(8px)"
        position="sticky"
        top={0}
        zIndex={100}
      >
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <RouterLink to="/">
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                color={brandColor}
                _hover={{ transform: 'translateY(-1px)' }}
                transition="all 0.2s"
              >
                FinT
              </Text>
            </RouterLink>
            <Flex gap={6}>
              <Link 
                as={RouterLink} 
                to="/login" 
                color={brandColor}
                fontSize="md"
                fontWeight="medium"
                _hover={{ 
                  textDecoration: 'none',
                  transform: 'translateY(-1px)',
                  color: useColorModeValue('brand.600', 'brand.300')
                }}
                transition="all 0.2s"
              >
                Sign In
              </Link>
              <Link 
                as={RouterLink} 
                to="/register" 
                color={brandColor}
                fontSize="md"
                fontWeight="medium"
                _hover={{ 
                  textDecoration: 'none',
                  transform: 'translateY(-1px)',
                  color: useColorModeValue('brand.600', 'brand.300')
                }}
                transition="all 0.2s"
              >
                Sign Up
              </Link>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="container.xl" py={12}>
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="center"
          gap={12}
          minH="calc(100vh - 180px)"
        >
          {/* Left Side - Branding */}
          <VStack
            flex={1}
            spacing={8}
            align={{ base: 'center', lg: 'flex-start' }}
            display={{ base: 'none', lg: 'flex' }}
          >
            <VStack spacing={4} align={{ base: 'center', lg: 'flex-start' }}>
              <Text
                fontSize="6xl"
                fontWeight="bold"
                bgGradient="linear(to-r, brand.400, purple.400, pink.400)"
                bgClip="text"
                lineHeight="1.2"
              >
                Manage Your
                <br />
                Finances Smartly
              </Text>
              <Text fontSize="xl" color={textColor} maxW="md" lineHeight="tall">
                Track expenses, generate reports, and make informed financial decisions with our comprehensive financial management system.
              </Text>
            </VStack>

            {/* Feature Points */}
            <VStack spacing={4} align={{ base: 'center', lg: 'flex-start' }} pt={4}>
              {[
                'Secure and encrypted data storage',
                'Real-time transaction tracking',
                'Detailed financial reports',
                'Smart budget planning'
              ].map((feature, index) => (
                <Flex key={index} align="center" gap={3}>
                  <Box
                    w={2}
                    h={2}
                    borderRadius="full"
                    bg="brand.500"
                  />
                  <Text color={textColor}>{feature}</Text>
                </Flex>
              ))}
            </VStack>
          </VStack>

          {/* Right Side - Auth Form */}
          <Box flex={1} w="full" maxW="md">
            {children}
          </Box>
        </Flex>
      </Container>

      {/* Footer with Glassmorphism */}
      <Box
        as="footer"
        py={4}
        px={8}
        bg={footerBg}
        borderTop="1px"
        borderColor={borderColor}
        backdropFilter="blur(8px)"
      >
        <Container maxW="container.xl">
          <Flex
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
            gap={4}
          >
            <Text color={textColor}>
              © {new Date().getFullYear()} FinT. All rights reserved.
            </Text>
            <Flex gap={6}>
              {['Privacy Policy', 'Terms of Service', 'Contact Us'].map((item, index) => (
                <Link
                  key={index}
                  color={textColor}
                  href="#"
                  fontSize="sm"
                  _hover={{
                    color: brandColor,
                    textDecoration: 'none'
                  }}
                  transition="all 0.2s"
                >
                  {item}
                </Link>
              ))}
            </Flex>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default AuthLayout; 