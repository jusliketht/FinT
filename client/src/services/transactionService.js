import api from './api';

const RESOURCE_URL = '/transactions';

/**
 * Transaction Service for backend API calls
 */
const transactionService = {
  /**
   * Get all transactions with optional filters
   * @param {Object} filters - Optional filters (category, transactionType, etc.)
   * @param {Object} pagination - Optional pagination parameters
   * @returns {Promise<Object>} - List of transactions and total count
   */
  getAll: async (filters = {}, pagination = {}) => {
    const params = { ...filters, ...pagination };
    const response = await api.get(RESOURCE_URL, { params });
    return response.data;
  },

  /**
   * Get a single transaction by ID
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} - Transaction details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} - Created transaction
   */
  create: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Update a transaction
   * @param {string} id - Transaction ID
   * @param {Object} data - Updated transaction data
   * @returns {Promise<Object>} - Updated transaction
   */
  update: async (id, data) => {
    const response = await api.patch(`${RESOURCE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a transaction
   * @param {string} id - Transaction ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get transaction categories
   * @returns {Promise<Array>} - List of transaction categories
   */
  getCategories: async () => {
    const response = await api.get(`${RESOURCE_URL}/categories`);
    return response.data;
  },

  /**
   * Get transaction statistics
   * @param {string} businessId - Optional business ID
   * @returns {Promise<Object>} - Transaction statistics
   */
  getStats: async (businessId = null) => {
    const params = businessId ? { businessId } : {};
    const response = await api.get(`${RESOURCE_URL}/stats`, { params });
    return response.data;
  },

  /**
   * Get transactions by account
   * @param {string} accountId - Account ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - List of transactions for the account
   */
  getByAccount: async (accountId, filters = {}) => {
    const params = { accountId, ...filters };
    const response = await api.get(RESOURCE_URL, { params });
    return response.data;
  },

  /**
   * Get transactions by business
   * @param {string} businessId - Business ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - List of transactions for the business
   */
  getByBusiness: async (businessId, filters = {}) => {
    const params = { businessId, ...filters };
    const response = await api.get(RESOURCE_URL, { params });
    return response.data;
  },

  /**
   * Search transactions
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Optional filters
   * @returns {Promise<Object>} - Search results
   */
  search: async (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    const response = await api.get(RESOURCE_URL, { params });
    return response.data;
  },

  /**
   * Export transactions to CSV
   * @param {Object} filters - Optional filters
   * @returns {Promise<Blob>} - CSV file blob
   */
  exportToCSV: async (filters = {}) => {
    const response = await api.get(`${RESOURCE_URL}/export`, { 
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Import transactions from CSV
   * @param {File} file - CSV file
   * @param {Object} options - Import options
   * @returns {Promise<Object>} - Import result
   */
  importFromCSV: async (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify(options));

    const response = await api.post(`${RESOURCE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export default transactionService; 