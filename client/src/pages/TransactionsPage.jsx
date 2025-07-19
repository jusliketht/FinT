import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Checkbox,
  Card,
  CardBody,
  useToast,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import {
  AddIcon,
  SearchIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import TransactionList from '../components/transactions/TransactionList';
import transactionService from '../services/transactionService';
import { useBusiness } from '../contexts/BusinessContext';

const TransactionsPage = () => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkActions, setBulkActions] = useState('');

  return (
    <Box>
      {/* Top Bar with Actions */}
      <Box 
        bg="white" 
        borderBottom="1px solid" 
        borderColor="gray.200" 
        px={6} 
        py={4}
        position="sticky"
        top="64px"
        zIndex="100"
      >
        <Flex justify="space-between" align="center">
          {/* Left Side - Add Transaction Button */}
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            size="md"
          >
            Add Transaction
          </Button>

          {/* Center - Search Bar */}
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search or filter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
            />
          </InputGroup>

          {/* Right Side - Bulk Actions */}
          <HStack spacing={3}>
            <Checkbox>Bulk actions</Checkbox>
            <Select
              placeholder="Bulk Actions"
              value={bulkActions}
              onChange={(e) => setBulkActions(e.target.value)}
              maxW="150px"
              size="md"
            >
              <option value="delete">Delete Selected</option>
              <option value="export">Export Selected</option>
              <option value="categorize">Categorize</option>
            </Select>
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box p={6}>
        <VStack align="stretch" spacing={6}>
          <Box>
            <Heading as="h1" size="lg" mb={2}>
              Transactions
            </Heading>
            <Text color="gray.600">
              Manage your manual transactions and track your financial activities
            </Text>
          </Box>

          {/* Transaction List */}
          <Card>
            <CardBody p={0}>
              <TransactionList />
            </CardBody>
          </Card>
        </VStack>
      </Box>
    </Box>
  );
};

export default TransactionsPage; 