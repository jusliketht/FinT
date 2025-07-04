import React from 'react';
import { Card, CardBody, Text, Box, Icon, HStack } from '@chakra-ui/react';

const StatCard = ({ title, value, icon, color, trend, trendValue }) => {
  const bgColor = 'white';
  const iconBgColor = color ? `${color}.100` : 'blue.100';
  const iconColor = color || 'blue.500';
  const trendColor = trend === 'up' ? 'green.500' : 'red.500';

  return (
    <Card
      h="100%"
      display="flex"
      flexDirection="column"
      transition="all 0.3s ease-in-out"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg',
      }}
      bg={bgColor}
    >
      <CardBody>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="48px"
          h="48px"
          borderRadius="50%"
          bg={iconBgColor}
          mb={4}
        >
          <Icon
            as={icon}
            color={iconColor}
            boxSize={6}
          />
        </Box>
        <Text fontSize="2xl" fontWeight="bold" mb={2}>
          {value}
        </Text>
        <Text fontSize="sm" color="gray.500" mb={2}>
          {title}
        </Text>
        {trend && (
          <HStack spacing={1} mt={2} color={trendColor}>
            <Text fontSize="sm">
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </Text>
            <Text fontSize="sm">vs last month</Text>
          </HStack>
        )}
      </CardBody>
    </Card>
  );
};

export default StatCard; 