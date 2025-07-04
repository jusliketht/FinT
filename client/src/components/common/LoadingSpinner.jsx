import React from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="200px"
      gap={4}
    >
      <Spinner size="lg" />
      <Text color="gray.600" fontSize="sm">
        {message}
      </Text>
    </Box>
  );
};

export default LoadingSpinner; 