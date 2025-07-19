import api from './api';

export const invoiceService = {
  getAll: (params = {}) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.patch(`/invoices/${id}`, data),
  recordPayment: (id, data) => api.post(`/invoices/${id}/payment`, data),
  getAgingReport: (businessId) => api.get('/invoices/aging-report', { params: { businessId } }),
}; 