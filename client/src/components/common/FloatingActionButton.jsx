import React from 'react';
import {
  Box,
  IconButton,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useTransaction } from '../../contexts/TransactionContext';

const FloatingActionButton = () => {
  const { openAddTransaction } = useTransaction();
  const bgColor = useColorModeValue('blue.500', 'blue.400');
  const hoverBg = useColorModeValue('blue.600', 'blue.500');

  return (
    <Box
      position="fixed"
      bottom="24px"
      right="24px"
      zIndex="1000"
    >
      <Tooltip
        label="Add Transaction"
        placement="left"
        hasArrow
      >
        <IconButton
          aria-label="Add transaction"
          icon={<AddIcon />}
          size="lg"
          colorScheme="blue"
          bg={bgColor}
          _hover={{ 
            bg: hoverBg,
            transform: 'scale(1.1)',
            boxShadow: 'xl',
          }}
          _active={{ bg: hoverBg }}
          boxShadow="lg"
          borderRadius="full"
          onClick={openAddTransaction}
          transition="all 0.2s"
        />
      </Tooltip>
    </Box>
  );
};

export default FloatingActionButton; 