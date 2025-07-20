import api from './api';

const RESOURCE_URL = '/account-heads';

/**
 * Account Head Service for backend API calls
 */
const accountHeadService = {
  /**
   * Get all account heads
   * @param {Object} filters - Optional filters (businessId, categoryId)
   * @returns {Promise<Array>} - List of account heads
   */
  getAll: async (filters = {}) => {
    const response = await api.get(RESOURCE_URL, { params: filters });
    return response.data;
  },

  /**
   * Get account head by ID
   * @param {string} id - Account head ID
   * @returns {Promise<Object>} - Account head details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new account head
   * @param {Object} data - Account head data
   * @returns {Promise<Object>} - Created account head
   */
  create: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Update an account head
   * @param {string} id - Account head ID
   * @param {Object} data - Updated account head data
   * @returns {Promise<Object>} - Updated account head
   */
  update: async (id, data) => {
    const response = await api.patch(`${RESOURCE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete an account head
   * @param {string} id - Account head ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
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
   * Get accounts by category
   * @param {string} categoryId - Category ID
   * @param {string} businessId - Business ID
   * @returns {Promise<Array>} - List of account heads
   */
  getByCategory: async (categoryId, businessId) => {
    const response = await api.get(RESOURCE_URL, { 
      params: { categoryId, businessId } 
    });
    return response.data;
  },

  /**
   * Create standard chart of accounts
   * @param {string} businessId - Business ID
   * @returns {Promise<Array>} - Created account heads
   */
  createStandardChart: async (businessId) => {
    const response = await api.get(`${RESOURCE_URL}/standard`, { 
      params: { businessId } 
    });
    return response.data;
  }
};

export default accountHeadService; 