import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Text,
  Flex,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ExternalLinkIcon,
  TimeIcon 
} from '@chakra-ui/icons';

const RecentTransactions = ({ transactions = [], isLoading = false, maxItems = 5 }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'income':
      case 'revenue':
        return ArrowUpIcon;
      case 'expense':
        return ArrowDownIcon;
      default:
        return TimeIcon;
    }
  };

  const getTransactionColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'income':
      case 'revenue':
        return 'green';
      case 'expense':
        return 'red';
      default:
        return 'blue';
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === 'number') {
      return `₹${amount.toLocaleString()}`;
    }
    return amount || '₹0';
  };

  const formatDate = (date) => {
    if (!date) return '';
    const dateObj = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (dateObj.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return dateObj.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const TransactionItem = ({ transaction }) => {
    const icon = getTransactionIcon(transaction.type);
    const color = getTransactionColor(transaction.type);

    return (
      <Link to={`/journal/${transaction.id}`}>
        <Flex
          align="center"
          p={4}
          borderBottom="1px"
          borderColor={borderColor}
          _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
          transition="all 0.2s"
          cursor="pointer"
        >
          <Box
            p={2}
            borderRadius="full"
            bg={`${color}.100`}
            color={`${color}.600`}
            mr={4}
          >
            <Icon as={icon} boxSize={4} />
          </Box>
          
          <Box flex="1">
            <Text fontWeight="medium" fontSize="sm" mb={1}>
              {transaction.description || 'Journal Entry'}
            </Text>
            <Text fontSize="xs" color={textColor}>
              {formatDate(transaction.date)}
            </Text>
          </Box>
          
          <VStack align="end" spacing={1}>
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              fontFamily="mono"
              color={`${color}.600`}
            >
              {formatAmount(transaction.amount)}
            </Text>
            <Badge 
              size="sm" 
              colorScheme={transaction.status === 'posted' ? 'green' : 'orange'}
              variant="subtle"
            >
              {transaction.status || 'Draft'}
            </Badge>
          </VStack>
        </Flex>
      </Link>
    );
  };

  const LoadingSkeleton = () => (
    <VStack spacing={4} align="stretch">
      {[...Array(maxItems)].map((_, index) => (
        <Flex key={index} align="center" p={4}>
          <Skeleton borderRadius="full" boxSize={8} mr={4} />
          <Box flex="1">
            <SkeletonText noOfLines={2} spacing={2} />
          </Box>
          <VStack align="end" spacing={1}>
            <Skeleton height="16px" width="80px" />
            <Skeleton height="16px" width="60px" />
          </VStack>
        </Flex>
      ))}
    </VStack>
  );

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      boxShadow="md"
      overflow="hidden"
      border="1px"
      borderColor={borderColor}
    >
      <Flex
        justify="space-between"
        align="center"
        p={6}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Text fontSize="lg" fontWeight="bold">
          Recent Transactions
        </Text>
        <Link to="/journal">
          <HStack 
            spacing={1} 
            color="blue.600" 
            fontSize="sm" 
            fontWeight="medium"
            _hover={{ color: 'blue.700' }}
          >
            <Text>View All</Text>
            <Icon as={ExternalLinkIcon} boxSize={3} />
          </HStack>
        </Link>
      </Flex>
      
      <Box>
        {isLoading ? (
          <LoadingSkeleton />
        ) : transactions.length > 0 ? (
          <VStack spacing={0} align="stretch">
            {transactions.slice(0, maxItems).map((transaction, index) => (
              <TransactionItem key={transaction.id || index} transaction={transaction} />
            ))}
          </VStack>
        ) : (
          <Box p={6} textAlign="center">
            <Text color={textColor} fontSize="sm">
              No recent transactions
            </Text>
            <Text color={textColor} fontSize="xs" mt={1}>
              Start by adding your first transaction
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecentTransactions; 