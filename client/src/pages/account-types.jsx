import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { AccountTypesManager } from '../components/features';

const AccountTypesPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 6 }}>
        <AccountTypesManager />
      </Box>
    </Container>
  );
};

export default AccountTypesPage; 