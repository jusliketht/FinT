import { Box } from '@chakra-ui/react';

export const themeColors = {
  bgColor: 'white',
  borderColor: 'gray.200',
  textColor: 'gray.600',
  brandColor: 'blue.500',
  inputBg: 'gray.50',
  cardBg: 'white',
  errorBg: 'gray.100',
  navBg: 'rgba(255, 255, 255, 0.8)',
  footerBg: 'rgba(255, 255, 255, 0.9)',
};

// Common card container
export const Card = ({ children, ...props }) => {
  const { bgColor, borderColor } = themeColors;
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
  const { bgColor, borderColor } = themeColors;
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