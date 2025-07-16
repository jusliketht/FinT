import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import BusinessList from '../../components/business/BusinessList';

const BusinessManagement = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <BusinessList />
    </Container>
  );
};

export default BusinessManagement;