import React from 'react';
import { Box, Spinner, Text } from '@chakra-ui/react';

const LoadingScreen = () => {
  const bgColor = 'white';

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      bg={bgColor}
    >
      <Spinner
        size="xl"
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
      />
      <Text
        fontSize="xl"
        mt={4}
        color="gray.600"
      >
        Loading...
      </Text>
    </Box>
  );
};

export default LoadingScreen; 