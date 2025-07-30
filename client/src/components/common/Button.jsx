import React from 'react';
import { Button as ChakraButton } from '@chakra-ui/react';

const Button = ({ 
  children, 
  variant = 'solid',
  colorScheme = 'blue',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  ...props 
}) => {
  // Enhanced button styling with better visibility
  const buttonStyles = {
    // Base styles for better visibility
    fontWeight: 'medium',
    borderRadius: 'lg',
    transition: 'all 0.2s',
    _hover: {
      transform: 'translateY(-1px)',
      boxShadow: 'md',
    },
    _active: {
      transform: 'translateY(0)',
    },
    _focus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
    },
    // Ensure proper contrast and visibility
    _disabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },
  };

  return (
    <ChakraButton
      variant={variant}
      colorScheme={colorScheme}
      size={size}
      isLoading={isLoading}
      isDisabled={isDisabled}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onClick={onClick}
      type={type}
      {...buttonStyles}
      {...props}
    >
      {children}
    </ChakraButton>
  );
};

export default Button; 