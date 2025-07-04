import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Tag,
  IconButton
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';

const FinancialAccountsPage = () => {
  // Mock data - replace with actual data from your API
  const accounts = [
    {
      id: 1,
      code: '1000',
      name: 'Cash',
      type: 'Asset',
      category: 'Current Assets',
      balance: 15000.00,
      isActive: true
    },
    {
      id: 2,
      code: '1100',
      name: 'Accounts Receivable',
      type: 'Asset',
      category: 'Current Assets',
      balance: 25000.00,
      isActive: true
    },
    {
      id: 3,
      code: '2000',
      name: 'Accounts Payable',
      type: 'Liability',
      category: 'Current Liabilities',
      balance: -12000.00,
      isActive: true
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'Asset':
        return 'green';
      case 'Liability':
        return 'red';
      case 'Equity':
        return 'blue';
      case 'Revenue':
        return 'purple';
      case 'Expense':
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Financial Accounts</Heading>
            <Text color="gray.600">
              Manage your chart of accounts and financial structure
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
          >
            Add Account
          </Button>
        </HStack>

        <VStack spacing={4} align="stretch">
          {accounts.map((account) => (
            <Card key={account.id} bg="white" shadow="sm">
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={2}>
                    <HStack>
                      <Text fontWeight="bold">{account.code}</Text>
                      <Text>{account.name}</Text>
                    </HStack>
                    <HStack spacing={2}>
                      <Tag colorScheme={getTypeColor(account.type)} size="sm">
                        {account.type}
                      </Tag>
                      <Tag colorScheme="gray" size="sm">
                        {account.category}
                      </Tag>
                      <Tag colorScheme={account.isActive ? 'green' : 'red'} size="sm">
                        {account.isActive ? 'Active' : 'Inactive'}
                      </Tag>
                    </HStack>
                    <Text fontWeight="bold" color={account.balance >= 0 ? 'green.500' : 'red.500'}>
                      Balance: ${Math.abs(account.balance).toFixed(2)}
                    </Text>
                  </VStack>
                  <HStack spacing={2}>
                    <IconButton
                      size="sm"
                      icon={<ViewIcon />}
                      aria-label="View account"
                      variant="ghost"
                    />
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      aria-label="Edit account"
                      variant="ghost"
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      aria-label="Delete account"
                      variant="ghost"
                      colorScheme="red"
                    />
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default FinancialAccountsPage;