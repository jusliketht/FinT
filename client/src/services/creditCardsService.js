import api from './api';

const RESOURCE_URL = '/api/credit-cards';

/**
 * Credit Card Service for backend API calls
 */
const creditCardsService = {
  /**
   * Get all credit cards
   * @param {Object} filters - Optional filters
   * @param {Object} pagination - Optional pagination parameters
   * @returns {Promise<Object>} - List of credit cards and total count
   */
  getAll: async (filters = {}, pagination = {}) => {
    const params = { ...filters, ...pagination };
    const response = await api.get(RESOURCE_URL, { params });
    return response.data;
  },

  /**
   * Get credit card by ID
   * @param {string} id - Credit card ID
   * @returns {Promise<Object>} - Credit card details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new credit card
   * @param {Object} data - Credit card data
   * @returns {Promise<Object>} - Created credit card
   */
  create: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Update a credit card
   * @param {string} id - Credit card ID
   * @param {Object} data - Updated credit card data
   * @returns {Promise<Object>} - Updated credit card
   */
  update: async (id, data) => {
    const response = await api.put(`${RESOURCE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete a credit card
   * @param {string} id - Credit card ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Get credit card statement
   * @param {string} id - Credit card ID
   * @returns {Promise<Object>} - Credit card statement
   */
  getStatement: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}/statement`);
    return response.data;
  }
};

export default creditCardsService; 