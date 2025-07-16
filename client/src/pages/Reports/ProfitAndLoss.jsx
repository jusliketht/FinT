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
  StatArrow,
  SimpleGrid,
} from '@chakra-ui/react';
import { financialReportsService } from '../../services/financialReportsService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const ProfitAndLoss = () => {
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchProfitAndLoss = async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        businessId: selectedBusiness.id,
        startDate: startDate,
        endDate: endDate,
      };

      const response = await financialReportsService.getProfitAndLoss(params);
      setProfitLoss(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profit and loss statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBusiness) {
      fetchProfitAndLoss();
    }
  }, [selectedBusiness, startDate, endDate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Profit & Loss Statement</Heading>
              <HStack spacing={4}>
                <FormControl width="auto">
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    width="150px"
                  />
                </FormControl>
                <FormControl width="auto">
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    width="150px"
                  />
                </FormControl>
              </HStack>
            </HStack>
          </CardHeader>
          <CardBody>
            {profitLoss && (
              <VStack spacing={6} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Period: {new Date(profitLoss.period.startDate).toLocaleDateString()} - {new Date(profitLoss.period.endDate).toLocaleDateString()}
                </Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Stat>
                    <StatLabel>Total Income</StatLabel>
                    <StatNumber color="green.500">
                      ₹{profitLoss.totalIncome.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Revenue and other income
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>Total Expenses</StatLabel>
                    <StatNumber color="red.500">
                      ₹{profitLoss.totalExpenses.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      Costs and expenses
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>Net Profit/Loss</StatLabel>
                    <StatNumber color={profitLoss.netProfitLoss >= 0 ? 'green.500' : 'red.500'}>
                      ₹{profitLoss.netProfitLoss.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      {profitLoss.netProfitLoss >= 0 ? (
                        <>
                          <StatArrow type="increase" />
                          Net Profit
                        </>
                      ) : (
                        <>
                          <StatArrow type="decrease" />
                          Net Loss
                        </>
                      )}
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Box borderTop="1px" borderColor="gray.200" pt={4}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between" fontWeight="bold">
                      <Text>Total Income:</Text>
                      <Text color="green.500">₹{profitLoss.totalIncome.toLocaleString()}</Text>
                    </HStack>
                    <HStack justify="space-between" fontWeight="bold">
                      <Text>Total Expenses:</Text>
                      <Text color="red.500">₹{profitLoss.totalExpenses.toLocaleString()}</Text>
                    </HStack>
                    <Box borderTop="1px" borderColor="gray.300" pt={2}>
                      <HStack justify="space-between" fontWeight="bold" fontSize="lg">
                        <Text>Net Profit/Loss:</Text>
                        <Text color={profitLoss.netProfitLoss >= 0 ? 'green.500' : 'red.500'}>
                          ₹{profitLoss.netProfitLoss.toLocaleString()}
                        </Text>
                      </HStack>
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

export default ProfitAndLoss; 