import api from './api';

export const integrationService = {
  // Bank API Integration
  connectBankAPI: (businessId, bankCredentials) => 
    api.post('/integrations/bank/connect', { businessId, bankCredentials }),
  
  disconnectBankAPI: (connectionId) => 
    api.delete(`/integrations/bank/disconnect/${connectionId}`),
  
  syncBankTransactions: (businessId, connectionId) => 
    api.post('/integrations/bank/sync', { businessId, connectionId }),
  
  getBankAccounts: (connectionId) => 
    api.get(`/integrations/bank/accounts/${connectionId}`),
  
  getBankAccountBalance: (connectionId, accountId) => 
    api.get(`/integrations/bank/balance/${connectionId}/${accountId}`),

  // Payment Processing
  processPayment: (paymentData) => 
    api.post('/integrations/payment/process', paymentData),

  // Email Notifications
  sendEmailNotification: (notificationData) => 
    api.post('/integrations/email/send', notificationData),
  
  sendLowStockAlert: (businessId, itemData) => 
    api.post('/integrations/email/low-stock-alert', { businessId, itemData }),
  
  sendInvoiceReminder: (invoiceData) => 
    api.post('/integrations/email/invoice-reminder', invoiceData),
  
  sendPaymentConfirmation: (paymentData) => 
    api.post('/integrations/email/payment-confirmation', paymentData),

  // Integration Settings
  getIntegrationSettings: (businessId) => 
    api.get(`/integrations/settings?businessId=${businessId}`),
  
  updateIntegrationSettings: (businessId, settings) => 
    api.put(`/integrations/settings?businessId=${businessId}`, settings),
}; 