import api from './api';

const RESOURCE_URL = '/journal-entries';

// Journal Entry Service for backend API calls
const journalEntryService = {
  /**
   * Get all journal entries with optional filters
   * @param {Object} filters - Optional filters like date range, status, etc.
   * @returns {Promise<Array>} - List of journal entries
   */
  getAll: async (filters = {}) => {
    const response = await api.get(RESOURCE_URL, { params: filters });
    return response.data;
  },

  /**
   * Get a single journal entry by ID
   * @param {string} id - Journal entry ID
   * @returns {Promise<Object>} - Journal entry details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new journal entry
   * @param {Object} entryData - Journal entry data
   * @returns {Promise<Object>} - Created journal entry
   */
  create: async (entryData) => {
    const response = await api.post(RESOURCE_URL, entryData);
    return response.data;
  },

  /**
   * Update an existing journal entry
   * @param {string} id - Journal entry ID
   * @param {Object} entryData - Updated journal entry data
   * @returns {Promise<Object>} - Updated journal entry
   */
  update: async (id, entryData) => {
    const response = await api.put(`${RESOURCE_URL}/${id}`, entryData);
    return response.data;
  },

  /**
   * Delete a journal entry
   * @param {string} id - Journal entry ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  delete: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Post (finalize) a journal entry
   * @param {string} id - Journal entry ID
   * @returns {Promise<Object>} - Posted journal entry
   */
  post: async (id) => {
    const response = await api.put(`${RESOURCE_URL}/${id}/post`);
    return response.data;
  },

  /**
   * Reverse a posted journal entry
   * @param {string} id - Journal entry ID
   * @returns {Promise<Object>} - Reversed journal entry
   */
  reverse: async (id) => {
    const response = await api.put(`${RESOURCE_URL}/${id}/reverse`);
    return response.data;
  }
};

export default journalEntryService; 