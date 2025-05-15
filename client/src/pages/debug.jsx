import React from 'react';
import { Container, Typography, Box, Grid } from '@mui/material';
import ApiConnectionStatus from '../components/features/common/ApiConnectionStatus';
import AccountTypesViewer from '../components/features/account-types/AccountTypesViewer';
import AccountCategoriesViewer from '../components/features/account-categories/AccountCategoriesViewer';

const Debug = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          API Debug & Connectivity Test
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ApiConnectionStatus />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <AccountTypesViewer />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <AccountCategoriesViewer />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Debug; 