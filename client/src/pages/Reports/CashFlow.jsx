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
  Divider,
} from '@chakra-ui/react';
import { financialReportsService } from '../../services/financialReportsService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const CashFlow = () => {
  const { selectedBusiness } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchCashFlow = async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        businessId: selectedBusiness.id,
        startDate: startDate,
        endDate: endDate,
      };

      const response = await financialReportsService.getCashFlow(params);
      setCashFlow(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cash flow statement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBusiness) {
      fetchCashFlow();
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
              <Heading size="md">Cash Flow Statement</Heading>
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
            {cashFlow && (
              <VStack spacing={6} align="stretch">
                <Text fontSize="sm" color="gray.600">
                  Period: {new Date(cashFlow.period.startDate).toLocaleDateString()} - {new Date(cashFlow.period.endDate).toLocaleDateString()}
                </Text>

                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                  <Stat>
                    <StatLabel>Operating Activities</StatLabel>
                    <StatNumber color={cashFlow.operatingActivities >= 0 ? 'green.500' : 'red.500'}>
                      ₹{cashFlow.operatingActivities.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      {cashFlow.operatingActivities >= 0 ? (
                        <StatArrow type="increase" />
                      ) : (
                        <StatArrow type="decrease" />
                      )}
                      Core business operations
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>Investing Activities</StatLabel>
                    <StatNumber color={cashFlow.investingActivities >= 0 ? 'green.500' : 'red.500'}>
                      ₹{cashFlow.investingActivities.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      {cashFlow.investingActivities >= 0 ? (
                        <StatArrow type="increase" />
                      ) : (
                        <StatArrow type="decrease" />
                      )}
                      Capital investments
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>Financing Activities</StatLabel>
                    <StatNumber color={cashFlow.financingActivities >= 0 ? 'green.500' : 'red.500'}>
                      ₹{cashFlow.financingActivities.toLocaleString()}
                    </StatNumber>
                    <StatHelpText>
                      {cashFlow.financingActivities >= 0 ? (
                        <StatArrow type="increase" />
                      ) : (
                        <StatArrow type="decrease" />
                      )}
                      Debt and equity financing
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Divider />

                <Box>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600" mb={2}>
                        Operating Activities
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color={cashFlow.operatingActivities >= 0 ? 'green.500' : 'red.500'}>
                        ₹{cashFlow.operatingActivities.toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Cash generated from core business operations
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color="purple.600" mb={2}>
                        Investing Activities
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color={cashFlow.investingActivities >= 0 ? 'green.500' : 'red.500'}>
                        ₹{cashFlow.investingActivities.toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Cash used for capital investments
                      </Text>
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="lg" color="orange.600" mb={2}>
                        Financing Activities
                      </Text>
                      <Text fontSize="xl" fontWeight="bold" color={cashFlow.financingActivities >= 0 ? 'green.500' : 'red.500'}>
                        ₹{cashFlow.financingActivities.toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Cash from debt and equity financing
                      </Text>
                    </Box>

                    <Divider />

                    <Box>
                      <Text fontWeight="bold" fontSize="lg" mb={2}>
                        Net Cash Flow
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={cashFlow.netCashFlow >= 0 ? 'green.500' : 'red.500'}>
                        ₹{cashFlow.netCashFlow.toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Total change in cash position
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

export default CashFlow; 