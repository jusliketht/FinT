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
import accountTypeService from '../../../services/accountTypeService';

const AccountTypesViewer = () => {
  const [accountTypes, setAccountTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAccountTypes();
  }, []);

  const fetchAccountTypes = async () => {
    setLoading(true);
    try {
      const data = await accountTypeService.getAll();
      setAccountTypes(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch account types: ' + (err.message || 'Unknown error'));
      console.error('Error fetching account types:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Account Types from Database
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
      ) : accountTypes.length === 0 ? (
        <Alert severity="info">No account types found in the database</Alert>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Label</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Categories</TableCell>
              <TableCell>Created At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accountTypes.map(type => (
              <TableRow key={type.id}>
                <TableCell>{type.label}</TableCell>
                <TableCell>{type.value}</TableCell>
                <TableCell>
                  {type.categories && type.categories.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {type.categories.map(category => (
                        <Chip key={category.id} label={category.name} size="small" />
                      ))}
                    </Box>
                  ) : (
                    'No categories'
                  )}
                </TableCell>
                <TableCell>{new Date(type.createdAt).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
};

export default AccountTypesViewer; 