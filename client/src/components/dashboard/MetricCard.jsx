import React from 'react';
import {
  Box,
  Text,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

const MetricCard = ({ 
  title, 
  value, 
  gradient, 
  icon, 
  trend, 
  change, 
  changeType = 'percentage',
  isLoading = false 
}) => {
  const textColor = useColorModeValue('white', 'white');
  const trendColor = trend === 'up' ? 'green.300' : 'red.300';

  const formatValue = (val) => {
    if (typeof val === 'number') {
      return `₹${val.toLocaleString()}`;
    }
    return val;
  };

  const formatChange = (val, type) => {
    if (type === 'percentage') {
      return `${val > 0 ? '+' : ''}${val}%`;
    }
    return formatValue(val);
  };

  return (
    <Box
      bg={gradient}
      borderRadius="xl"
      boxShadow="lg"
      color={textColor}
      overflow="hidden"
      position="relative"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'xl',
      }}
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        top="0"
        right="0"
        w="100px"
        h="100px"
        opacity="0.1"
        bg="white"
        borderRadius="full"
        transform="translate(30px, -30px)"
      />
      
      <Box p={6}>
        <Flex justify="space-between" align="start" mb={4}>
          <Box flex="1">
            <Text fontSize="sm" fontWeight="medium" opacity={0.9} mb={1}>
              {title}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" fontFamily="mono" lineHeight="1">
              {isLoading ? '...' : formatValue(value)}
            </Text>
            {change !== undefined && (
              <Flex align="center" mt={2}>
                <Icon 
                  as={trend === 'up' ? 'arrow-up' : 'arrow-down'} 
                  color={trendColor} 
                  boxSize={3} 
                  mr={1} 
                />
                <Text fontSize="sm" color={trendColor} fontWeight="medium">
                  {formatChange(change, changeType)}
                </Text>
                <Text fontSize="xs" opacity={0.7} ml={1}>
                  vs last period
                </Text>
              </Flex>
            )}
          </Box>
          <Icon as={icon} boxSize={8} opacity={0.8} />
        </Flex>
        
        {/* Progress Bar */}
        <Box 
          h="3px" 
          bg="white" 
          opacity={0.2} 
          borderRadius="full" 
          overflow="hidden"
        >
          <Box 
            h="full" 
            bg="white" 
            opacity={0.6}
            w={trend === 'up' ? '70%' : '30%'}
            transition="width 0.3s ease"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default MetricCard; 