import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Heading,
  HStack,
  Text,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import useApi from '../../hooks/useApi';
import { format } from 'date-fns';

const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    debitAccountId: '',
    creditAccountId: '',
    amount: ''
  });
  const toast = useToast();
  const api = useApi();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch journal entries and accounts
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [entriesRes, accountsRes] = await Promise.all([
        api.get('/api/journal-entries'),
        api.get('/api/accounts')
      ]);

      setEntries(entriesRes.data);
      setAccounts(accountsRes.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching data');
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post('/api/journal-entries', formData);
      
      setEntries(prev => [response.data, ...prev]);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        debitAccountId: '',
        creditAccountId: '',
        amount: ''
      });

      toast({
        title: 'Success',
        description: 'Journal entry created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error creating journal entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle entry deletion
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setLoading(true);
      await api.delete(`/api/journal-entries/${deleteId}`);
      
      setEntries(prev => prev.filter(entry => entry.id !== deleteId));
      
      toast({
        title: 'Success',
        description: 'Journal entry deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Error deleting journal entry',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setDeleteId(null);
      onClose();
    }
  };

  if (loading && entries.length === 0) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading journal entries...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Heading size="lg" mb={6}>Journal Entries</Heading>

      {/* Create Entry Form */}
      <Box as="form" onSubmit={handleSubmit} mb={8} p={4} borderWidth={1} borderRadius="md">
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Date</FormLabel>
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Debit Account</FormLabel>
            <Select
              name="debitAccountId"
              value={formData.debitAccountId}
              onChange={handleChange}
              placeholder="Select debit account"
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.code})
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Credit Account</FormLabel>
            <Select
              name="creditAccountId"
              value={formData.creditAccountId}
              onChange={handleChange}
              placeholder="Select credit account"
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.code})
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Amount</FormLabel>
            <Input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            loadingText="Creating..."
          >
            Create Entry
          </Button>
        </VStack>
      </Box>

      {/* Entries Table */}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Description</Th>
            <Th>Debit Account</Th>
            <Th>Credit Account</Th>
            <Th>Amount</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map((entry) => (
            <Tr key={entry.id}>
              <Td>{format(new Date(entry.date), 'yyyy-MM-dd')}</Td>
              <Td>{entry.description}</Td>
              <Td>{entry.debitAccount.name}</Td>
              <Td>{entry.creditAccount.name}</Td>
              <Td>{entry.amount.toFixed(2)}</Td>
              <Td>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={() => {
                    setDeleteId(entry.id);
                    onOpen();
                  }}
                >
                  Delete
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={undefined}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Journal Entry
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this journal entry? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default JournalEntries; 