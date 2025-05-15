import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Handle different error status codes
    if (response) {
      switch (response.status) {
        case 400:
          console.error('Bad Request:', response.data);
          break;
        case 401:
          console.error('Unauthorized:', response.data);
          break;
        case 403:
          console.error('Forbidden:', response.data);
          break;
        case 404:
          console.error('Not Found:', response.data);
          break;
        case 500:
          console.error('Server Error:', response.data);
          break;
        default:
          console.error('API Error:', response.data);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 