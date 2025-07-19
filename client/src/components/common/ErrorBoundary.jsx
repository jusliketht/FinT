import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { WarningIcon, RefreshIcon } from '@chakra-ui/icons';

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
      errorInfo: errorInfo,
    });

    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.50"
          p={6}
        >
          <VStack spacing={6} maxW="500px" textAlign="center">
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>Something went wrong!</AlertTitle>
                <AlertDescription>
                  We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4}>
              <Heading size="lg" color="gray.800">
                Oops! Something broke
              </Heading>
              <Text color="gray.600">
                We're sorry, but something unexpected happened. Our team has been notified and is working to fix this issue.
              </Text>
            </VStack>

            <VStack spacing={3} w="full">
              <Button
                leftIcon={<RefreshIcon />}
                colorScheme="blue"
                size="lg"
                w="full"
                onClick={this.handleRetry}
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                size="lg"
                w="full"
                onClick={this.handleGoHome}
              >
                Go to Dashboard
              </Button>
            </VStack>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                mt={6}
                p={4}
                bg="gray.100"
                borderRadius="md"
                w="full"
                textAlign="left"
              >
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  Error Details (Development Only):
                </Text>
                <Text fontSize="xs" fontFamily="mono" color="red.600">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text fontSize="xs" fontFamily="mono" color="gray.600" mt={2}>
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
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