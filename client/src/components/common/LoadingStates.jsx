import React from 'react';
import {
  Box,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Spinner,
  VStack,
  HStack,
  Text,
  Progress,
  Flex,
  Card,
  CardBody,
  SimpleGrid,
} from '@chakra-ui/react';

// Skeleton Components
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
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
};

export const CardSkeleton = ({ count = 4 }) => {
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
};

export const DashboardSkeleton = () => {
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
};

export const FormSkeleton = () => {
  return (
    <VStack spacing={6} align="stretch">
      <Skeleton height="32px" width="200px" />
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {Array.from({ length: 6 }).map((_, index) => (
          <VStack key={index} align="stretch" spacing={2}>
            <Skeleton height="20px" width="100px" />
            <Skeleton height="40px" />
          </VStack>
        ))}
      </SimpleGrid>
      <HStack spacing={3}>
        <Skeleton height="40px" width="100px" />
        <Skeleton height="40px" width="100px" />
      </HStack>
    </VStack>
  );
};

export const InvoiceFormSkeleton = () => {
  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack spacing={6}>
        <VStack align="stretch" flex={1}>
          <Skeleton height="20px" width="100px" />
          <Skeleton height="40px" />
        </VStack>
        <VStack align="stretch" flex={1}>
          <Skeleton height="20px" width="100px" />
          <Skeleton height="40px" />
        </VStack>
        <VStack align="stretch" flex={1}>
          <Skeleton height="20px" width="100px" />
          <Skeleton height="40px" />
        </VStack>
      </HStack>

      {/* Line Items */}
      <Box>
        <HStack justify="space-between" mb={4}>
          <Skeleton height="20px" width="100px" />
          <Skeleton height="32px" width="100px" />
        </HStack>
        <TableSkeleton rows={3} columns={5} />
      </Box>

      {/* Totals */}
      <VStack spacing={2} align="stretch">
        {Array.from({ length: 4 }).map((_, index) => (
          <HStack key={index} justify="space-between">
            <Skeleton height="16px" width="100px" />
            <Skeleton height="16px" width="80px" />
          </HStack>
        ))}
      </VStack>
    </VStack>
  );
};

// Loading Spinner Components
export const LoadingSpinner = ({ size = 'lg', message = 'Loading...' }) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="200px"
      spacing={4}
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
        size={size}
      />
      {message && (
        <Text mt={4} color="gray.600" fontSize="sm">
          {message}
        </Text>
      )}
    </Flex>
  );
};

export const PageLoadingSpinner = ({ message = 'Loading page...' }) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="100vh"
      bg="gray.50"
    >
      <VStack spacing={6}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text color="gray.600" fontSize="lg">
          {message}
        </Text>
      </VStack>
    </Flex>
  );
};

export const ButtonLoadingSpinner = ({ size = 'sm' }) => {
  return (
    <Spinner
      thickness="2px"
      speed="0.65s"
      emptyColor="gray.200"
      color="white"
      size={size}
    />
  );
};

// Progress Components
export const UploadProgress = ({ progress, fileName }) => {
  return (
    <VStack spacing={3} align="stretch" w="full">
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">
          {fileName}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {progress}%
        </Text>
      </HStack>
      <Progress
        value={progress}
        colorScheme="blue"
        size="sm"
        borderRadius="full"
      />
    </VStack>
  );
};

export const ProcessingProgress = ({ progress, message }) => {
  return (
    <VStack spacing={4} align="stretch" w="full">
      <Text fontSize="sm" fontWeight="medium">
        {message}
      </Text>
      <Progress
        value={progress}
        colorScheme="green"
        size="sm"
        borderRadius="full"
        hasStripe
        isAnimated
      />
      <Text fontSize="xs" color="gray.600" textAlign="center">
        {progress}% complete
      </Text>
    </VStack>
  );
};

// Empty State Components
export const EmptyState = ({ 
  title, 
  description, 
  icon, 
  action,
  image 
}) => {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      minH="300px"
      p={8}
      textAlign="center"
    >
      <VStack spacing={6} maxW="400px">
        {image && (
          <Box w="120px" h="120px">
            {image}
          </Box>
        )}
        {icon && (
          <Box fontSize="4xl" color="gray.400">
            {icon}
          </Box>
        )}
        <VStack spacing={2}>
          <Text fontSize="lg" fontWeight="semibold" color="gray.800">
            {title}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {description}
          </Text>
        </VStack>
        {action && action}
      </VStack>
    </Flex>
  );
};

export const NoDataState = ({ 
  type = 'data',
  action 
}) => {
  const config = {
    data: {
      title: 'No data available',
      description: 'There are no items to display at the moment.',
    },
    transactions: {
      title: 'No transactions found',
      description: 'Start by adding your first transaction to track your finances.',
    },
    invoices: {
      title: 'No invoices found',
      description: 'Create your first invoice to start billing your customers.',
    },
    reports: {
      title: 'No reports available',
      description: 'Generate reports to analyze your financial data.',
    },
    customers: {
      title: 'No customers found',
      description: 'Add customers to start creating invoices and managing relationships.',
    },
  };

  const { title, description } = config[type] || config.data;

  return (
    <EmptyState
      title={title}
      description={description}
      action={action}
    />
  );
};

export default {
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