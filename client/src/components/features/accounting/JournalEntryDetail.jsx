import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  IconButton,
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../../contexts/BusinessContext';
import { useToast } from '../../../contexts/ToastContext';

const JournalEntryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJournalEntry = useCallback(async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockEntry = {
        id: id,
        entryNumber: 'JE-2025-001',
        date: '2025-01-01',
        description: 'Opening balance entry',
        reference: 'OB-001',
        totalAmount: 10000.00,
        status: 'POSTED',
        lines: [
          {
            id: '1',
            accountId: '1',
            accountName: 'Cash',
            debit: 10000.00,
            credit: 0.00,
            description: 'Opening cash balance'
          },
          {
            id: '2',
            accountId: '2',
            accountName: 'Opening Balance Equity',
            debit: 0.00,
            credit: 10000.00,
            description: 'Opening equity balance'
          }
        ],
        attachments: [],
        createdBy: 'John Doe',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      };
      
      setEntry(mockEntry);
    } catch (err) {
      setError('Failed to fetch journal entry');
      showToast('error', 'Failed to fetch journal entry');
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    if (id && selectedBusiness) {
      fetchJournalEntry();
    }
  }, [id, selectedBusiness, fetchJournalEntry]);

  const handleEdit = () => {
    navigate(`/journal/edit/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        // Mock delete - replace with actual API call
        showToast('success', 'Journal entry deleted successfully');
        navigate('/journal');
      } catch (err) {
        showToast('error', 'Failed to delete journal entry');
      }
    }
  };

  const handleBack = () => {
    navigate('/journal');
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading journal entry...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!entry) {
    return (
      <Alert status="info">
        <AlertIcon />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>Journal entry not found.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <HStack spacing={4}>
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={handleBack}
              variant="ghost"
              aria-label="Go back"
            />
            <VStack align="start" spacing={1}>
              <Text fontSize="2xl" fontWeight="bold">
                Journal Entry: {entry.entryNumber}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Created on {new Date(entry.createdAt).toLocaleDateString()}
              </Text>
            </VStack>
          </HStack>
          
          <HStack spacing={2}>
            <Button
              leftIcon={<EditIcon />}
              colorScheme="blue"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              variant="outline"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </HStack>
        </HStack>

        {/* Entry Details */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Entry Details
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="medium">Date:</Text>
                <Text>{new Date(entry.date).toLocaleDateString()}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Description:</Text>
                <Text>{entry.description}</Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Reference:</Text>
                <Badge variant="outline">{entry.reference}</Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Status:</Text>
                <Badge
                  colorScheme={entry.status === 'POSTED' ? 'green' : 'yellow'}
                  variant="subtle"
                >
                  {entry.status}
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Total Amount:</Text>
                <Text fontWeight="bold" fontSize="lg">
                  ₹{entry.totalAmount.toLocaleString()}
                </Text>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontWeight="medium">Created By:</Text>
                <Text>{entry.createdBy}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Entry Lines */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="semibold">
              Entry Lines ({entry.lines.length})
            </Text>
          </CardHeader>
          <CardBody>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Account</Th>
                  <Th>Description</Th>
                  <Th isNumeric>Debit</Th>
                  <Th isNumeric>Credit</Th>
                </Tr>
              </Thead>
              <Tbody>
                {entry.lines.map((line) => (
                  <Tr key={line.id}>
                    <Td>
                      <Text fontWeight="medium">{line.accountName}</Text>
                    </Td>
                    <Td>
                      <Text fontSize="sm" color="gray.600">
                        {line.description}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      {line.debit > 0 ? (
                        <Text color="green.600" fontWeight="semibold">
                          ₹{line.debit.toLocaleString()}
                        </Text>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                    <Td isNumeric>
                      {line.credit > 0 ? (
                        <Text color="red.600" fontWeight="semibold">
                          ₹{line.credit.toLocaleString()}
                        </Text>
                      ) : (
                        <Text color="gray.400">-</Text>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Attachments */}
        {entry.attachments && entry.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="semibold">
                Attachments ({entry.attachments.length})
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={2} align="stretch">
                {entry.attachments.map((attachment, index) => (
                  <HStack key={index} justify="space-between" p={2} border="1px" borderColor="gray.200" borderRadius="md">
                    <Text>{attachment.name}</Text>
                    <Button size="sm" variant="ghost">
                      Download
                    </Button>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
};

export default JournalEntryDetail; 