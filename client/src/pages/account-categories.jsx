import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { AccountCategoriesManager } from '../components/features';

const AccountCategoriesPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 6 }}>
        <AccountCategoriesManager />
      </Box>
    </Container>
  );
};

export default AccountCategoriesPage; 