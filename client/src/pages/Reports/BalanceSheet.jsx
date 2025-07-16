import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Badge,
  Divider,
} from '@chakra-ui/react';
import { financialReportsService } from '../../services/financialReportsService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const BalanceSheet = () => {
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchBalanceSheet = async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        businessId: selectedBusiness.id,
        asOfDate: asOfDate,
      };

      const response = await financialReportsService.getBalanceSheet(params);
      setBalanceSheet(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance sheet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBusiness) {
      fetchBalanceSheet();
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
              <Heading size="md">Balance Sheet</Heading>
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
            {balanceSheet && (
              <VStack spacing={6} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  As of: {new Date(balanceSheet.asOfDate).toLocaleDateString()}
                </Text>

                <HStack justify="space-between">
                  <Badge 
                    colorScheme={balanceSheet.isBalanced ? 'green' : 'red'}
                    fontSize="sm"
                  >
                    {balanceSheet.isBalanced ? 'Balanced' : 'Not Balanced'}
                  </Badge>
                </HStack>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Stat>
                    <StatLabel>Total Assets</StatLabel>
                    <StatNumber color="blue.500">
                      ₹{balanceSheet.totalAssets.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      Resources owned by the business
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>Total Liabilities</StatLabel>
                    <StatNumber color="red.500">
                      ₹{balanceSheet.totalLiabilities.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      Obligations owed by the business
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>Total Equity</StatLabel>
                    <StatNumber color="green.500">
                      ₹{balanceSheet.totalEquity.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      Owner's investment and retained earnings
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Divider />

                <Box>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600" mb={2}>
                        Assets
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="blue.500">
                        ₹{balanceSheet.totalAssets.toLocaleString()}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color="red.600" mb={2}>
                        Liabilities
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="red.500">
                        ₹{balanceSheet.totalLiabilities.toLocaleString()}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color="green.600" mb={2}>
                        Equity
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.500">
                        ₹{balanceSheet.totalEquity.toLocaleString()}
                      </Text>
                    </Box>

                    <Divider />

                    <Box>
                      <Text fontWeight="bold" fontSize="lg" mb={2}>
                        Accounting Equation
                      </Text>
                      <Text fontSize="md">
                        Assets = Liabilities + Equity
                      </Text>
                      <Text fontSize="md" color={balanceSheet.isBalanced ? 'green.500' : 'red.500'}>
                        ₹{balanceSheet.totalAssets.toLocaleString()} = ₹{balanceSheet.totalLiabilities.toLocaleString()} + ₹{balanceSheet.totalEquity.toLocaleString()}
                      </Text>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default BalanceSheet; 