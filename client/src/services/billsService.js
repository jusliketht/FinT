import { apiService } from './apiService';

export const billsService = {
  // Get all bills with pagination and filters
  async getAll(page = 1, limit = 10, status = null, search = null) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    
    const response = await apiService.get(`/bills?${params}`);
    return response;
  },

  // Get bill by ID
  async getById(id) {
    const response = await apiService.get(`/bills/${id}`);
    return response;
  },

  // Create new bill
  async create(billData) {
    const response = await apiService.post('/bills', billData);
    return response;
  },

  // Update bill
  async update(id, billData) {
    const response = await apiService.put(`/bills/${id}`, billData);
    return response;
  },

  // Update bill status
  async updateStatus(id, status) {
    const response = await apiService.put(`/bills/${id}/status`, { status });
    return response;
  },

  // Mark bill as paid
  async markAsPaid(id, paymentDate = null) {
    const data = paymentDate ? { paymentDate } : {};
    const response = await apiService.put(`/bills/${id}/mark-paid`, data);
    return response;
  },

  // Delete bill
  async delete(id) {
    const response = await apiService.delete(`/bills/${id}`);
    return response;
  },

  // Get bill statistics
  async getStats() {
    const response = await apiService.get('/bills/stats');
    return response;
  },

  // Get bills by vendor
  async getByVendor(vendorId) {
    const response = await apiService.get(`/bills/vendor/${vendorId}`);
    return response;
  },

  // Get overdue bills
  async getOverdue() {
    const response = await apiService.get('/bills/overdue');
    return response;
  },

  // Export bills
  async export(format = 'pdf', filters = {}) {
    const params = new URLSearchParams({ format, ...filters });
    const response = await apiService.get(`/bills/export?${params}`, {
      responseType: 'blob',
    });
    return response;
  },
}; 