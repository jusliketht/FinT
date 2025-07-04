import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Heading,
  Text,
  Button,
  Alert,
  Tag,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatArrow,
  Table,
  Tr,
  Th,
  Td,
  Card
} from '@chakra-ui/react';
import { getTransactions, uploadFile, resetUploadSuccess } from '../../redux/slices/transactionSlice';
import { useToast } from '../../contexts/ToastContext';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { transactions, uploadLoading, error, uploadSuccess } = useSelector(
    (state) => state.transactions
  );
  const { user } = useSelector((state) => state.auth);
  
  const [fileList, setFileList] = useState([]);
  
  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);
  
  useEffect(() => {
    if (uploadSuccess) {
      showToast('File uploaded and processed successfully', 'success');
      setFileList([]);
      dispatch(getTransactions());
      dispatch(resetUploadSuccess());
    }
  }, [uploadSuccess, dispatch, showToast]);
  
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
      showToast('You can only upload PDF or Excel files!', 'error');
      return;
    }
    
    // Check file size (50MB max)
    const isLessThan50MB = file.size / 1024 / 1024 < 50;
    if (!isLessThan50MB) {
      showToast('File must be smaller than 50MB!', 'error');
      return;
    }
    
    setFileList([file]);
  };
  
  const handleUpload = () => {
    if (fileList.length === 0) {
      showToast('Please select a file first', 'warning');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', fileList[0]);
    
    dispatch(uploadFile(formData));
  };

  return (
    <VStack spacing={8} align="stretch">
      <Box>
        <Heading size="lg" mb={6}>Dashboard</Heading>
        
        {error && (
          <Alert status="error" mb={6}>
            <Box flex="1">
              <Text fontWeight="bold">Error</Text>
              <Text>{error}</Text>
            </Box>
          </Alert>
        )}
        
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Card>
            <Stat>
              <StatLabel>Total Credits</StatLabel>
              <StatNumber color="green.500">
                ₹{stats.totalCredits.toFixed(2)}
                <StatArrow type="increase" />
              </StatNumber>
            </Stat>
          </Card>
          
          <Card>
            <Stat>
              <StatLabel>Total Debits</StatLabel>
              <StatNumber color="red.500">
                ₹{stats.totalDebits.toFixed(2)}
                <StatArrow type="decrease" />
              </StatNumber>
            </Stat>
          </Card>
          
          <Card>
            <Stat>
              <StatLabel>Balance</StatLabel>
              <StatNumber color={stats.balance >= 0 ? "green.500" : "red.500"}>
                ₹{stats.balance.toFixed(2)}
                <StatArrow type={stats.balance >= 0 ? "increase" : "decrease"} />
              </StatNumber>
            </Stat>
          </Card>
        </SimpleGrid>
      </Box>
      
      {/* Show upload section only to admin and accountant */}
      {user && ['admin', 'accountant'].includes(user.role) && (
        <Box>
          <Box borderBottom="1px" borderColor="gray.200" my={6} />
          <Card>
            <VStack spacing={4}>
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
          </Card>
        </Box>
      )}
      
      <Box overflowX="auto">
        <Table variant="simple">
          <thead>
            <Tr>
              <Th>Date</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Bank</Th>
              <Th isNumeric>Amount</Th>
            </Tr>
          </thead>
          <tbody>
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
          </tbody>
        </Table>
      </Box>
    </VStack>
  );
};

export default Dashboard; 