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
   * Get users for a business
   * @param {string} businessId - Business ID
   * @returns {Promise<Array>} - List of business users
   */
  getUsers: async (businessId) => {
    const response = await api.get(`${RESOURCE_URL}/${businessId}/users`);
    return response.data;
  },

  /**
   * Add a user to a business
   * @param {string} businessId - Business ID
   * @param {Object} data - User data (email, role, permissions)
   * @returns {Promise<Object>} - Added user business relationship
   */
  addUser: async (businessId, data) => {
    const response = await api.post(`${RESOURCE_URL}/${businessId}/users`, data);
    return response.data;
  },

  /**
   * Update a user in a business
   * @param {string} businessId - Business ID
   * @param {string} userId - User ID
   * @param {Object} data - Updated user data
   * @returns {Promise<Object>} - Updated user business relationship
   */
  updateUser: async (businessId, userId, data) => {
    const response = await api.put(`${RESOURCE_URL}/${businessId}/users/${userId}`, data);
    return response.data;
  },

  /**
   * Update user role in a business
   * @param {string} businessId - Business ID
   * @param {string} userId - User ID
   * @param {Object} data - Role data
   * @returns {Promise<Object>} - Updated user role
   */
  updateUserRole: async (businessId, userId, data) => {
    const response = await api.patch(`${RESOURCE_URL}/${businessId}/users/${userId}/role`, data);
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
   * Get business settings
   * @param {string} businessId - Business ID
   * @returns {Promise<Object>} - Business settings
   */
  getSettings: async (businessId) => {
    const response = await api.get(`${RESOURCE_URL}/${businessId}/settings`);
    return response.data;
  },

  /**
   * Update business settings
   * @param {string} businessId - Business ID
   * @param {Object} data - Updated settings
   * @returns {Promise<Object>} - Updated settings
   */
  updateSettings: async (businessId, data) => {
    const response = await api.put(`${RESOURCE_URL}/${businessId}/settings`, data);
    return response.data;
  },

  /**
   * Get business statistics
   * @param {string} businessId - Business ID
   * @param {string} period - Time period (month, quarter, year)
   * @returns {Promise<Object>} - Business statistics
   */
  getStats: async (businessId, period = 'month') => {
    const response = await api.get(`${RESOURCE_URL}/${businessId}/stats`, {
      params: { period }
    });
    return response.data;
  },

  /**
   * Export business data
   * @param {string} businessId - Business ID
   * @param {string} format - Export format (pdf, excel, csv)
   * @param {Object} filters - Export filters
   * @returns {Promise<Blob>} - Exported data
   */
  exportData: async (businessId, format = 'pdf', filters = {}) => {
    const response = await api.get(`${RESOURCE_URL}/${businessId}/export`, {
      params: { format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default businessService; 