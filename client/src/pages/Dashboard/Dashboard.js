import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Heading,
  Text,
  Button,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tag,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { getTransactions, uploadFile, resetUploadSuccess, clearError } from '../../redux/slices/transactionSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { transactions, loading, uploadLoading, error, uploadSuccess } = useSelector(
    (state) => state.transactions
  );
  const { user } = useSelector((state) => state.auth);
  
  const [fileList, setFileList] = useState([]);
  
  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);
  
  useEffect(() => {
    if (uploadSuccess) {
      toast({
        title: 'Success',
        description: 'File uploaded and processed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setFileList([]);
      dispatch(getTransactions());
      dispatch(resetUploadSuccess());
    }
  }, [uploadSuccess, dispatch, toast]);
  
  // Calculate stats
  const calculateStats = () => {
    if (!transactions || transactions.length === 0) {
      return {
        totalCredits: 0,
        totalDebits: 0,
        balance: 0,
        categoryCounts: {}
      };
    }
    
    const stats = transactions.reduce((acc, transaction) => {
      // Add to total credits or debits
      if (transaction.transactionType === 'credit') {
        acc.totalCredits += transaction.amount;
      } else {
        acc.totalDebits += transaction.amount;
      }
      
      // Count categories
      if (!acc.categoryCounts[transaction.category]) {
        acc.categoryCounts[transaction.category] = 0;
      }
      acc.categoryCounts[transaction.category]++;
      
      return acc;
    }, { totalCredits: 0, totalDebits: 0, categoryCounts: {} });
    
    stats.balance = stats.totalCredits - stats.totalDebits;
    
    return stats;
  };
  
  const stats = calculateStats();
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const isPDF = file.type === 'application/pdf';
    const isExcel = 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
      file.type === 'application/vnd.ms-excel';
    
    if (!isPDF && !isExcel) {
      toast({
        title: 'Invalid file type',
        description: 'You can only upload PDF or Excel files!',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Check file size (50MB max)
    const isLessThan50MB = file.size / 1024 / 1024 < 50;
    if (!isLessThan50MB) {
      toast({
        title: 'File too large',
        description: 'File must be smaller than 50MB!',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setFileList([file]);
  };
  
  const handleUpload = () => {
    if (fileList.length === 0) {
      toast({
        title: 'No file selected',
        description: 'Please select a file first',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileList[0]);
    
    dispatch(uploadFile(formData));
  };

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="lg" mb={6}>Dashboard</Heading>
        
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
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Stat
            p={6}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <StatLabel>Total Credits</StatLabel>
            <StatNumber color="green.500">
              ₹{stats.totalCredits.toFixed(2)}
              <StatArrow type="increase" />
            </StatNumber>
          </Stat>
          
          <Stat
            p={6}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <StatLabel>Total Debits</StatLabel>
            <StatNumber color="red.500">
              ₹{stats.totalDebits.toFixed(2)}
              <StatArrow type="decrease" />
            </StatNumber>
          </Stat>
          
          <Stat
            p={6}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <StatLabel>Balance</StatLabel>
            <StatNumber color={stats.balance >= 0 ? "green.500" : "red.500"}>
              ₹{stats.balance.toFixed(2)}
              <StatArrow type={stats.balance >= 0 ? "increase" : "decrease"} />
            </StatNumber>
          </Stat>
        </SimpleGrid>
      </Box>
      
      {/* Show upload section only to admin and accountant */}
      {user && ['admin', 'accountant'].includes(user.role) && (
        <Box>
          <Divider my={6} />
          <VStack
            spacing={4}
            p={6}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Heading size="md">Upload Statement</Heading>
            <Text color="gray.600">
              Drag and drop your PDF or Excel file here, or click to select
            </Text>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-upload"
            />
            <Button
              as="label"
              htmlFor="file-upload"
              colorScheme="brand"
              size="lg"
              width="full"
              height="150px"
              cursor="pointer"
              border="2px dashed"
              borderColor="gray.300"
              _hover={{
                borderColor: 'brand.500',
              }}
            >
              {fileList.length > 0 ? fileList[0].name : 'Click to upload or drag and drop'}
            </Button>
            <Button
              colorScheme="brand"
              onClick={handleUpload}
              isLoading={uploadLoading}
              loadingText="Uploading..."
              isDisabled={fileList.length === 0}
              width="full"
            >
              Upload File
            </Button>
          </VStack>
        </Box>
      )}
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Bank</Th>
              <Th isNumeric>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {transactions.map((transaction) => (
              <Tr key={transaction._id}>
                <Td>{new Date(transaction.date).toLocaleDateString()}</Td>
                <Td maxW="250px" isTruncated>{transaction.description}</Td>
                <Td>
                  <Tag colorScheme="blue">{transaction.category}</Tag>
                </Td>
                <Td>{transaction.bank}</Td>
                <Td isNumeric color={transaction.transactionType === 'credit' ? 'green.500' : 'red.500'}>
                  {transaction.transactionType === 'credit' ? '+' : '-'}
                  ₹{transaction.amount.toFixed(2)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </VStack>
  );
};

export default Dashboard; 