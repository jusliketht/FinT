import React from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    // You can also log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg={useColorModeValue('gray.50', 'gray.800')}
          p={4}
        >
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="xl"
              color={useColorModeValue('brand.600', 'brand.400')}
            >
              Oops! Something went wrong
            </Heading>
            <Text color={useColorModeValue('gray.600', 'gray.300')}>
              We're sorry for the inconvenience. Please try refreshing the page.
            </Text>
            <Button
              colorScheme="brand"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                as="pre"
                p={4}
                bg={useColorModeValue('gray.100', 'gray.700')}
                borderRadius="md"
                overflowX="auto"
                maxW="100%"
                fontSize="sm"
              >
                {this.state.error.toString()}
              </Box>
            )}
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 