import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useBusiness } from '../../../contexts/BusinessContext';

const TrialBalance = () => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [trialBalance, setTrialBalance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTrialBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/businesses/${selectedBusiness.id}/reports/trial-balance`);
      if (response.ok) {
        const data = await response.json();
        setTrialBalance(data.data || []);
      } else {
        throw new Error('Failed to fetch trial balance');
      }
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load trial balance',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, toast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchTrialBalance();
    }
  }, [selectedBusiness, fetchTrialBalance]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      asset: 'green',
      liability: 'red',
      equity: 'blue',
      revenue: 'purple',
      expense: 'orange'
    };
    return colors[type] || 'gray';
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading trial balance...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>Error loading trial balance</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  const totalDebits = trialBalance.reduce((sum, account) => sum + (account.debit || 0), 0);
  const totalCredits = trialBalance.reduce((sum, account) => sum + (account.credit || 0), 0);

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              Trial Balance
            </Text>
            <Text color="gray.600">
              As of {new Date().toLocaleDateString()}
            </Text>
          </Box>
          <Button colorScheme="blue" onClick={fetchTrialBalance}>
            Refresh
          </Button>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Account</Th>
              <Th>Type</Th>
              <Th isNumeric>Debit</Th>
              <Th isNumeric>Credit</Th>
            </Tr>
          </Thead>
          <Tbody>
            {trialBalance.map((account) => (
              <Tr key={account.id}>
                <Td>
                  <Text fontWeight="medium">{account.name}</Text>
                  <Text fontSize="sm" color="gray.500">{account.code}</Text>
                </Td>
                <Td>
                  <Badge colorScheme={getAccountTypeColor(account.type)}>
                    {account.type}
                  </Badge>
                </Td>
                <Td isNumeric>
                  {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                </Td>
                <Td isNumeric>
                  {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {/* Totals */}
        <Box borderTop="2px" borderColor="gray.200" pt={4}>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">
              Total Debits: {formatCurrency(totalDebits)}
            </Text>
            <Text fontSize="lg" fontWeight="bold">
              Total Credits: {formatCurrency(totalCredits)}
            </Text>
          </HStack>
          
          {totalDebits !== totalCredits && (
            <Alert status="warning" mt={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>Unbalanced Trial Balance</AlertTitle>
                <AlertDescription>
                  Total debits and credits do not match. Please review your journal entries.
                </AlertDescription>
              </Box>
            </Alert>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default TrialBalance; 