import { Box, useColorModeValue } from '@chakra-ui/react';

// Common color mode values
export const useCommonColors = () => ({
  bgColor: useColorModeValue('white', 'gray.700'),
  borderColor: useColorModeValue('gray.200', 'gray.600'),
  textColor: useColorModeValue('gray.600', 'gray.300'),
  brandColor: useColorModeValue('brand.500', 'brand.400'),
  inputBg: useColorModeValue('gray.50', 'gray.800'),
  cardBg: useColorModeValue('white', 'gray.700'),
  errorBg: useColorModeValue('gray.100', 'gray.700'),
  navBg: useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)'),
  footerBg: useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)'),
});

// Common card container
export const Card = ({ children, ...props }) => {
  const { bgColor, borderColor } = useCommonColors();
  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      {...props}
    >
      {children}
    </Box>
  );
};

// Common form container
export const FormContainer = ({ children, ...props }) => {
  const { bgColor, borderColor } = useCommonColors();
  return (
    <Box
      w="full"
      maxW="400px"
      p={8}
      borderRadius="xl"
      boxShadow="xl"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      {...props}
    >
      {children}
    </Box>
  );
}; 