import api from './api';

const RESOURCE_URL = '/reconciliation';

/**
 * Reconciliation Service for backend API calls
 */
const reconciliationService = {
  /**
   * Perform auto-matching for reconciliation
   * @param {Object} data - Reconciliation data
   * @param {Array} data.statementTransactions - Bank statement transactions
   * @param {string} data.accountId - Account ID to reconcile
   * @param {string} data.businessId - Optional business ID
   * @returns {Promise<Object>} - Reconciliation result
   */
  performAutoMatching: async (data) => {
    const response = await api.post(`${RESOURCE_URL}/auto-match`, data);
    return response.data;
  },

  /**
   * Create reconciliation record
   * @param {Object} data - Reconciliation data
   * @param {string} data.accountId - Account ID
   * @param {string} data.statementDate - Statement date
   * @param {number} data.closingBalance - Closing balance
   * @param {string} data.businessId - Optional business ID
   * @returns {Promise<Object>} - Created reconciliation
   */
  createReconciliation: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Lock reconciliation period
   * @param {string} id - Reconciliation ID
   * @returns {Promise<Object>} - Locked reconciliation
   */
  lockReconciliation: async (id) => {
    const response = await api.put(`${RESOURCE_URL}/${id}/lock`);
    return response.data;
  },

  /**
   * Get reconciliation history for an account
   * @param {string} accountId - Account ID
   * @param {string} businessId - Optional business ID
   * @returns {Promise<Array>} - Reconciliation history
   */
  getReconciliationHistory: async (accountId, businessId = null) => {
    const params = businessId ? { businessId } : {};
    const response = await api.get(`${RESOURCE_URL}/history/${accountId}`, { params });
    return response.data;
  },

  /**
   * Generate reconciliation report
   * @param {string} id - Reconciliation ID
   * @returns {Promise<Object>} - Reconciliation report
   */
  generateReconciliationReport: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/report/${id}`);
    return response.data;
  },

  /**
   * Create journal entries from unmatched transactions
   * @param {Array} transactions - Array of transactions to create
   * @returns {Promise<Object>} - Created journal entries
   */
  createJournalEntries: async (transactions) => {
    const response = await api.post(`${RESOURCE_URL}/create-entries`, { transactions });
    return response.data;
  },

  /**
   * Export reconciliation report
   * @param {string} id - Reconciliation ID
   * @param {string} format - Export format (pdf, csv, excel)
   * @returns {Promise<Blob>} - Exported file
   */
  exportReconciliationReport: async (id, format = 'pdf') => {
    const response = await api.get(`${RESOURCE_URL}/report/${id}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get reconciliation statistics
   * @param {string} accountId - Account ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Reconciliation statistics
   */
  getReconciliationStats: async (accountId, filters = {}) => {
    const response = await api.get(`${RESOURCE_URL}/stats/${accountId}`, { params: filters });
    return response.data;
  },

  /**
   * Approve matched items
   * @param {string} reconciliationId - Reconciliation ID
   * @param {Array} itemIds - Array of item IDs to approve
   * @returns {Promise<Object>} - Approval result
   */
  approveMatchedItems: async (reconciliationId, itemIds) => {
    const response = await api.post(`${RESOURCE_URL}/${reconciliationId}/approve`, { itemIds });
    return response.data;
  },

  /**
   * Reject matched items
   * @param {string} reconciliationId - Reconciliation ID
   * @param {Array} itemIds - Array of item IDs to reject
   * @returns {Promise<Object>} - Rejection result
   */
  rejectMatchedItems: async (reconciliationId, itemIds) => {
    const response = await api.post(`${RESOURCE_URL}/${reconciliationId}/reject`, { itemIds });
    return response.data;
  },

  /**
   * Update reconciliation item
   * @param {string} reconciliationId - Reconciliation ID
   * @param {string} itemId - Item ID
   * @param {Object} updates - Updates to apply
   * @returns {Promise<Object>} - Updated item
   */
  updateReconciliationItem: async (reconciliationId, itemId, updates) => {
    const response = await api.put(`${RESOURCE_URL}/${reconciliationId}/items/${itemId}`, updates);
    return response.data;
  }
};

export default reconciliationService; 