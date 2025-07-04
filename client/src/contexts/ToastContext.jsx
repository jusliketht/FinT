import React, { createContext, useContext, useState } from 'react';
import {
  Box,
  Alert,
  VStack,
  IconButton,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, status = 'info', options = {}) => {
    const id = Date.now().toString();
    const newToast = {
      id,
      message,
      status: status === 'error' ? 'error' : status === 'success' ? 'success' : 'info',
      duration: 5000,
      ...options,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, newToast.duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const value = { showToast };
  
  return (
    <ToastContext.Provider value={value}>
      {children}
      <Box
        position="fixed"
        top="20px"
        right="20px"
        zIndex={9999}
        maxW="400px"
      >
        <VStack spacing={2} align="stretch">
          {toasts.map((toast) => (
            <Alert
              key={toast.id}
              status={toast.status}
              borderRadius="md"
              boxShadow="lg"
              p={4}
              position="relative"
            >
              <Box flex="1">
                {toast.message}
              </Box>
              <IconButton
                icon={<CloseIcon />}
                variant="ghost"
                size="sm"
                onClick={() => removeToast(toast.id)}
                position="absolute"
                top="8px"
                right="8px"
              />
            </Alert>
          ))}
        </VStack>
      </Box>
    </ToastContext.Provider>
  );
};

export default ToastContext; 