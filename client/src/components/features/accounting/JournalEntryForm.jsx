import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  Select,
  Textarea,
  IconButton
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { useToast } from '../../../contexts/ToastContext';

const JournalEntryForm = ({
  open,
  onClose,
  onSubmit,
  entry,
  accounts,
  loading = false
}) => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    status: 'draft',
    lines: []
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        reference: entry.reference || '',
        description: entry.description || '',
        status: entry.status || 'draft',
        lines: entry.lines || []
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        description: '',
        status: 'draft',
        lines: []
      });
    }
  }, [entry]);

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, {
        accountId: '',
        description: '',
        debit: 0,
        credit: 0
      }]
    }));
  };

  const removeLine = (index) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }));
  };

  const updateLine = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  const calculateTotals = () => {
    const totalDebit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
    return { totalDebit, totalCredit };
  };

  const handleSubmit = () => {
    const { totalDebit, totalCredit } = calculateTotals();
    
    if (totalDebit !== totalCredit) {
      showToast('Total debits must equal total credits.', 'error');
      return;
    }

    if (formData.lines.length === 0) {
      showToast('Please add at least one line to the journal entry.', 'error');
      return;
    }

    onSubmit(formData);
  };

  const { totalDebit, totalCredit } = calculateTotals();

  if (!open) return null;

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
          <Text fontSize="xl" fontWeight="bold">{entry ? 'Edit Journal Entry' : 'New Journal Entry'}</Text>
        </Box>
        
        <VStack spacing={6} align="stretch">
          <HStack spacing={4}>
            <Box>
              <Text>Date</Text>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </Box>
            
            <Box>
              <Text>Reference</Text>
              <Input
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                placeholder="Reference number"
              />
            </Box>
            
            <Box>
              <Text>Status</Text>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
              </Select>
            </Box>
          </HStack>

          <Box>
            <Text>Description</Text>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Entry description"
              rows={3}
            />
          </Box>

          <Box>
            <HStack justify="space-between" mb={4}>
              <Text fontWeight="bold">Entry Lines</Text>
              <Button
                leftIcon={<AddIcon />}
                size="sm"
                onClick={addLine}
              >
                Add Line
              </Button>
            </HStack>

            <Box overflowX="auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Account</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Description</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Debit</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Credit</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lines.map((line, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f7fafc' }}>
                      <td style={{ padding: '8px' }}>
                        <Select
                          value={line.accountId}
                          onChange={(e) => updateLine(index, 'accountId', e.target.value)}
                          placeholder="Select account"
                        >
                          {accounts.map(account => (
                            <option key={account.id} value={account.id}>
                              {account.code} - {account.name}
                            </option>
                          ))}
                        </Select>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          placeholder="Line description"
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.debit}
                          onChange={(e) => updateLine(index, 'debit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={line.credit}
                          onChange={(e) => updateLine(index, 'credit', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                        />
                      </td>
                      <td style={{ padding: '8px' }}>
                        <IconButton
                          size="sm"
                          icon={<DeleteIcon />}
                          onClick={() => removeLine(index)}
                          colorScheme="red"
                          variant="ghost"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>

          <Box p={4} bg="gray.50" borderRadius="md">
            <Text fontWeight="bold">Totals:</Text>
            <HStack spacing={6}>
              <Text><strong>Total Debit:</strong> ${totalDebit.toFixed(2)}</Text>
              <Text><strong>Total Credit:</strong> ${totalCredit.toFixed(2)}</Text>
              <Text color={totalDebit === totalCredit ? 'green.500' : 'red.500'}>
                <strong>Balance:</strong> {totalDebit === totalCredit ? 'Balanced' : 'Unbalanced'}
              </Text>
            </HStack>
          </Box>
        </VStack>
        
        <HStack spacing={3} mt={6} justifyContent="flex-end">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>{entry ? 'Update' : 'Create'}</Button>
        </HStack>
      </Box>
    </Box>
  );
};

JournalEntryForm.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  entry: PropTypes.object,
  accounts: PropTypes.array.isRequired,
  loading: PropTypes.bool
};

export default JournalEntryForm;