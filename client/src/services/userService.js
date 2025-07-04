import api from './api';

class UserService {
  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  }

  async getAllUsers() {
    const response = await api.get('/users');
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  }

  async getUser(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id, userData) {
    const response = await api.patch(`/users/${id}`, userData);
    return response.data;
  }

  async updateProfile(userData) {
    const response = await api.patch('/users/me', userData);
    return response.data;
  }

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }

  async updateUserRole(id, role) {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  }

  async updateUserPermissions(id, permissions) {
    const response = await api.patch(`/users/${id}/permissions`, { permissions });
    return response.data;
  }

  async getUserBusinesses(id) {
    const response = await api.get(`/users/${id}/businesses`);
    return response.data;
  }

  async getCurrentUserBusinesses() {
    const user = await this.getCurrentUser();
    return this.getUserBusinesses(user.id);
  }

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async logout() {
    // Clear any stored tokens or user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/users/me/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }

  async resetPassword(email) {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  }

  async verifyResetToken(token) {
    const response = await api.get(`/auth/reset-password/${token}`);
    return response.data;
  }

  async setNewPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  }
}

const userService = new UserService();
export default userService; 