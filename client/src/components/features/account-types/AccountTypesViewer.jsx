import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text, 
  Table,
  Badge
} from '@chakra-ui/react';
import { useApi } from '../../../hooks/useApi';
import { useToast } from '../../../contexts/ToastContext';

const AccountTypesViewer = () => {
  const api = useApi();
  const { showToast } = useToast();

  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountTypes();
  }, []);

  const fetchAccountTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/account-types');
      setAccountTypes(response.data);
    } catch (error) {
      showToast('Failed to fetch account types', 'error');
    } finally {
      setLoading(false);
    }
  };

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