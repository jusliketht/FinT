import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { CalendarIcon, DownloadIcon } from '@chakra-ui/icons';
import {
  generateBalanceSheet,
  generateProfitLoss,
  generateCashFlow,
  clearError
} from '../../redux/slices/transactionSlice';

const Reports = () => {
  const dispatch = useDispatch();
  const { reportLoading, error } = useSelector((state) => state.transactions);
  
  const [balanceSheetDate, setBalanceSheetDate] = useState(new Date().toISOString().split('T')[0]);
  const [profitLossRange, setProfitLossRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [cashFlowRange, setCashFlowRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  
  const handleGenerateBalanceSheet = (e) => {
    e.preventDefault();
    dispatch(generateBalanceSheet({ asOfDate: balanceSheetDate }));
  };
  
  const handleGenerateProfitLoss = (e) => {
    e.preventDefault();
    dispatch(generateProfitLoss(profitLossRange));
  };
  
  const handleGenerateCashFlow = (e) => {
    e.preventDefault();
    dispatch(generateCashFlow(cashFlowRange));
  };

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Heading size="lg" mb={4}>Financial Reports</Heading>
          
          {error && (
            <Alert status="error" mb={6}>
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription display="block">
                  {error}
                </AlertDescription>
              </Box>
            </Alert>
          )}
          
          <Text color="gray.600" mb={8}>
            Generate financial reports as PDF documents that you can download, print, or share.
          </Text>
        </Box>
        
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
          {/* Balance Sheet Card */}
          <Box
            p={6}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <VStack spacing={4} align="stretch">
              <HStack spacing={2}>
                <Icon as={CalendarIcon} />
                <Heading size="md">Balance Sheet</Heading>
              </HStack>
              
              <Text color="gray.600">
                A snapshot of your financial position showing assets, liabilities, and equity.
              </Text>
              
              <Divider />
              
              <form onSubmit={handleGenerateBalanceSheet}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>As of Date</FormLabel>
                    <Input
                      type="date"
                      value={balanceSheetDate}
                      onChange={(e) => setBalanceSheetDate(e.target.value)}
                    />
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="brand"
                    width="full"
                    isLoading={reportLoading}
                    leftIcon={<DownloadIcon />}
                  >
                    Generate Balance Sheet
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
          
          {/* Profit & Loss Card */}
          <Box
            p={6}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <VStack spacing={4} align="stretch">
              <HStack spacing={2}>
                <Icon as={CalendarIcon} />
                <Heading size="md">Profit & Loss</Heading>
              </HStack>
              
              <Text color="gray.600">
                Shows your income and expenses over a period, highlighting profitability.
              </Text>
              
              <Divider />
              
              <form onSubmit={handleGenerateProfitLoss}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      value={profitLossRange.startDate}
                      onChange={(e) => setProfitLossRange(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      value={profitLossRange.endDate}
                      onChange={(e) => setProfitLossRange(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                    />
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="brand"
                    width="full"
                    isLoading={reportLoading}
                    leftIcon={<DownloadIcon />}
                  >
                    Generate P&L Statement
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
          
          {/* Cash Flow Card */}
          <Box
            p={6}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <VStack spacing={4} align="stretch">
              <HStack spacing={2}>
                <Icon as={CalendarIcon} />
                <Heading size="md">Cash Flow Statement</Heading>
              </HStack>
              
              <Text color="gray.600">
                Tracks the flow of cash in and out of your business, categorized by activities.
              </Text>
              
              <Divider />
              
              <form onSubmit={handleGenerateCashFlow}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Start Date</FormLabel>
                    <Input
                      type="date"
                      value={cashFlowRange.startDate}
                      onChange={(e) => setCashFlowRange(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>End Date</FormLabel>
                    <Input
                      type="date"
                      value={cashFlowRange.endDate}
                      onChange={(e) => setCashFlowRange(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                    />
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="brand"
                    width="full"
                    isLoading={reportLoading}
                    leftIcon={<DownloadIcon />}
                  >
                    Generate Cash Flow
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

export default Reports; 