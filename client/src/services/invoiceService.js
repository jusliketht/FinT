import api from './api';

export const invoiceService = {
  // Invoice CRUD operations
  getAll: (params = {}) => api.get('/invoices', { params }),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  
  // Invoice status management
  updateStatus: (id, status) => api.put(`/invoices/${id}/status`, { status }),
  markAsPaid: (id, paymentDate) => api.put(`/invoices/${id}/mark-paid`, { paymentDate }),
  
  // Invoice statistics
  getStats: () => api.get('/invoices/stats'),
  getAgingReport: (businessId) => api.get('/invoices/aging-report', { params: { businessId } }),
  
  // Invoice actions
  recordPayment: (id, data) => api.post(`/invoices/${id}/payment`, data),
  sendEmail: (id, emailData) => api.post(`/invoices/${id}/send-email`, emailData),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export default invoiceService; 