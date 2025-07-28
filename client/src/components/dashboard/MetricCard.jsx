import React, { memo } from 'react';
import {
  Box,
  Text,
  Flex,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';

const MetricCard = memo(({ 
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
      borderRadius="2xl"
      boxShadow="fintech-lg"
      color={textColor}
      overflow="hidden"
      position="relative"
      transition="all 0.3s ease"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'fintech-xl',
      }}
    >
      {/* Enhanced Background Pattern */}
      <Box
        position="absolute"
        top="0"
        right="0"
        w="120px"
        h="120px"
        opacity="0.1"
        bg="white"
        borderRadius="full"
        transform="translate(40px, -40px)"
        filter="blur(2px)"
      />
      
      {/* Additional decorative elements */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        w="80px"
        h="80px"
        opacity="0.05"
        bg="white"
        borderRadius="full"
        transform="translate(-20px, 20px)"
        filter="blur(1px)"
      />
      
      <Box p={6}>
        <Flex justify="space-between" align="start" mb={4}>
          <Box flex="1">
            <Text 
              fontSize="sm" 
              fontWeight="medium" 
              opacity={0.9} 
              mb={2}
              textTransform="uppercase"
              letterSpacing="wide"
            >
              {title}
            </Text>
            <Text 
              fontSize="3xl" 
              fontWeight="black" 
              fontFamily="mono" 
              lineHeight="1"
              mb={2}
              textShadow="0 2px 4px rgba(0,0,0,0.1)"
            >
              {isLoading ? '...' : formatValue(value)}
            </Text>
            {change !== undefined && (
              <Flex align="center" mt={3}>
                <Box
                  p={1}
                  borderRadius="full"
                  bg={`${trend === 'up' ? 'green' : 'red'}.400`}
                  opacity="0.2"
                  mr={2}
                >
                  <Icon 
                    as={trend === 'up' ? 'arrow-up' : 'arrow-down'} 
                    color={trendColor} 
                    boxSize={3} 
                  />
                </Box>
                <Text 
                  fontSize="sm" 
                  color={trendColor} 
                  fontWeight="bold"
                  letterSpacing="wide"
                >
                  {formatChange(change, changeType)}
                </Text>
                <Text fontSize="xs" opacity={0.7} ml={2}>
                  vs last period
                </Text>
              </Flex>
            )}
          </Box>
          <Box
            p={3}
            borderRadius="xl"
            bg="white"
            opacity="0.15"
            backdropFilter="blur(10px)"
            border="1px solid"
            borderColor="whiteAlpha.200"
          >
            <Icon as={icon} boxSize={6} opacity="0.9" />
          </Box>
        </Flex>
        
        {/* Enhanced Progress Bar */}
        <Box 
          h="4px" 
          bg="white" 
          opacity="0.2" 
          borderRadius="full" 
          overflow="hidden"
          mt={4}
        >
          <Box 
            h="full" 
            bg="white" 
            opacity="0.8"
            w={trend === 'up' ? '75%' : '35%'}
            transition="width 0.6s ease"
            borderRadius="full"
            boxShadow="0 0 8px rgba(255,255,255,0.5)"
          />
        </Box>
      </Box>
    </Box>
  );
});

MetricCard.displayName = 'MetricCard';

export default MetricCard; 