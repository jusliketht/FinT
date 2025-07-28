import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text, 
  Table,
  Badge
} from '@chakra-ui/react';
import { useApi } from '../../../hooks/useApi';
import { useToast } from '../../../contexts/ToastContext';
import accountTypeService from '../../../services/accountTypeService';

const AccountTypesViewer = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchAccountTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountTypeService.getAll();
      setAccountTypes(response.data || response);
    } catch (err) {
      setError('Failed to fetch account types');
      toast({
        title: 'Error',
        description: 'Failed to load account types',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAccountTypes();
  }, [fetchAccountTypes]);

  if (loading) {
    return <Text>Loading account types...</Text>;
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Account Types</Heading>
        
      <Table variant="simple">
        <thead>
          <tr>
            <th>Value</th>
            <th>Label</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {accountTypes.map((type) => (
            <tr key={type.id}>
              <td>{type.value}</td>
              <td>{type.label}</td>
              <td>
                <Badge colorScheme="green">Active</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  );
};

export default AccountTypesViewer;