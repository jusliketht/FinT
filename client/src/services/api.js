import axios from 'axios';

// In development, use the proxy configured in package.json
// In production, use the full URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'http://localhost:5000/api')
  : '/api';

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
    
    // For FormData uploads, remove the default Content-Type header
    // to let the browser set the correct multipart/form-data header
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config?.url,
        method: response.config?.method,
        data: response.data,
        headers: response.headers
      });
      
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
    } else {
      // Network error (no response)
      console.error('Network Error:', {
        message: error.message,
        code: error.code,
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

export default api; 