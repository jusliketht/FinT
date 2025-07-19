import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import MainLayout from './MainLayout';

const Layout = ({ children }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <MainLayout>{children}</MainLayout>
    </Box>
  );
};

export default Layout; 