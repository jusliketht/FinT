import apiService from './api';

class UserService {
  async createUser(userData) {
    const response = await apiService.post('/users', userData);
    return response.data;
  }

  async getAllUsers() {
    const response = await apiService.get('/users');
    return response;
  }

  async getCurrentUser() {
    const response = await apiService.get('/users/me');
    return response.data;
  }

  async getUser(id) {
    const response = await apiService.get(`/users/${id}`);
    return response;
  }

  async updateUser(id, userData) {
    const response = await apiService.patch(`/users/${id}`, userData);
    return response;
  }

  async updateProfile(userData) {
    const response = await apiService.patch('/users/me', userData);
    return response;
  }

  async deleteUser(id) {
    const response = await apiService.delete(`/users/${id}`);
    return response;
  }

  async updateUserRole(id, role) {
    const response = await apiService.patch(`/users/${id}/role`, { role });
    return response;
  }

  async updateUserPermissions(id, permissions) {
    const response = await apiService.patch(`/users/${id}/permissions`, { permissions });
    return response;
  }

  async getUserBusinesses(id) {
    const response = await apiService.get(`/users/${id}/businesses`);
    return response;
  }

  async getCurrentUserBusinesses() {
    const user = await this.getCurrentUser();
    return this.getUserBusinesses(user.id);
  }

  async login(credentials) {
    const response = await apiService.post('/auth/login', credentials);
    return response.data;
  }

  async logout() {
    // Clear any stored tokens or user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async changePassword(currentPassword, newPassword) {
    const response = await apiService.post('/users/me/change-password', {
      currentPassword,
      newPassword
    });
    return response;
  }

  async resetPassword(email) {
    const response = await apiService.post('/auth/reset-password', { email });
    return response;
  }

  async verifyResetToken(token) {
    const response = await apiService.get(`/auth/reset-password/${token}`);
    return response;
  }

  async setNewPassword(token, newPassword) {
    const response = await apiService.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response;
  }
}

const userService = new UserService();
export default userService; 