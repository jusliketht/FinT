import api from './api';

const RESOURCE_URL = '/financial-statements';

const financialStatementsService = {
  /**
   * Get balance sheet for a business
   * @param {string} businessId - Business ID
   * @param {Date} asOfDate - As of date for balance sheet
   * @returns {Promise<Object>} - Balance sheet data
   */
  getBalanceSheet: async (businessId, asOfDate = new Date()) => {
    const response = await api.get(`${RESOURCE_URL}/balance-sheet`, {
      params: { businessId, asOfDate: asOfDate.toISOString() }
    });
    return response.data;
  },

  /**
   * Get income statement for a business
   * @param {string} businessId - Business ID
   * @param {Date} fromDate - From date for income statement
   * @param {Date} toDate - To date for income statement
   * @returns {Promise<Object>} - Income statement data
   */
  getIncomeStatement: async (businessId, fromDate, toDate) => {
    const response = await api.get(`${RESOURCE_URL}/income-statement`, {
      params: { 
        businessId, 
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
      }
    });
    return response.data;
  },

  /**
   * Get cash flow statement for a business
   * @param {string} businessId - Business ID
   * @param {Date} fromDate - From date for cash flow statement
   * @param {Date} toDate - To date for cash flow statement
   * @returns {Promise<Object>} - Cash flow statement data
   */
  getCashFlowStatement: async (businessId, fromDate, toDate) => {
    const response = await api.get(`${RESOURCE_URL}/cash-flow`, {
      params: { 
        businessId, 
        fromDate: fromDate.toISOString(),
        toDate: toDate.toISOString()
      }
    });
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
  },

  /**
   * Export financial statement to PDF
   * @param {string} businessId - Business ID
   * @param {string} statementType - Type of statement (balance-sheet, income-statement, etc.)
   * @param {Object} params - Additional parameters
   * @returns {Promise<Blob>} - PDF blob
   */
  exportToPDF: async (businessId, statementType, params = {}) => {
    const response = await api.get(`${RESOURCE_URL}/${statementType}/export`, {
      params: { businessId, ...params },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Export financial statement to Excel
   * @param {string} businessId - Business ID
   * @param {string} statementType - Type of statement
   * @param {Object} params - Additional parameters
   * @returns {Promise<Blob>} - Excel blob
   */
  exportToExcel: async (businessId, statementType, params = {}) => {
    const response = await api.get(`${RESOURCE_URL}/${statementType}/export-excel`, {
      params: { businessId, ...params },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default financialStatementsService; 