import React from 'react';
import {
  Box,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';

export const Loading = () => {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={useColorModeValue('gray.50', 'gray.800')}
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor={useColorModeValue('gray.200', 'gray.600')}
        color={useColorModeValue('brand.500', 'brand.200')}
        size="xl"
      />
    </Box>
  );
}; 