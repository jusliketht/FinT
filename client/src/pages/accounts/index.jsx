import React from 'react';
import { Box, Container } from '@mui/material';
import { AccountsManager } from '../../components/features';

const AccountsPage = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ pt: 4, pb: 6 }}>
        <AccountsManager />
      </Box>
    </Container>
  );
};

export default AccountsPage; 