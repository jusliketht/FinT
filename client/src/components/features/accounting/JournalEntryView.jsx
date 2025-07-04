import React from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Text,
  Box,
  Grid,
  Tag,
  VStack,
  HStack
} from '@chakra-ui/react';
import { format } from 'date-fns';

const JournalEntryView = ({
  open,
  onClose,
  entry,
  accounts,
  onEdit,
  onDelete
}) => {
  if (!open || !entry) return null;

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.name}` : 'Unknown Account';
  };

  const calculateTotals = () => {
    const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();

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
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="md"
        p={6}
        maxW="6xl"
        w="90%"
        maxH="90vh"
        overflow="auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Box mb={4}>
          <Text fontSize="xl" fontWeight="bold">Journal Entry Details</Text>
        </Box>
        
        <VStack spacing={6} align="stretch">
          <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
            <Box>
              <Text fontWeight="bold" mb={2}>Entry Information</Text>
              <VStack align="start" spacing={1}>
                <Text><strong>Entry Number:</strong> {entry.entryNumber}</Text>
                <Text><strong>Date:</strong> {format(new Date(entry.date), 'MMM dd, yyyy')}</Text>
                <Text><strong>Reference:</strong> {entry.reference || 'N/A'}</Text>
                <Text><strong>Description:</strong> {entry.description}</Text>
              </VStack>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={2}>Status & Totals</Text>
              <VStack align="start" spacing={1}>
                <HStack>
                  <Text><strong>Status:</strong></Text>
                  <Tag colorScheme={getStatusColor(entry.status)}>
                    {entry.status}
                  </Tag>
                </HStack>
                <Text><strong>Total Debit:</strong> ${totalDebit.toFixed(2)}</Text>
                <Text><strong>Total Credit:</strong> ${totalCredit.toFixed(2)}</Text>
                <Text color={totalDebit === totalCredit ? 'green.500' : 'red.500'}>
                  <strong>Balance:</strong> {totalDebit === totalCredit ? 'Balanced' : 'Unbalanced'}
                </Text>
              </VStack>
            </Box>
          </Grid>

          <Box>
            <Text fontWeight="bold" mb={4}>Entry Lines</Text>
            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Account</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>Debit</th>
                    <th style={{ textAlign: 'right', padding: '8px', fontWeight: 'bold' }}>Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {entry.lines.map((line, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f7fafc' }}>
                      <td style={{ padding: '8px' }}>{getAccountName(line.accountId)}</td>
                      <td style={{ padding: '8px' }}>{line.description || '-'}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{line.debit ? `$${line.debit.toFixed(2)}` : '-'}</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>{line.credit ? `$${line.credit.toFixed(2)}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        </VStack>
        
        <HStack spacing={3} mt={6} justifyContent="flex-end">
          <Button variant="outline" onClick={onEdit}>
            Edit Entry
          </Button>
          <Button colorScheme="red" variant="outline" onClick={onDelete}>
            Delete Entry
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </HStack>
      </Box>
    </Box>
  );
};

JournalEntryView.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entry: PropTypes.object,
  accounts: PropTypes.array.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

export default JournalEntryView;