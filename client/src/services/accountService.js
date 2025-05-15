import api from './api';

const RESOURCE_URL = '/api/accounts';

/**
 * Account Service for backend API calls
 */
const accountService = {
  /**
   * Get all accounts
   * @param {Object} filters - Optional filters (typeId, categoryId, search)
   * @param {Object} pagination - Optional pagination parameters
   * @returns {Promise<Object>} - List of accounts and total count
   */
  getAll: async (filters = {}, pagination = {}) => {
    const params = { ...filters, ...pagination };
    const response = await api.get(RESOURCE_URL, { params });
    return response.data;
  },

  /**
   * Get account by ID
   * @param {string} id - Account ID
   * @returns {Promise<Object>} - Account details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new account
   * @param {Object} data - Account data
   * @returns {Promise<Object>} - Created account
   */
  create: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Update an account
   * @param {string} id - Account ID
   * @param {Object} data - Updated account data
   * @returns {Promise<Object>} - Updated account
   */
  update: async (id, data) => {
    const response = await api.put(`${RESOURCE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete an account
   * @param {string} id - Account ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get account balance
   * @param {string} id - Account ID
   * @returns {Promise<Object>} - Account balance information
   */
  getBalance: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}/balance`);
    return response.data;
  },

  /**
   * Get account transactions
   * @param {string} id - Account ID
   * @param {Object} params - Query parameters (pagination, date range)
   * @returns {Promise<Object>} - Account transactions
   */
  getTransactions: async (id, params = {}) => {
    const response = await api.get(`${RESOURCE_URL}/${id}/transactions`, { params });
    return response.data;
  },

  /**
   * Get chart of accounts (hierarchical structure)
   * @param {Object} params - Optional parameters
   * @returns {Promise<Array>} - Chart of accounts
   */
  getChartOfAccounts: async (params = {}) => {
    const response = await api.get(`${RESOURCE_URL}/chart`, { params });
    return response.data;
  },

  /**
   * Get accounts by type ID
   * @param {string} typeId - Account type ID
   * @returns {Promise<Array>} - List of accounts
   */
  getByTypeId: async (typeId) => {
    const response = await api.get(`${RESOURCE_URL}/by-type/${typeId}`);
    return response.data;
  },

  /**
   * Get accounts by category ID
   * @param {string} categoryId - Account category ID
   * @returns {Promise<Array>} - List of accounts
   */
  getByCategoryId: async (categoryId) => {
    const response = await api.get(`${RESOURCE_URL}/by-category/${categoryId}`);
    return response.data;
  }
};

export default accountService; 