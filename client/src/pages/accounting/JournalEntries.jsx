import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  IconButton,
  Alert,
  Spinner,
  HStack,
  VStack,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import JournalEntryForm from '../../components/features/journal/JournalEntryForm';
import journalEntryService from '../../services/journalEntryService';
import { useToast } from '../../contexts/ToastContext';

const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const data = await journalEntryService.getAll();
      setEntries(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch journal entries');
      console.error('Error fetching journal entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setSelectedEntry(null);
    onOpen();
  };

  const handleEditClick = (entry) => {
    setSelectedEntry(entry);
    onOpen();
  };

  const handleModalClose = () => {
    onClose();
    setSelectedEntry(null);
  };

  const handleSuccess = () => {
    handleModalClose();
    fetchEntries();
  };

  const handleDeleteClick = async (entry) => {
    if (!window.confirm(`Are you sure you want to delete journal entry "${entry.reference}"?`)) {
      return;
    }
    
    setLoading(true);
    try {
      await journalEntryService.delete(entry.id);
      fetchEntries();
      showToast('Journal entry deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting journal entry:', err);
      showToast(err.response?.data?.message || 'Failed to delete journal entry', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <Box p={6}>
      <HStack justify="space-between" align="center" mb={6}>
        <Heading as="h1" size="lg">
          Journal Entries
        </Heading>
        <Button 
          colorScheme="blue" 
          leftIcon={<AddIcon />} 
          onClick={handleAddClick}
          isDisabled={loading}
        >
          Add Entry
        </Button>
      </HStack>

      {error && (
        <Alert status="error" mb={6}>
          {error}
        </Alert>
      )}

      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f7fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Reference</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Debit</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Credit</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && entries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '12px' }}>
                    <Spinner size="sm" />
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '12px' }}>
                    No journal entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{formatDate(entry.date)}</td>
                    <td style={{ padding: '12px' }}>{entry.reference}</td>
                    <td style={{ padding: '12px' }}>{entry.description}</td>
                    <td style={{ padding: '12px' }}>{formatAmount(entry.debitTotal || 0)}</td>
                    <td style={{ padding: '12px' }}>{formatAmount(entry.creditTotal || 0)}</td>
                    <td style={{ padding: '12px' }}>
                      <Box
                        px={2}
                        py={1}
                        borderRadius="full"
                        fontSize="sm"
                        fontWeight="medium"
                        bg={entry.status === 'posted' ? 'green.100' : 'yellow.100'}
                        color={entry.status === 'posted' ? 'green.800' : 'yellow.800'}
                      >
                        {entry.status}
                      </Box>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px' }}>
                      <IconButton 
                        size="sm"
                        icon={<ViewIcon />}
                        onClick={() => handleEditClick(entry)}
                        isDisabled={loading}
                        aria-label="View entry"
                      />
                      <IconButton 
                        size="sm"
                        icon={<EditIcon />}
                        onClick={() => handleEditClick(entry)}
                        isDisabled={loading || entry.status === 'posted'}
                        aria-label="Edit entry"
                        ml={2}
                      />
                      <IconButton 
                        size="sm"
                        icon={<DeleteIcon />}
                        onClick={() => handleDeleteClick(entry)}
                        isDisabled={loading || entry.status === 'posted'}
                        aria-label="Delete entry"
                        colorScheme="red"
                        ml={2}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      {/* Add/Edit Dialog */}
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <Box
            bg="white"
            borderRadius="lg"
            p={6}
            maxW="90vw"
            w="full"
            maxH="90vh"
            overflowY="auto"
          >
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              {selectedEntry ? 'Edit Journal Entry' : 'Add Journal Entry'}
            </Text>
            
            <JournalEntryForm
              entry={selectedEntry}
              onSuccess={handleSuccess}
              onCancel={handleModalClose}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default JournalEntries; 