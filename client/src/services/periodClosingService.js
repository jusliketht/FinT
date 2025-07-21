import api from './api';

export const periodClosingService = {
  // Close period
  closePeriod: async (businessId, periodEndDate, adjustingEntries = []) => {
    const response = await api.post('/period-closing/close-period', {
      businessId,
      periodEndDate,
      adjustingEntries
    });
    return response.data;
  },

  // Create adjusting entry
  createAdjustingEntry: async (data) => {
    const response = await api.post('/period-closing/adjusting-entry', data);
    return response.data;
  },

  // Get accounting periods
  getAccountingPeriods: async (businessId) => {
    const response = await api.get(`/period-closing/periods/${businessId}`);
    return response.data;
  },

  // Get accounting period by ID
  getAccountingPeriod: async (id) => {
    const response = await api.get(`/period-closing/period/${id}`);
    return response.data;
  },

  // Create depreciation entry
  createDepreciationEntry: async (data) => {
    const response = await api.post('/period-closing/depreciation', data);
    return response.data;
  },

  // Create accrual entry
  createAccrualEntry: async (data) => {
    const response = await api.post('/period-closing/accrual', data);
    return response.data;
  },

  // Create prepaid expense entry
  createPrepaidExpenseEntry: async (data) => {
    const response = await api.post('/period-closing/prepaid-expense', data);
    return response.data;
  },

  // Create unearned revenue entry
  createUnearnedRevenueEntry: async (data) => {
    const response = await api.post('/period-closing/unearned-revenue', data);
    return response.data;
  }
}; 