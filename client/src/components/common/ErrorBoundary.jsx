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
  Code,
  useColorModeValue,
} from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true, 
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and any error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo
    });

    // In production, you would send this to an error reporting service
    // Example: Sentry.captureException(error, { extra: errorInfo });
    
    // Log to localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId,
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 errors
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      error: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // In a real application, you would send this to your error reporting service
    console.log('Error details for reporting:', errorDetails);
    
    // For now, just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. Please report this to support.');
      })
      .catch(() => {
        alert('Error details: ' + JSON.stringify(errorDetails, null, 2));
      });
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
          p={4}
        >
          <VStack spacing={6} maxW="600px" textAlign="center">
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                  We're sorry, but something unexpected happened. Our team has been notified.
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4}>
              <Heading size="lg" color="red.600">
                Application Error
              </Heading>
              
              <Text color="gray.600">
                Error ID: {this.state.errorId}
              </Text>

              {process.env.NODE_ENV === 'development' && (
                <Box
                  bg="gray.100"
                  p={4}
                  borderRadius="md"
                  maxH="200px"
                  overflowY="auto"
                  textAlign="left"
                  fontSize="sm"
                >
                  <Text fontWeight="bold" mb={2}>Error Details (Development):</Text>
                  <Text fontFamily="mono" whiteSpace="pre-wrap">
                    {this.state.error?.message}
                  </Text>
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <Text fontWeight="bold" mt={4} mb={2}>Component Stack:</Text>
                      <Text fontFamily="mono" whiteSpace="pre-wrap" fontSize="xs">
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </>
                  )}
                </Box>
              )}

              <VStack spacing={3} pt={4}>
                <Button
                  colorScheme="blue"
                  onClick={this.handleReload}
                  size="lg"
                  width="full"
                >
                  Reload Application
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  size="lg"
                  width="full"
                >
                  Go to Dashboard
                </Button>

                <Button
                  variant="ghost"
                  onClick={this.handleReportError}
                  size="md"
                  width="full"
                >
                  Report This Error
                </Button>
              </VStack>

              <Text fontSize="sm" color="gray.500" pt={4}>
                If this problem persists, please contact support with the Error ID above.
              </Text>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 