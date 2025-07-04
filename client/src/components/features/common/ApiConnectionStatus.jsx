import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  Text, 
  List, 
  ListItem, 
  Button,
  Spinner,
  HStack,
  VStack
} from '@chakra-ui/react';
import { CheckIcon, WarningIcon, RepeatIcon } from '@chakra-ui/icons';
import testAllConnections from '../../../services/testConnections';

const ApiConnectionStatus = () => {
  const [connectionResults, setConnectionResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    setLoading(true);
    try {
      const results = await testAllConnections();
      setConnectionResults(results);
    } catch (error) {
      console.error('Error testing connections:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !connectionResults) {
    return (
      <Box display="flex" justifyContent="center" p={6}>
        <Spinner size="lg" />
      </Box>
    );
  }

  if (!connectionResults) {
    return (
      <Card p={6}>
        <Text>No connection data available</Text>
      </Card>
    );
  }

  const getStatusIcon = (status) => {
    return status === 'success' ? (
      <CheckIcon color="green.500" />
    ) : (
      <WarningIcon color="red.500" />
    );
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'green.500' : 'red.500';
  };

  return (
    <Card p={6}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            API Connection Status
          </Text>
          <Button
            size="sm"
            leftIcon={<RepeatIcon />}
            onClick={checkConnections}
            isLoading={loading}
          >
            Refresh
          </Button>
        </HStack>

        <List spacing={3}>
          {Object.entries(connectionResults).map(([service, result]) => (
            <ListItem key={service}>
              <HStack>
                {getStatusIcon(result.status) && React.createElement(getStatusIcon(result.status))}
                <Text flex={1}>{service}</Text>
                <Text color={getStatusColor(result.status)} fontSize="sm">
                  {result.status === 'success' ? 'Connected' : 'Failed'}
                </Text>
              </HStack>
              {result.error && (
                <Text fontSize="sm" color="red.500" ml={6}>
                  {result.error}
                </Text>
              )}
            </ListItem>
          ))}
        </List>
      </VStack>
    </Card>
  );
};

export default ApiConnectionStatus;