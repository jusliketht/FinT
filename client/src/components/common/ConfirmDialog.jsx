import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Text
} from '@chakra-ui/react';

const ConfirmDialog = ({ 
  open, 
  onClose, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  confirmColorScheme = 'red',
  sx = {} 
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!open) return null;

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="blackAlpha.600"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        borderRadius="lg"
        p={6}
        maxW="400px"
        w="full"
        {...sx}
      >
        <Text fontSize="lg" fontWeight="bold" mb={4}>
          {title}
        </Text>
        
        <Text mb={6} color="gray.600">
          {message}
        </Text>
        
        <Box display="flex" justifyContent="flex-end" gap={3}>
          <Button variant="ghost" onClick={handleClose}>
            {cancelText}
          </Button>
          <Button colorScheme={confirmColorScheme} onClick={handleConfirm}>
            {confirmText}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  message: PropTypes.node.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmColorScheme: PropTypes.string,
  sx: PropTypes.object
};

export default ConfirmDialog; 