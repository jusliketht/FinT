import React, { useState, useEffect } from 'react';
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
  TableContainer,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { financialReportsService } from '../../services/financialReportsService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const TrialBalance = () => {
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trialBalance, setTrialBalance] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTrialBalance = async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        businessId: selectedBusiness.id,
        asOfDate: asOfDate,
      };

      const response = await financialReportsService.getTrialBalance(params);
      setTrialBalance(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trial balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBusiness) {
      fetchTrialBalance();
    }
  }, [selectedBusiness, asOfDate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Trial Balance</Heading>
              <FormControl width="auto">
                <FormLabel>As of Date</FormLabel>
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  width="200px"
                />
              </FormControl>
            </HStack>
          </CardHeader>
          <CardBody>
            {trialBalance && (
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontWeight="bold">As of: {new Date(trialBalance.asOfDate).toLocaleDateString()}</Text>
                  <Badge 
                    colorScheme={trialBalance.totalDebits === trialBalance.totalCredits ? 'green' : 'red'}
                    fontSize="sm"
                  >
                    {trialBalance.totalDebits === trialBalance.totalCredits ? 'Balanced' : 'Not Balanced'}
                  </Badge>
                </HStack>

                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Account Code</Th>
                        <Th>Account Name</Th>
                        <Th>Account Type</Th>
                        <Th isNumeric>Debit</Th>
                        <Th isNumeric>Credit</Th>
                        <Th isNumeric>Balance</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {trialBalance.accounts.map((account, index) => (
                        <Tr key={index}>
                          <Td>{account.accountCode}</Td>
                          <Td>{account.accountName}</Td>
                          <Td>
                            <Badge colorScheme="blue" variant="subtle">
                              {account.accountType}
                            </Badge>
                          </Td>
                          <Td isNumeric>
                            {account.totalDebits > 0 ? account.totalDebits.toLocaleString() : '-'}
                          </Td>
                          <Td isNumeric>
                            {account.totalCredits > 0 ? account.totalCredits.toLocaleString() : '-'}
                          </Td>
                          <Td isNumeric>
                            <Text
                              color={account.balance > 0 ? 'green.500' : account.balance < 0 ? 'red.500' : 'gray.500'}
                              fontWeight="bold"
                            >
                              {account.balance.toLocaleString()}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>

                <Box borderTop="1px" borderColor="gray.200" pt={4}>
                  <HStack justify="space-between" fontWeight="bold">
                    <Text>Total Debits:</Text>
                    <Text>{trialBalance.totalDebits.toLocaleString()}</Text>
                  </HStack>
                  <HStack justify="space-between" fontWeight="bold">
                    <Text>Total Credits:</Text>
                    <Text>{trialBalance.totalCredits.toLocaleString()}</Text>
                  </HStack>
                </Box>
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default TrialBalance; 