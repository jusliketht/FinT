import api from './api';

const RESOURCE_URL = '/businesses';

/**
 * Business Service for backend API calls
 */
const businessService = {
  /**
   * Get all businesses for the current user
   * @returns {Promise<Array>} - List of user's businesses
   */
  getAll: async () => {
    const response = await api.get(RESOURCE_URL);
    return response.data;
  },

  /**
   * Get a single business by ID
   * @param {string} id - Business ID
   * @returns {Promise<Object>} - Business details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new business
   * @param {Object} data - Business data
   * @returns {Promise<Object>} - Created business
   */
  create: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Update a business
   * @param {string} id - Business ID
   * @param {Object} data - Updated business data
   * @returns {Promise<Object>} - Updated business
   */
  update: async (id, data) => {
    const response = await api.patch(`${RESOURCE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a business
   * @param {string} id - Business ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Add a user to a business
   * @param {string} businessId - Business ID
   * @param {Object} data - User data (userId, role)
   * @returns {Promise<Object>} - Added user business relationship
   */
  addUser: async (businessId, data) => {
    const response = await api.post(`${RESOURCE_URL}/${businessId}/users`, data);
    return response.data;
  },

  /**
   * Remove a user from a business
   * @param {string} businessId - Business ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Removal confirmation
   */
  removeUser: async (businessId, userId) => {
    const response = await api.delete(`${RESOURCE_URL}/${businessId}/users/${userId}`);
    return response.data;
  },

  /**
   * Get all users for a business
   * @param {string} businessId - Business ID
   * @returns {Promise<Array>} - List of business users
   */
  getUsers: async (businessId) => {
    const response = await api.get(`${RESOURCE_URL}/${businessId}/users`);
    return response.data;
  },

  /**
   * Get business accounts
   * @param {string} businessId - Business ID
   * @returns {Promise<Array>} - List of business accounts
   */
  getAccounts: async (businessId) => {
    const response = await api.get(`${RESOURCE_URL}/${businessId}/accounts`);
    return response.data;
  },

  /**
   * Get chart of accounts for a business
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} - Chart of accounts hierarchy
   */
  getChartOfAccounts: async (businessId) => {
    const response = await api.get(`${RESOURCE_URL}/${businessId}/chart-of-accounts`);
    return response.data;
  },

  /**
   * Get trial balance for a business
   * @param {string} businessId - Business ID
   * @param {string} asOfDate - Optional date for trial balance
   * @returns {Promise<Object>} - Trial balance data
   */
  getTrialBalance: async (businessId, asOfDate) => {
    const params = asOfDate ? { asOfDate } : {};
    const response = await api.get(`${RESOURCE_URL}/${businessId}/trial-balance`, { params });
    return response.data;
  }
};

export default businessService; 