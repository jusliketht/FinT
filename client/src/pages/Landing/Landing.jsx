import React, { memo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Text,
  Stack,
  useColorModeValue,
  Icon,
  Image,
  Avatar,
  SimpleGrid,
  VisuallyHidden,
  HStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import '../../styles/Landing.css';
import dashboardPreview from '../../assets/dashboard-preview.png';
import defaultAvatar from '../../assets/default-avatar.png';

// Memoized components for better performance
const MotionBox = memo(motion(Box));

const Feature = memo(({ title, text, IconComponent }) => {
  return (
    <Stack
      className="feature-card"
      spacing={4}
      p={8}
      rounded="xl"
      flex={1}
      minW={{ base: "full", md: "250px" }}
      role="article"
    >
      <Flex
        w={12}
        h={12}
        align="center"
        justify="center"
        rounded="full"
        bg={useColorModeValue('brand.50', 'brand.900')}
        color={useColorModeValue('brand.500', 'brand.200')}
      >
        <Icon as={IconComponent} w={6} h={6} aria-hidden="true" />
      </Flex>
      <Heading size="md" fontWeight="600" color={useColorModeValue('brand.600', 'white')}>
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>
        {text}
      </Text>
    </Stack>
  );
});

const Testimonial = memo(({ text, author, role, avatar }) => (
  <Box className="testimonial-card" role="article">
    <Text fontSize="md" mb={4} color="gray.600">
      "{text}"
    </Text>
    <Flex align="center">
      <Avatar 
        size="sm" 
        src={avatar} 
        fallbackSrc={defaultAvatar}
        mr={3} 
        alt={`${author}'s avatar`}
      />
      <Box>
        <Text fontWeight="bold" fontSize="sm">{author}</Text>
        <Text fontSize="xs" color="gray.500">{role}</Text>
      </Box>
    </Flex>
  </Box>
));

// Memoized data objects to prevent recreation on each render
const features = [
  {
    title: 'Smart Analytics',
    text: 'Track performance with actionable data and insights.',
    icon: memo(props => (
      <path
        fill="currentColor"
        d="M4 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm0 8a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"
      />
    ))
  },
  {
    title: 'Secure Platform',
    text: 'Industry-leading encryption and security protocols.',
    icon: memo(props => (
      <path
        fill="currentColor"
        d="M4 4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v12H4V6z"
      />
    ))
  },
  {
    title: 'Smart Reports',
    text: 'Generate detailed financial reports instantly.',
    icon: memo(props => (
      <path
        fill="currentColor"
        d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5z"
      />
    ))
  }
];

const testimonials = [
  {
    text: "This app made managing our finances incredibly easy. Highly recommend!",
    author: "John Doe",
    role: "CFO, Tech Corp",
    avatar: "/assets/avatars/avatar1.jpg"
  },
  {
    text: "The best financial management tool I've ever used. Simple yet powerful.",
    author: "Sarah Smith",
    role: "Small Business Owner",
    avatar: "/assets/avatars/avatar2.jpg"
  },
  {
    text: "Transformed how we handle our company's finances. Outstanding support team!",
    author: "Michael Chen",
    role: "CEO, StartUp Inc",
    avatar: "/assets/avatars/avatar3.jpg"
  }
];

const Landing = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/register');
  };

  return (
    <Box as="main">
      {/* Navigation Bar */}
      <Box py={4} borderBottom="1px" borderColor="gray.100">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Heading
              as="h1"
              fontSize="2xl"
              color="brand.500"
              cursor="pointer"
              onClick={() => navigate('/')}
            >
              FinT
            </Heading>
            <HStack spacing={4}>
              <Button
                variant="ghost"
                colorScheme="brand"
                onClick={handleLogin}
              >
                Login
              </Button>
              <Button
                colorScheme="brand"
                onClick={handleSignup}
              >
                Sign Up
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box className="hero-gradient" py={{ base: 20, md: 28 }} role="banner">
        <Container maxW="container.xl">
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="center">
            <Stack spacing={8} className="animate-fade-in">
              <Heading
                as="h1"
                size="2xl"
                fontWeight="800"
                lineHeight="1.2"
                letterSpacing="tight"
                color="brand.500"
              >
                Your Financial Clarity{' '}
                <Text as="span" color="brand.600">
                  Starts Here
                </Text>
              </Heading>
              <Text fontSize="xl" color="gray.700">
                Organize, track, and grow your finances effortlessly
              </Text>
              <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
                <Button
                  size="lg"
                  className="cta-button"
                  bg="brand.500"
                  color="white"
                  _hover={{ bg: 'brand.600' }}
                  px={8}
                  onClick={handleSignup}
                  aria-label="Get Started"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="brand"
                  px={8}
                  onClick={handleLogin}
                  aria-label="Login to your account"
                >
                  Login
                </Button>
              </Stack>
            </Stack>
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="animate-slide-in"
            >
              <Image
                src={dashboardPreview}
                alt="FinT Dashboard Preview showing financial analytics"
                fallbackSrc="https://via.placeholder.com/600x400?text=Dashboard+Preview"
                rounded="lg"
                shadow="2xl"
                loading="lazy"
              />
            </MotionBox>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20} className="pattern-bg">
        <Container maxW="container.xl">
          <Stack spacing={12}>
            <Stack spacing={4} textAlign="center">
              <Heading
                as="h2"
                size="xl"
                color="brand.600"
                fontWeight="bold"
              >
                Powerful Features to Keep You on Track
              </Heading>
              <Text color="gray.600" maxW="2xl" mx="auto">
                Everything you need to manage your finances effectively, all in one place
              </Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} className="animate-fade-in">
              {features.map((feature, index) => (
                <Feature
                  key={index}
                  title={feature.title}
                  text={feature.text}
                  IconComponent={feature.icon}
                />
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box py={20} bg={useColorModeValue('gray.50', 'gray.900')}>
        <Container maxW="container.xl">
          <Stack spacing={12}>
            <Heading
              as="h2"
              size="xl"
              color="gray.700"
              textAlign="center"
              mb={8}
            >
              What Our Users Are Saying
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} className="animate-fade-in">
              {testimonials.map((testimonial, index) => (
                <Testimonial key={index} {...testimonial} />
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={16}>
        <Container maxW="container.xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={8}
            align="center"
            justify="space-between"
            bg="brand.50"
            p={12}
            rounded="2xl"
            shadow="xl"
            className="animate-fade-in"
          >
            <Stack spacing={4} maxW="2xl">
              <Heading size="xl" color="brand.600">
                Ready to Simplify Your Finances?
              </Heading>
              <Text color="gray.600">
                Join thousands of users who trust us to manage their finances.
                Start your journey today.
              </Text>
            </Stack>
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              className="cta-button"
              bg="brand.500"
              color="white"
              px={12}
              py={7}
              fontSize="lg"
              _hover={{
                bg: 'brand.600',
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
            >
              Start Free Trial
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Footer - Updated with proper navigation */}
      <Box as="footer" bg="gray.50" py={12} role="contentinfo">
        <Container maxW="container.xl">
          <Stack spacing={8}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
              <nav>
                <Stack spacing={4}>
                  <Text color="gray.700" fontWeight="bold">About</Text>
                  <Stack color="gray.500" spacing={2} as="ul" listStyleType="none">
                    <li>
                      <RouterLink to="/about">
                        <Text _hover={{ color: 'brand.500' }}>About Us</Text>
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink to="/careers">
                        <Text _hover={{ color: 'brand.500' }}>Careers</Text>
                      </RouterLink>
                    </li>
                    <li>
                      <RouterLink to="/press">
                        <Text _hover={{ color: 'brand.500' }}>Press</Text>
                      </RouterLink>
                    </li>
                  </Stack>
                </Stack>
              </nav>
              <Stack spacing={4}>
                <Text color="gray.700" fontWeight="bold">Resources</Text>
                <Stack color="gray.500" spacing={2}>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Blog</Text>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Help Center</Text>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Guides</Text>
                </Stack>
              </Stack>
              <Stack spacing={4}>
                <Text color="gray.700" fontWeight="bold">Legal</Text>
                <Stack color="gray.500" spacing={2}>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Privacy</Text>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Terms</Text>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Security</Text>
                </Stack>
              </Stack>
              <Stack spacing={4}>
                <Text color="gray.700" fontWeight="bold">Social</Text>
                <Stack color="gray.500" spacing={2}>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Twitter</Text>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>LinkedIn</Text>
                  <Text as="a" href="#" _hover={{ color: 'brand.500' }}>Facebook</Text>
                </Stack>
              </Stack>
            </SimpleGrid>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
              pt={8}
              borderTopWidth={1}
              borderColor="gray.200"
            >
              <Text color="gray.500">© {new Date().getFullYear()} FinT. All rights reserved.</Text>
              <Stack direction="row" spacing={6} mt={{ base: 4, md: 0 }}>
                <RouterLink to="/privacy">
                  <Text color="gray.500" _hover={{ color: 'brand.500' }}>
                    Privacy Policy
                  </Text>
                </RouterLink>
                <RouterLink to="/terms">
                  <Text color="gray.500" _hover={{ color: 'brand.500' }}>
                    Terms of Service
                  </Text>
                </RouterLink>
              </Stack>
            </Flex>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default memo(Landing); 