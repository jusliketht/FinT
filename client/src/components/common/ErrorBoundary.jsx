import React from 'react';
import {
  Box,
  Button,
  Alert,
  AlertTitle,
  AlertDescription,
  Container,
  Code,
  HStack
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
      errorInfo: errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // In production, you might want to log to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minH="100vh"
          p={6}
          textAlign="center"
        >
          <Container maxW="container.md">
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="lg"
              p={6}
              mb={6}
            >
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Something went wrong
              </AlertTitle>
              <AlertDescription maxW="sm">
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </AlertDescription>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box mt={4} textAlign="left" w="100%">
                  <Code
                    p={3}
                    w="100%"
                    display="block"
                    whiteSpace="pre"
                    children={this.state.error.toString()}
                    bg="gray.50"
                    color="red.600"
                    borderRadius="md"
                    fontSize="sm"
                    overflowX="auto"
                  />
                </Box>
              )}
            </Alert>

            <HStack spacing={4} justify="center" wrap="wrap">
              <Button
                colorScheme="blue"
                onClick={this.handleReload}
              >
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
              >
                Go to Home
              </Button>
            </HStack>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 