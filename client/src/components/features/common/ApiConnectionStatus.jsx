import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Button,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import testAllConnections from '../../../services/testConnections';

const ApiConnectionStatus = () => {
  const [connectionResults, setConnectionResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    setLoading(true);
    try {
      const results = await testAllConnections();
      setConnectionResults(results);
    } catch (error) {
      console.error('Error testing connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !connectionResults) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">API Connection Status</Typography>
        <Button 
          startIcon={<RefreshIcon />} 
          onClick={checkConnections}
          disabled={loading}
        >
          {loading ? 'Checking...' : 'Check Connections'}
        </Button>
      </Box>
      
      {connectionResults && (
        <List>
          {Object.entries(connectionResults).map(([key, result]) => (
            <ListItem key={key} divider>
              <ListItemIcon>
                {result.success ? (
                  <CheckCircleIcon color="success" />
                ) : (
                  <ErrorIcon color="error" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary={`${key.charAt(0).toUpperCase() + key.slice(1)}`} 
                secondary={result.success ? 
                  `Connected successfully (${result.data?.length || 0} items)` : 
                  `Error: ${result.error}`
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default ApiConnectionStatus; 