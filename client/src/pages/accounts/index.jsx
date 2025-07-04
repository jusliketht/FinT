import React from 'react';
import { Container } from '@chakra-ui/react';
import FinancialAccountsPage from './FinancialAccountsPage';

const AccountsPage = () => {
  return (
    <Container maxW="container.xl" py={6}>
      <FinancialAccountsPage />
    </Container>
  );
};

export default AccountsPage;