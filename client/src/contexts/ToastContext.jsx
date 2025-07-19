import React, { createContext, useContext, useState, useCallback } from 'react';
import { useToast as useChakraToast } from '@chakra-ui/react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const chakraToast = useChakraToast();
  const [notificationHistory, setNotificationHistory] = useState([]);

  const addToHistory = useCallback((notification) => {
    setNotificationHistory(prev => [
      {
        id: Date.now(),
        timestamp: new Date(),
        ...notification,
      },
      ...prev.slice(0, 49), // Keep only last 50 notifications
    ]);
  }, []);

  const showToast = useCallback((message, type = 'info', options = {}) => {
    const toastConfig = {
      title: options.title || getDefaultTitle(type),
      description: message,
      status: type,
      duration: options.duration || 5000,
      isClosable: true,
      position: 'top-right',
      variant: 'solid',
      ...options,
    };

    // Add to history for important notifications
    if (type === 'error' || options.important) {
      addToHistory({
        message,
        type,
        title: toastConfig.title,
        ...options,
      });
    }

    chakraToast(toastConfig);
  }, [chakraToast, addToHistory]);

  const showSuccess = useCallback((message, options = {}) => {
    showToast(message, 'success', options);
  }, [showToast]);

  const showError = useCallback((message, options = {}) => {
    showToast(message, 'error', options);
  }, [showToast]);

  const showWarning = useCallback((message, options = {}) => {
    showToast(message, 'warning', options);
  }, [showToast]);

  const showInfo = useCallback((message, options = {}) => {
    showToast(message, 'info', options);
  }, [showToast]);

  // Specific notification types for common actions
  const showTransactionCreated = useCallback((transaction) => {
    showSuccess(`Transaction "${transaction.description}" created successfully`, {
      title: 'Transaction Created',
      action: {
        text: 'View',
        onClick: () => window.location.href = `/transactions/${transaction.id}`,
      },
    });
  }, [showSuccess]);

  const showTransactionUpdated = useCallback((transaction) => {
    showSuccess(`Transaction "${transaction.description}" updated successfully`, {
      title: 'Transaction Updated',
    });
  }, [showSuccess]);

  const showTransactionDeleted = useCallback((transaction) => {
    showSuccess(`Transaction "${transaction.description}" deleted successfully`, {
      title: 'Transaction Deleted',
    });
  }, [showSuccess]);

  const showInvoiceCreated = useCallback((invoice) => {
    showSuccess(`Invoice ${invoice.invoiceNumber} created successfully`, {
      title: 'Invoice Created',
      action: {
        text: 'View',
        onClick: () => window.location.href = `/invoices/${invoice.id}`,
      },
    });
  }, [showSuccess]);

  const showInvoiceSent = useCallback((invoice) => {
    showInfo(`Invoice ${invoice.invoiceNumber} sent to ${invoice.customer}`, {
      title: 'Invoice Sent',
    });
  }, [showInfo]);

  const showInvoicePaid = useCallback((invoice) => {
    showSuccess(`Invoice ${invoice.invoiceNumber} marked as paid`, {
      title: 'Invoice Paid',
    });
  }, [showSuccess]);

  const showBusinessSwitched = useCallback((business) => {
    showInfo(`Now managing: ${business.name}`, {
      title: 'Business Switched',
    });
  }, [showInfo]);

  const showAccountCreated = useCallback((account) => {
    showSuccess(`Account "${account.name}" created successfully`, {
      title: 'Account Created',
    });
  }, [showSuccess]);

  const showReportGenerated = useCallback((reportType) => {
    showSuccess(`${reportType} report generated successfully`, {
      title: 'Report Generated',
      action: {
        text: 'Download',
        onClick: () => window.location.href = `/reports/download/${reportType}`,
      },
    });
  }, [showSuccess]);

  const showImportSuccess = useCallback((type, count) => {
    showSuccess(`Successfully imported ${count} ${type}`, {
      title: 'Import Successful',
    });
  }, [showSuccess]);

  const showExportSuccess = useCallback((type) => {
    showSuccess(`${type} exported successfully`, {
      title: 'Export Successful',
    });
  }, [showSuccess]);

  const showNetworkError = useCallback((error) => {
    showError('Network connection error. Please check your internet connection and try again.', {
      title: 'Connection Error',
      duration: 8000,
      important: true,
    });
  }, [showError]);

  const showServerError = useCallback((error) => {
    showError('Server error occurred. Please try again later or contact support.', {
      title: 'Server Error',
      duration: 8000,
      important: true,
    });
  }, [showError]);

  const showValidationError = useCallback((errors) => {
    const errorMessage = Array.isArray(errors) 
      ? errors.join(', ') 
      : 'Please check your input and try again.';
    
    showError(errorMessage, {
      title: 'Validation Error',
      duration: 6000,
    });
  }, [showError]);

  const clearHistory = useCallback(() => {
    setNotificationHistory([]);
  }, []);

  const getDefaultTitle = (type) => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  };

  const value = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showTransactionCreated,
    showTransactionUpdated,
    showTransactionDeleted,
    showInvoiceCreated,
    showInvoiceSent,
    showInvoicePaid,
    showBusinessSwitched,
    showAccountCreated,
    showReportGenerated,
    showImportSuccess,
    showExportSuccess,
    showNetworkError,
    showServerError,
    showValidationError,
    notificationHistory,
    clearHistory,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}; 