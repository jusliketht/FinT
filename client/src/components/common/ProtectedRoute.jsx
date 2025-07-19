import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
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
  Spinner,
} from '@chakra-ui/react';
import { useAuth } from '../../contexts/AuthContext';
import { useBusiness } from '../../contexts/BusinessContext';
import { LoadingSpinner } from './LoadingStates';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireBusiness = false,
  permissions = [],
  fallback = null,
  redirectTo = '/login'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { selectedBusiness, loading: businessLoading } = useBusiness();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (authLoading || businessLoading) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  // Check authentication
  if (requireAuth && !user) {
    // Redirect to login with return URL
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check business selection
  if (requireBusiness && !selectedBusiness) {
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
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Business Required</AlertTitle>
              <AlertDescription>
                Please select a business to access this page.
              </AlertDescription>
            </Box>
          </Alert>

          <VStack spacing={4}>
            <Heading size="lg" color="gray.800">
              Business Selection Required
            </Heading>
            <Text color="gray.600">
              You need to select a business before accessing this feature. 
              This helps us organize your financial data properly.
            </Text>
          </VStack>

          <VStack spacing={3} w="full">
            <Button
              colorScheme="blue"
              size="lg"
              w="full"
              as="a"
              href="/business"
            >
              Select Business
            </Button>
            <Button
              variant="outline"
              size="lg"
              w="full"
              as="a"
              href="/"
            >
              Go to Dashboard
            </Button>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Check permissions
  if (permissions.length > 0 && user) {
    const userPermissions = user.permissions || [];
    const hasPermission = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
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
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                  You don't have permission to access this page.
                </AlertDescription>
              </Box>
            </Alert>

            <VStack spacing={4}>
              <Heading size="lg" color="gray.800">
                Permission Required
              </Heading>
              <Text color="gray.600">
                You need the following permissions to access this page:
              </Text>
              <VStack spacing={1}>
                {permissions.map(permission => (
                  <Text key={permission} fontSize="sm" color="gray.500">
                    • {permission}
                  </Text>
                ))}
              </VStack>
            </VStack>

            <VStack spacing={3} w="full">
              <Button
                colorScheme="blue"
                size="lg"
                w="full"
                as="a"
                href="/"
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                w="full"
                as="a"
                href="/settings"
              >
                Contact Administrator
              </Button>
            </VStack>
          </VStack>
        </Box>
      );
    }
  }

  // Check if session has expired
  if (user && user.sessionExpired) {
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
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>Session Expired</AlertTitle>
              <AlertDescription>
                Your session has expired. Please log in again to continue.
              </AlertDescription>
            </Box>
          </Alert>

          <VStack spacing={4}>
            <Heading size="lg" color="gray.800">
              Session Expired
            </Heading>
            <Text color="gray.600">
              For security reasons, your session has expired. 
              Please log in again to continue using the application.
            </Text>
          </VStack>

          <Button
            colorScheme="blue"
            size="lg"
            w="full"
            as="a"
            href="/login"
          >
            Log In Again
          </Button>
        </VStack>
      </Box>
    );
  }

  // All checks passed, render children
  return children || fallback;
};

// Specific route protection components
export const AuthRoute = ({ children }) => (
  <ProtectedRoute requireAuth={true} requireBusiness={false}>
    {children}
  </ProtectedRoute>
);

export const BusinessRoute = ({ children }) => (
  <ProtectedRoute requireAuth={true} requireBusiness={true}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute = ({ children }) => (
  <ProtectedRoute 
    requireAuth={true} 
    requireBusiness={false}
    permissions={['admin']}
  >
    {children}
  </ProtectedRoute>
);

export const ManagerRoute = ({ children }) => (
  <ProtectedRoute 
    requireAuth={true} 
    requireBusiness={true}
    permissions={['admin', 'manager']}
  >
    {children}
  </ProtectedRoute>
);

export const UserRoute = ({ children }) => (
  <ProtectedRoute 
    requireAuth={true} 
    requireBusiness={true}
    permissions={['admin', 'manager', 'user']}
  >
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute; 