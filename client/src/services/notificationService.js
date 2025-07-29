import api from './api';

const RESOURCE_URL = '/notifications';

/**
 * Notification Service for backend API calls
 */
const notificationService = {
  /**
   * Get all notifications for the current user
   * @param {Object} filters - Optional filters (isRead, type, limit)
   * @returns {Promise<Object>} - List of notifications
   */
  getNotifications: async (filters = {}) => {
    const response = await api.get(RESOURCE_URL, { params: filters });
    return response.data;
  },

  /**
   * Get a single notification by ID
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} - Notification details
   */
  getById: async (id) => {
    const response = await api.get(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Mark a notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} - Updated notification
   */
  markAsRead: async (id) => {
    const response = await api.patch(`${RESOURCE_URL}/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} - Update confirmation
   */
  markAllAsRead: async () => {
    const response = await api.patch(`${RESOURCE_URL}/mark-all-read`);
    return response.data;
  },

  /**
   * Delete a notification
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  deleteNotification: async (id) => {
    const response = await api.delete(`${RESOURCE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new notification
   * @param {Object} data - Notification data
   * @returns {Promise<Object>} - Created notification
   */
  create: async (data) => {
    const response = await api.post(RESOURCE_URL, data);
    return response.data;
  },

  /**
   * Get unread notification count
   * @returns {Promise<Object>} - Unread count
   */
  getUnreadCount: async () => {
    const response = await api.get(`${RESOURCE_URL}/unread-count`);
    return response.data;
  },

  /**
   * Get notification preferences
   * @returns {Promise<Object>} - Notification preferences
   */
  getPreferences: async () => {
    const response = await api.get(`${RESOURCE_URL}/preferences`);
    return response.data;
  },

  /**
   * Update notification preferences
   * @param {Object} data - Updated preferences
   * @returns {Promise<Object>} - Updated preferences
   */
  updatePreferences: async (data) => {
    const response = await api.put(`${RESOURCE_URL}/preferences`, data);
    return response.data;
  },

  /**
   * Subscribe to notification channels
   * @param {Object} data - Subscription data
   * @returns {Promise<Object>} - Subscription confirmation
   */
  subscribe: async (data) => {
    const response = await api.post(`${RESOURCE_URL}/subscribe`, data);
    return response.data;
  },

  /**
   * Unsubscribe from notification channels
   * @param {Object} data - Unsubscription data
   * @returns {Promise<Object>} - Unsubscription confirmation
   */
  unsubscribe: async (data) => {
    const response = await api.post(`${RESOURCE_URL}/unsubscribe`, data);
    return response.data;
  }
};

export default notificationService; 