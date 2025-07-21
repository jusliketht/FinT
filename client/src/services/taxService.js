import api from './api';

export const taxService = {
  // Calculate tax
  calculateTax: async (amount, taxType, businessId) => {
    const response = await api.post('/tax/calculate', {
      amount,
      taxType,
      businessId
    });
    return response.data;
  },

  // Create tax rate
  createTaxRate: async (data) => {
    const response = await api.post('/tax/rates', data);
    return response.data;
  },

  // Update tax rate
  updateTaxRate: async (id, data) => {
    const response = await api.put(`/tax/rates/${id}`, data);
    return response.data;
  },

  // Get tax rates
  getTaxRates: async (businessId) => {
    const response = await api.get(`/tax/rates?businessId=${businessId || ''}`);
    return response.data;
  },

  // Get tax rate by ID
  getTaxRate: async (id) => {
    const response = await api.get(`/tax/rates/${id}`);
    return response.data;
  },

  // Delete tax rate
  deleteTaxRate: async (id) => {
    const response = await api.delete(`/tax/rates/${id}`);
    return response.data;
  },

  // Generate tax report
  generateTaxReport: async (businessId, fromDate, toDate, taxType) => {
    const params = new URLSearchParams({
      businessId,
      fromDate,
      toDate,
      ...(taxType && { taxType })
    });
    const response = await api.get(`/tax/report?${params}`);
    return response.data;
  },

  // Get tax summary
  getTaxSummary: async (businessId, fromDate, toDate) => {
    const params = new URLSearchParams({
      businessId,
      fromDate,
      toDate
    });
    const response = await api.get(`/tax/summary?${params}`);
    return response.data;
  },

  // Get tax transactions
  getTaxTransactions: async (businessId, fromDate, toDate, taxType) => {
    const params = new URLSearchParams({
      businessId,
      fromDate,
      toDate,
      ...(taxType && { taxType })
    });
    const response = await api.get(`/tax/transactions?${params}`);
    return response.data;
  }
}; 