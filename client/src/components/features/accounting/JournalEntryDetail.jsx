import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Card,
  SimpleGrid,
  Table,
  Alert,
  IconButton
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon } from '@chakra-ui/icons';
import { useApi } from '../../../hooks/useApi';
import { useToast } from '../../../contexts/ToastContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import ErrorMessage from '../../common/ErrorMessage';
import { journalEntryService } from '../../../services/journalEntryService';

const JournalEntryDetail = ({ entryId, isOpen, onClose }) => {
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchEntryDetails = useCallback(async () => {
    if (!entryId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await journalEntryService.getById(entryId);
      setEntry(response.data || response);
    } catch (err) {
      setError('Failed to fetch entry details');
      toast({
        title: 'Error',
        description: 'Failed to load entry details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [entryId, toast]);

  useEffect(() => {
    if (isOpen && entryId) {
      fetchEntryDetails();
    }
  }, [isOpen, entryId, fetchEntryDetails]);

  const handleEdit = () => {
    navigate(`/journal-entries/${id}/edit`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted': return 'green';
      case 'draft': return 'yellow';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const calculateTotals = () => {
    if (!entry || !entry.entries) return { debit: 0, credit: 0 };
    
    return entry.entries.reduce((acc, item) => {
      acc.debit += item.debit || 0;
      acc.credit += item.credit || 0;
      return acc;
    }, { debit: 0, credit: 0 });
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!entry) return <ErrorMessage message="Journal entry not found" />;

  const totals = calculateTotals();

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/journal-entries')}
            variant="ghost"
            aria-label="Go back"
          />
          <Heading size="lg">Journal Entry #{entry.entryNumber}</Heading>
        </HStack>
        <Button
          leftIcon={<EditIcon />}
          colorScheme="brand"
          onClick={handleEdit}
        >
          Edit Entry
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Entry Information</Heading>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Entry Number</Text>
              <Text>{entry.entryNumber}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Date</Text>
              <Text>{new Date(entry.date).toLocaleDateString()}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Status</Text>
              <Badge colorScheme={getStatusColor(entry.status)}>
                {entry.status}
              </Badge>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Reference</Text>
              <Text>{entry.reference || 'N/A'}</Text>
            </Box>
            
            {entry.description && (
              <Box>
                <Text fontWeight="bold" color="gray.600">Description</Text>
                <Text>{entry.description}</Text>
              </Box>
            )}
          </VStack>
        </Card>

        <Card>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Financial Summary</Heading>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Total Debits</Text>
              <Text fontSize="lg" color="red.500">₹{totals.debit.toFixed(2)}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Total Credits</Text>
              <Text fontSize="lg" color="green.500">₹{totals.credit.toFixed(2)}</Text>
            </Box>
            
            <Box borderBottom="1px" borderColor="gray.200" />
            
            <Box>
              <Text fontWeight="bold" color="gray.600">Balance</Text>
              <Text fontSize="lg" color={Math.abs(totals.debit - totals.credit) < 0.01 ? "green.500" : "red.500"}>
                ₹{(totals.debit - totals.credit).toFixed(2)}
              </Text>
            </Box>
            
            {Math.abs(totals.debit - totals.credit) >= 0.01 && (
              <Alert status="error">
                Entry is not balanced
              </Alert>
            )}
          </VStack>
        </Card>
      </SimpleGrid>

      <Card>
        <VStack spacing={4} align="stretch">
          <Heading size="md">Entry Lines</Heading>
          
          {entry.entries && entry.entries.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Debit</th>
                    <th style={{ textAlign: 'right' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.entries.map((item, index) => (
                    <tr key={index}>
                      <td>{item.account?.name || item.accountCode}</td>
                      <td>{item.description || '-'}</td>
                      <td style={{ color: item.debit > 0 ? 'red' : 'gray', textAlign: 'right' }}>
                        {item.debit > 0 ? `₹${item.debit.toFixed(2)}` : '-'}
                      </td>
                      <td style={{ color: item.credit > 0 ? 'green' : 'gray', textAlign: 'right' }}>
                        {item.credit > 0 ? `₹${item.credit.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          ) : (
            <Alert status="info">
              No entry lines found
            </Alert>
          )}
        </VStack>
      </Card>
    </VStack>
  );
};

export default JournalEntryDetail; 