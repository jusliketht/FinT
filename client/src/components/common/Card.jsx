import React from 'react';
import { Box, Card as ChakraCard, CardHeader, CardBody, CardFooter } from '@chakra-ui/react';

const Card = ({ 
  children, 
  header,
  footer,
  variant = 'outline',
  padding = 6,
  shadow = 'sm',
  borderRadius = 'lg',
  ...props 
}) => {
  const cardStyles = {
    borderRadius,
    boxShadow: shadow,
    border: variant === 'outline' ? '1px solid' : 'none',
    borderColor: variant === 'outline' ? 'gray.200' : 'transparent',
    bg: 'white',
    overflow: 'hidden',
  };

  return (
    <ChakraCard {...cardStyles} {...props}>
      {header && (
        <CardHeader pb={0}>
          {header}
        </CardHeader>
      )}
      <CardBody p={padding}>
        {children}
      </CardBody>
      {footer && (
        <CardFooter pt={0}>
          {footer}
        </CardFooter>
      )}
    </ChakraCard>
  );
};

export default Card; 