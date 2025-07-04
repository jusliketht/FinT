import api from './api';

class BusinessService {
  async createBusiness(businessData) {
    const response = await api.post('/businesses', businessData);
    return response.data;
  }

  async getAllBusinesses() {
    const response = await api.get('/businesses');
    return response.data;
  }

  async getMyBusinesses() {
    const response = await api.get('/businesses/my');
    return response.data;
  }

  async getBusiness(id) {
    const response = await api.get(`/businesses/${id}`);
    return response.data;
  }

  async updateBusiness(id, businessData) {
    const response = await api.patch(`/businesses/${id}`, businessData);
    return response.data;
  }

  async deleteBusiness(id) {
    const response = await api.delete(`/businesses/${id}`);
    return response.data;
  }

  async addUserToBusiness(businessId, userId) {
    const response = await api.post(`/businesses/${businessId}/users/${userId}`);
    return response.data;
  }

  async removeUserFromBusiness(businessId, userId) {
    const response = await api.delete(`/businesses/${businessId}/users/${userId}`);
    return response.data;
  }

  async getBusinessAccounts(businessId) {
    const response = await api.get(`/businesses/${businessId}/accounts`);
    return response.data;
  }

  async getBusinessUsers(businessId) {
    const response = await api.get(`/businesses/${businessId}/users`);
    return response.data;
  }
}

const businessService = new BusinessService();
export default businessService; 