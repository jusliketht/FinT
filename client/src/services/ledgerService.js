import api from './api';

const RESOURCE_URL = '/api/ledgers';

/**
 * Ledger Service for backend API calls
 */
const ledgerService = {
  /**
   * Get general ledger entries
   * @param {Object} filters - Optional filters (startDate, endDate, accountId)
   * @param {Object} pagination - Optional pagination parameters
   * @returns {Promise<Object>} - List of ledger entries and total count
   */
  getGeneralLedger: async (filters = {}, pagination = {}) => {
    const params = { ...filters, ...pagination };
    const response = await api.get(`${RESOURCE_URL}/general`, { params });
    return response.data;
  },

  /**
   * Get account ledger entries
   * @param {string} accountId - Account ID
   * @param {Object} filters - Optional filters (startDate, endDate)
   * @param {Object} pagination - Optional pagination parameters
   * @returns {Promise<Object>} - List of ledger entries and total count
   */
  getAccountLedger: async (accountId, filters = {}, pagination = {}) => {
    const params = { ...filters, ...pagination };
    const response = await api.get(`${RESOURCE_URL}/account/${accountId}`, { params });
    return response.data;
  },

  /**
   * Get trial balance
   * @param {Object} filters - Optional filters (asOfDate, includeZeroBalances)
   * @returns {Promise<Array>} - Trial balance data
   */
  getTrialBalance: async (filters = {}) => {
    const response = await api.get(`${RESOURCE_URL}/trial-balance`, { params: filters });
    return response.data;
  },

  /**
   * Post a journal entry
   * @param {Object} journalEntry - Journal entry data
   * @returns {Promise<Object>} - Posted journal entry
   */
  postJournalEntry: async (journalEntry) => {
    const response = await api.post(`${RESOURCE_URL}/journal-entries`, journalEntry);
    return response.data;
  },

  /**
   * Get journal entry by ID
   * @param {string} id - Journal entry ID
   * @returns {Promise<Object>} - Journal entry details
   */
  getJournalEntry: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/journal-entries/${id}`);
    return response.data;
  },

  /**
   * Get all journal entries
   * @param {Object} filters - Optional filters (startDate, endDate, description)
   * @param {Object} pagination - Optional pagination parameters
   * @returns {Promise<Object>} - List of journal entries and total count
   */
  getAllJournalEntries: async (filters = {}, pagination = {}) => {
    const params = { ...filters, ...pagination };
    const response = await api.get(`${RESOURCE_URL}/journal-entries`, { params });
    return response.data;
  }
};

export default ledgerService; 