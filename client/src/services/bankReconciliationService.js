import api from './api';

export const bankReconciliationService = {
  // Auto-reconciliation
  performAutoReconciliation: async (accountId, bankStatementId) => {
    const response = await api.post('/bank-reconciliation/auto-match', {
      accountId,
      bankStatementId
    });
    return response.data;
  },

  // Create reconciliation
  createReconciliation: async (data) => {
    const response = await api.post('/bank-reconciliation', data);
    return response.data;
  },

  // Get reconciliation by ID
  getReconciliation: async (id) => {
    const response = await api.get(`/bank-reconciliation/${id}`);
    return response.data;
  },

  // Get reconciliations by account
  getReconciliationsByAccount: async (accountId) => {
    const response = await api.get(`/bank-reconciliation/account/${accountId}`);
    return response.data;
  },

  // Manual match
  manualMatch: async (reconciliationId, bankLineId, transactionId) => {
    const response = await api.post(`/bank-reconciliation/${reconciliationId}/manual-match`, {
      bankLineId,
      transactionId
    });
    return response.data;
  },

  // Create outstanding item
  createOutstandingItem: async (reconciliationId, data) => {
    const response = await api.post(`/bank-reconciliation/${reconciliationId}/outstanding-item`, data);
    return response.data;
  }
}; 