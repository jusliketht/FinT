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

const AccountCategoriesViewer = () => {
  const api = useApi();
  const { showToast } = useToast();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/account-categories');
      setCategories(response.data);
    } catch (error) {
      showToast('Failed to fetch account categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Text>Loading account categories...</Text>;
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Account Categories</Heading>
        
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <Table variant="simple">
          <thead>
            <tr>
              <th>Name</th>
              <th>Account Type</th>
              <th>Accounts</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>
                  <Badge colorScheme="blue">{category.accountType?.label || 'N/A'}</Badge>
                </td>
                <td>{category.accounts?.length || 0}</td>
                <td>{new Date(category.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default AccountCategoriesViewer; 