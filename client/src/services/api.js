import axios from 'axios';

// Clear any existing tokens on startup to ensure fresh state
localStorage.removeItem('token');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Validate JWT token format
const isValidJWT = (token) => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Debug token issues
    if (token && !isValidJWT(token)) {
      console.warn('Invalid token format detected:', token);
      localStorage.removeItem('token');
      window.location.href = '/login';
      return config;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information
    if (error.response?.status === 401) {
      console.error('Authentication error:', {
        status: error.response.status,
        message: error.response.data?.message,
        headers: error.response.headers,
      });
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 