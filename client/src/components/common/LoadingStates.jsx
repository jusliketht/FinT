import React, { memo } from 'react';
import {
  Box,
  Skeleton,
  Spinner,
  VStack,
  HStack,
  Text,
  Progress,
  Card,
  CardBody,
  SimpleGrid,
} from '@chakra-ui/react';

// Skeleton Components
export const TableSkeleton = memo(({ rows = 5, columns = 4 }) => {
  return (
    <VStack spacing={4} align="stretch">
      {/* Header */}
      <HStack spacing={4}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} height="20px" flex={1} />
        ))}
      </HStack>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <HStack key={rowIndex} spacing={4}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height="16px" flex={1} />
          ))}
        </HStack>
      ))}
    </VStack>
  );
});

TableSkeleton.displayName = 'TableSkeleton';

export const CardSkeleton = memo(({ count = 4 }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <Skeleton height="20px" />
              <Skeleton height="32px" />
              <Skeleton height="16px" width="60%" />
            </VStack>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

export const DashboardSkeleton = memo(() => {
  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box>
        <Skeleton height="32px" width="300px" mb={2} />
        <Skeleton height="20px" width="200px" />
      </Box>

      {/* Metric Cards */}
      <CardSkeleton count={4} />

      {/* Quick Actions */}
      <Card>
        <CardBody>
          <Skeleton height="24px" width="150px" mb={4} />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height="60px" />
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={6}>
            <Skeleton height="24px" width="200px" />
            <HStack spacing={3}>
              <Skeleton height="32px" width="120px" />
              <Skeleton height="32px" width="100px" />
            </HStack>
          </HStack>
          <TableSkeleton rows={5} columns={5} />
        </CardBody>
      </Card>
    </VStack>
  );
});

DashboardSkeleton.displayName = 'DashboardSkeleton';

export const FormSkeleton = memo(() => {
  return (
    <VStack spacing={6} align="stretch">
      <Skeleton height="32px" width="200px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="40px" />
      <Skeleton height="100px" />
      <HStack spacing={4}>
        <Skeleton height="40px" flex={1} />
        <Skeleton height="40px" flex={1} />
      </HStack>
    </VStack>
  );
});

FormSkeleton.displayName = 'FormSkeleton';

export const InvoiceFormSkeleton = memo(() => {
  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <Skeleton height="32px" width="200px" />
        <Skeleton height="32px" width="100px" />
      </HStack>

      {/* Customer Selection */}
      <Skeleton height="40px" />

      {/* Invoice Items */}
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Skeleton height="24px" width="150px" />
          <Skeleton height="32px" width="100px" />
        </HStack>
        
        {/* Item Rows */}
        {Array.from({ length: 3 }).map((_, index) => (
          <HStack key={index} spacing={4}>
            <Skeleton height="40px" flex={2} />
            <Skeleton height="40px" flex={1} />
            <Skeleton height="40px" flex={1} />
            <Skeleton height="40px" flex={1} />
            <Skeleton height="40px" width="60px" />
          </HStack>
        ))}
      </VStack>

      {/* Totals */}
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <Skeleton height="20px" width="100px" />
          <Skeleton height="20px" width="80px" />
        </HStack>
        <HStack justify="space-between">
          <Skeleton height="20px" width="80px" />
          <Skeleton height="20px" width="60px" />
        </HStack>
        <HStack justify="space-between">
          <Skeleton height="24px" width="120px" />
          <Skeleton height="24px" width="100px" />
        </HStack>
      </VStack>

      {/* Actions */}
      <HStack spacing={4}>
        <Skeleton height="40px" flex={1} />
        <Skeleton height="40px" flex={1} />
      </HStack>
    </VStack>
  );
});

InvoiceFormSkeleton.displayName = 'InvoiceFormSkeleton';

// Loading Spinner Components
export const LoadingSpinner = memo(({ size = 'lg', message = 'Loading...' }) => {
  return (
    <VStack spacing={4} justify="center" align="center" minH="200px">
      <Spinner size={size} color="blue.500" thickness="4px" />
      {message && (
        <Text color="gray.600" fontSize="sm">
          {message}
        </Text>
      )}
    </VStack>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export const PageLoadingSpinner = memo(({ message = 'Loading page...' }) => {
  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(255, 255, 255, 0.8)"
      backdropFilter="blur(4px)"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text color="gray.700" fontSize="lg" fontWeight="medium">
          {message}
        </Text>
      </VStack>
    </Box>
  );
});

PageLoadingSpinner.displayName = 'PageLoadingSpinner';

export const ButtonLoadingSpinner = memo(({ size = 'sm' }) => {
  return <Spinner size={size} color="current" thickness="2px" />;
});

ButtonLoadingSpinner.displayName = 'ButtonLoadingSpinner';

// Progress Components
export const UploadProgress = memo(({ progress, fileName }) => {
  return (
    <VStack spacing={2} align="stretch" w="full">
      <HStack justify="space-between">
        <Text fontSize="sm" color="gray.600" noOfLines={1}>
          {fileName}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {Math.round(progress)}%
        </Text>
      </HStack>
      <Progress value={progress} size="sm" colorScheme="blue" />
    </VStack>
  );
});

UploadProgress.displayName = 'UploadProgress';

export const ProcessingProgress = memo(({ progress, message }) => {
  return (
    <VStack spacing={3} align="stretch" w="full">
      <Text fontSize="sm" color="gray.600">
        {message}
      </Text>
      <Progress value={progress} size="sm" colorScheme="green" />
      <Text fontSize="xs" color="gray.500" textAlign="center">
        {Math.round(progress)}% complete
      </Text>
    </VStack>
  );
});

ProcessingProgress.displayName = 'ProcessingProgress';

// Empty State Components
export const EmptyState = memo(({ 
  title, 
  description, 
  icon, 
  action,
  image 
}) => {
  return (
    <VStack spacing={6} py={12} textAlign="center">
      {image && (
        <Box maxW="200px">
          <img src={image} alt={title} style={{ width: '100%', height: 'auto' }} />
        </Box>
      )}
      
      {icon && (
        <Box
          p={4}
          borderRadius="full"
          bg="blue.50"
          color="blue.500"
          fontSize="3xl"
        >
          {icon}
        </Box>
      )}
      
      <VStack spacing={2}>
        <Text fontSize="xl" fontWeight="bold" color="gray.800">
          {title}
        </Text>
        <Text color="gray.600" maxW="400px">
          {description}
        </Text>
      </VStack>
      
      {action && (
        <Box>
          {action}
        </Box>
      )}
    </VStack>
  );
});

EmptyState.displayName = 'EmptyState';

export const NoDataState = memo(({ 
  type = 'data',
  action 
}) => {
  const getContent = () => {
    switch (type) {
      case 'transactions':
        return {
          title: 'No Transactions Found',
          description: 'Start by adding your first transaction to track your financial activities.',
          icon: '📊'
        };
      case 'accounts':
        return {
          title: 'No Accounts Found',
          description: 'Create your first account to organize your financial data.',
          icon: '🏦'
        };
      case 'invoices':
        return {
          title: 'No Invoices Found',
          description: 'Create your first invoice to start managing your billing.',
          icon: '📄'
        };
      case 'reports':
        return {
          title: 'No Reports Available',
          description: 'Generate reports once you have some financial data.',
          icon: '📈'
        };
      default:
        return {
          title: 'No Data Found',
          description: 'There\'s no data to display at the moment.',
          icon: '📋'
        };
    }
  };

  const content = getContent();

  return (
    <EmptyState
      title={content.title}
      description={content.description}
      icon={content.icon}
      action={action}
    />
  );
});

NoDataState.displayName = 'NoDataState';

const LoadingStates = {
  TableSkeleton,
  CardSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  InvoiceFormSkeleton,
  LoadingSpinner,
  PageLoadingSpinner,
  ButtonLoadingSpinner,
  UploadProgress,
  ProcessingProgress,
  EmptyState,
  NoDataState,
};

export default LoadingStates; 