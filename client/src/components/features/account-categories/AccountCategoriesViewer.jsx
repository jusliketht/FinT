import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import accountCategoryService from '../../../services/accountCategoryService';

const AccountCategoriesViewer = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await accountCategoryService.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch account categories: ' + (err.message || 'Unknown error'));
      console.error('Error fetching account categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Account Categories from Database
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Alert severity="info">No account categories found in the database</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Account Type</TableCell>
              <TableCell>Accounts</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map(category => (
              <TableRow key={category.id}>
                <TableCell>{category.name}</TableCell>
                <TableCell>
                  {category.type ? (
                    <Chip label={`${category.type.label} (${category.type.value})`} color="primary" size="small" />
                  ) : (
                    'Unknown Type'
                  )}
                </TableCell>
                <TableCell>
                  {category.accounts && category.accounts.length > 0 ? (
                    <Typography variant="body2">
                      {category.accounts.length} accounts
                    </Typography>
                  ) : (
                    'No accounts'
                  )}
                </TableCell>
                <TableCell>{new Date(category.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default AccountCategoriesViewer; 