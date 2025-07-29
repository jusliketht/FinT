import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Tag,
  HStack,
  VStack,
  IconButton
} from '@chakra-ui/react';
import { AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import journalEntryService from '../../services/journalEntryService';
import { useToast } from '../../contexts/ToastContext';

const JournalEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await journalEntryService.getAll();
      setEntries(data);
    } catch (error) {
      showToast('Failed to fetch journal entries', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'posted':
        return 'green';
      case 'draft':
        return 'orange';
      case 'void':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Journal Entries</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => navigate('/journal/new')}
          >
            New Entry
          </Button>
        </HStack>

        <Box overflowX="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f7fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Entry Number</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Reference</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Total</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{entry.entryNumber}</td>
                  <td style={{ padding: '12px' }}>{new Date(entry.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{entry.reference || '-'}</td>
                  <td style={{ padding: '12px' }}>{entry.description}</td>
                  <td style={{ padding: '12px' }}>
                    <Tag colorScheme={getStatusColor(entry.status)}>
                      {entry.status}
                    </Tag>
                  </td>
                  <td style={{ padding: '12px' }}>${entry.total?.toFixed(2) || '0.00'}</td>
                  <td style={{ padding: '12px' }}>
                    <HStack spacing={2}>
                      <IconButton
                        size="sm"
                        icon={<ViewIcon />}
                        aria-label="View entry"
                        variant="ghost"
                        onClick={() => navigate(`/journal/${entry.id}`)}
                      />
                      <IconButton
                        size="sm"
                        icon={<EditIcon />}
                        aria-label="Edit entry"
                        variant="ghost"
                        onClick={() => navigate(`/journal/${entry.id}/edit`)}
                      />
                    </HStack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      </VStack>
    </Box>
  );
};

export default JournalEntries;