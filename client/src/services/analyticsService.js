import api from './api';

const RESOURCE_URL = '/analytics';

/**
 * Analytics Service for backend API calls
 */
const analyticsService = {
  /**
   * Get Key Performance Indicators (KPIs)
   * @param {string} businessId - Business ID
   * @param {string} period - Time period (current, previous, quarter, year)
   * @returns {Promise<Object>} - KPI data
   */
  getKPIs: async (businessId, period = 'current') => {
    const response = await api.get(`${RESOURCE_URL}/kpis`, {
      params: { businessId, period }
    });
    return response.data;
  },

  /**
   * Get financial trends
   * @param {string} businessId - Business ID
   * @param {string} period - Time period (current, previous, quarter, year)
   * @returns {Promise<Object>} - Trend data
   */
  getTrends: async (businessId, period = 'current') => {
    const response = await api.get(`${RESOURCE_URL}/trends`, {
      params: { businessId, period }
    });
    return response.data;
  },

  /**
   * Get top accounts by balance
   * @param {string} businessId - Business ID
   * @param {string} period - Time period
   * @param {number} limit - Number of accounts to return
   * @returns {Promise<Array>} - Top accounts data
   */
  getTopAccounts: async (businessId, period = 'current', limit = 10) => {
    const response = await api.get(`${RESOURCE_URL}/top-accounts`, {
      params: { businessId, period, limit }
    });
    return response.data;
  },

  /**
   * Get recent transactions
   * @param {string} businessId - Business ID
   * @param {number} limit - Number of transactions to return
   * @returns {Promise<Array>} - Recent transactions data
   */
  getRecentTransactions: async (businessId, limit = 10) => {
    const response = await api.get(`${RESOURCE_URL}/recent-transactions`, {
      params: { businessId, limit }
    });
    return response.data;
  },

  /**
   * Get revenue analysis
   * @param {string} businessId - Business ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} - Revenue analysis data
   */
  getRevenueAnalysis: async (businessId, startDate, endDate) => {
    const response = await api.get(`${RESOURCE_URL}/revenue-analysis`, {
      params: { businessId, startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get expense analysis
   * @param {string} businessId - Business ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} - Expense analysis data
   */
  getExpenseAnalysis: async (businessId, startDate, endDate) => {
    const response = await api.get(`${RESOURCE_URL}/expense-analysis`, {
      params: { businessId, startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get cash flow analysis
   * @param {string} businessId - Business ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} - Cash flow analysis data
   */
  getCashFlowAnalysis: async (businessId, startDate, endDate) => {
    const response = await api.get(`${RESOURCE_URL}/cash-flow-analysis`, {
      params: { businessId, startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get profitability analysis
   * @param {string} businessId - Business ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Promise<Object>} - Profitability analysis data
   */
  getProfitabilityAnalysis: async (businessId, startDate, endDate) => {
    const response = await api.get(`${RESOURCE_URL}/profitability-analysis`, {
      params: { businessId, startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get financial ratios
   * @param {string} businessId - Business ID
   * @param {string} asOfDate - As of date
   * @returns {Promise<Object>} - Financial ratios data
   */
  getFinancialRatios: async (businessId, asOfDate) => {
    const response = await api.get(`${RESOURCE_URL}/financial-ratios`, {
      params: { businessId, asOfDate }
    });
    return response.data;
  },

  /**
   * Get account aging analysis
   * @param {string} businessId - Business ID
   * @param {string} asOfDate - As of date
   * @returns {Promise<Object>} - Account aging data
   */
  getAccountAging: async (businessId, asOfDate) => {
    const response = await api.get(`${RESOURCE_URL}/account-aging`, {
      params: { businessId, asOfDate }
    });
    return response.data;
  },

  /**
   * Get budget vs actual analysis
   * @param {string} businessId - Business ID
   * @param {string} period - Time period
   * @returns {Promise<Object>} - Budget vs actual data
   */
  getBudgetVsActual: async (businessId, period) => {
    const response = await api.get(`${RESOURCE_URL}/budget-vs-actual`, {
      params: { businessId, period }
    });
    return response.data;
  },

  /**
   * Get comparative analysis
   * @param {string} businessId - Business ID
   * @param {string} currentPeriod - Current period
   * @param {string} comparisonPeriod - Comparison period
   * @returns {Promise<Object>} - Comparative analysis data
   */
  getComparativeAnalysis: async (businessId, currentPeriod, comparisonPeriod) => {
    const response = await api.get(`${RESOURCE_URL}/comparative-analysis`, {
      params: { businessId, currentPeriod, comparisonPeriod }
    });
    return response.data;
  },

  /**
   * Export analytics report
   * @param {string} businessId - Business ID
   * @param {string} reportType - Type of report
   * @param {string} format - Export format (pdf, excel, csv)
   * @param {Object} filters - Report filters
   * @returns {Promise<Blob>} - Exported report
   */
  exportReport: async (businessId, reportType, format = 'pdf', filters = {}) => {
    const response = await api.get(`${RESOURCE_URL}/export/${reportType}`, {
      params: { businessId, format, ...filters },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default analyticsService; 