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
   * @param {Object} entryData - Journal entry data with lines
   * @returns {Promise<Object>} - Created journal entry
   */
  create: async (entryData) => {
    // Transform frontend data to backend format
    const backendData = {
      date: entryData.date,
      description: entryData.description,
      reference: entryData.reference,
      lines: entryData.lines.map(line => ({
        accountId: line.accountId,
        debitAmount: parseFloat(line.debit) || 0,
        creditAmount: parseFloat(line.credit) || 0,
        description: line.description
      })),
      businessId: entryData.businessId,
      isAdjusting: entryData.status === 'adjusting'
    };
    
    const response = await api.post(RESOURCE_URL, backendData);
    return response.data;
  },

  /**
   * Create multiple journal entries from verified transactions
   * @param {Array} transactions - Array of verified transactions with account mappings
   * @returns {Promise<Object>} - Created journal entries
   */
  createBatch: async (transactions) => {
    const response = await api.post(`${RESOURCE_URL}/batch`, transactions);
    return response.data;
  },

  /**
   * Update an existing journal entry
   * @param {string} id - Journal entry ID
   * @param {Object} entryData - Updated journal entry data with lines
   * @returns {Promise<Object>} - Updated journal entry
   */
  update: async (id, entryData) => {
    // Transform frontend data to backend format
    const backendData = {
      date: entryData.date,
      description: entryData.description,
      reference: entryData.reference,
      lines: entryData.lines.map(line => ({
        accountId: line.accountId,
        debitAmount: parseFloat(line.debit) || 0,
        creditAmount: parseFloat(line.credit) || 0,
        description: line.description
      })),
      businessId: entryData.businessId,
      isAdjusting: entryData.status === 'adjusting'
    };
    
    const response = await api.put(`${RESOURCE_URL}/${id}`, backendData);
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
  },

  /**
   * Get trial balance for a business
   * @param {string} businessId - Business ID
   * @param {Date} asOfDate - As of date for trial balance
   * @returns {Promise<Array>} - Trial balance data
   */
  getTrialBalance: async (businessId, asOfDate = new Date()) => {
    const response = await api.get(`${RESOURCE_URL}/trial-balance`, {
      params: { businessId, asOfDate: asOfDate.toISOString() }
    });
    return response.data;
  }
};

export default journalEntryService; 