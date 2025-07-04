import React from 'react';
import { Box, Heading, Text, Button } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minH="60vh"
      textAlign="center"
      p={6}
    >
      <Heading as="h1" size="4xl" mb={4}>
        404
      </Heading>
      <Heading as="h2" size="xl" mb={4}>
        Page Not Found
      </Heading>
      <Text fontSize="lg" color="gray.500" mb={6}>
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </Text>
      <Button
        colorScheme="blue"
        onClick={() => navigate('/')}
        size="lg"
      >
        Go to Homepage
      </Button>
    </Box>
  );
};

export default NotFound; 