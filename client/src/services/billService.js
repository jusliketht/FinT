import api from './api';

export const billService = {
  // Bill CRUD operations
  getAll: (params = {}) => api.get('/bills', { params }),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
  update: (id, data) => api.put(`/bills/${id}`, data),
  delete: (id) => api.delete(`/bills/${id}`),
  
  // Bill status management
  updateStatus: (id, status) => api.put(`/bills/${id}/status`, { status }),
  markAsPaid: (id, paymentDate) => api.put(`/bills/${id}/mark-paid`, { paymentDate }),
  
  // Bill statistics
  getStats: () => api.get('/bills/stats'),
  getAgingReport: (businessId) => api.get('/bills/aging-report', { params: { businessId } }),
  
  // Bill actions
  recordPayment: (id, data) => api.post(`/bills/${id}/payment`, data),
  downloadPDF: (id) => api.get(`/bills/${id}/pdf`, { responseType: 'blob' }),
};

export default billService; 