import api from './api';

const RESOURCE_URL = '/api/account-types';

/**
 * Account Type Service for backend API calls
 */
const accountTypeService = {
  /**
   * Get all account types
   * @returns {Promise<Array>} - List of account types
   */
  getAll: async () => {
    const response = await api.get(RESOURCE_URL);
    return response.data;
  },

  /**
   * Get account type by ID
   * @param {string} id - Account type ID
   * @returns {Promise<Object>} - Account type details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new account type
   * @param {Object} data - Account type data (value, label)
   * @returns {Promise<Object>} - Created account type
   */
  create: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Update an account type
   * @param {string} id - Account type ID
   * @param {Object} data - Updated account type data
   * @returns {Promise<Object>} - Updated account type
   */
  update: async (id, data) => {
    const response = await api.put(`${RESOURCE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete an account type
   * @param {string} id - Account type ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create default account types
   * @returns {Promise<Array>} - List of created default account types
   */
  createDefaults: async () => {
    const response = await api.post(`${RESOURCE_URL}/default`);
    return response.data;
  }
};

export default accountTypeService; 