import api from './api';

const RESOURCE_URL = '/api/account-categories';

/**
 * Account Category Service for backend API calls
 */
const accountCategoryService = {
  /**
   * Get all account categories
   * @param {Object} filters - Optional filters (e.g., typeId)
   * @returns {Promise<Array>} - List of account categories
   */
  getAll: async (filters = {}) => {
    const response = await api.get(RESOURCE_URL, { params: filters });
    return response.data;
  },

  /**
   * Get account category by ID
   * @param {string} id - Account category ID
   * @returns {Promise<Object>} - Account category details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new account category
   * @param {Object} data - Account category data (name, typeId)
   * @returns {Promise<Object>} - Created account category
   */
  create: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Update an account category
   * @param {string} id - Account category ID
   * @param {Object} data - Updated account category data
   * @returns {Promise<Object>} - Updated account category
   */
  update: async (id, data) => {
    const response = await api.put(`${RESOURCE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete an account category
   * @param {string} id - Account category ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
    return response.data;
  },
  
  /**
   * Get categories by account type ID
   * @param {string} typeId - Account type ID
   * @returns {Promise<Array>} - List of categories for the specified account type
   */
  getByTypeId: async (typeId) => {
    const response = await api.get(`${RESOURCE_URL}/by-type/${typeId}`);
    return response.data;
  }
};

export default accountCategoryService; 