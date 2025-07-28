import axios from 'axios';
import { createStandaloneToast } from '@chakra-ui/toast';

// Create standalone toast instance
const { toast } = createStandaloneToast();

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling responses and errors
api.interceptors.response.use(
  (response) => {
    // Calculate response time
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data,
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Calculate response time for errors
    const endTime = new Date();
    const duration = originalRequest?.metadata?.startTime 
      ? `${endTime - originalRequest.metadata.startTime}ms`
      : 'unknown';

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
        status: error.response?.status,
        duration,
        error: error.message,
        response: error.response?.data,
      });
    }

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          
          // Temporarily disable redirect for development/testing
          if (process.env.NODE_ENV === 'production') {
            window.location.href = '/login';
          }
          
          toast({
            title: 'Session Expired',
            description: 'Please log in again to continue.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          break;

        case 403:
          // Forbidden
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to perform this action.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          break;

        case 404:
          // Not Found
          toast({
            title: 'Resource Not Found',
            description: 'The requested resource could not be found.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          break;

        case 422:
          // Validation Error
          const validationErrors = data?.errors || data?.message || 'Validation failed';
          toast({
            title: 'Validation Error',
            description: Array.isArray(validationErrors) 
              ? validationErrors.join(', ') 
              : validationErrors,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          break;

        case 429:
          // Rate Limited
          toast({
            title: 'Too Many Requests',
            description: 'Please wait a moment before trying again.',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
          break;

        case 500:
          // Server Error
          toast({
            title: 'Server Error',
            description: 'An unexpected error occurred. Please try again later.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          break;

        default:
          // Other server errors
          toast({
            title: 'Error',
            description: data?.message || 'An error occurred while processing your request.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
      }
    } else if (error.request) {
      // Network error
      toast({
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your internet connection.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } else {
      // Other errors
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }

    return Promise.reject(error);
  }
);

// Retry logic for failed requests
const retryRequest = async (error, retryCount = 0, maxRetries = 3) => {
  const originalRequest = error.config;

  // Don't retry if we've exceeded max retries or if it's a client error (except 429)
  if (retryCount >= maxRetries || (error.response?.status >= 400 && error.response?.status !== 429)) {
    return Promise.reject(error);
  }

  // Exponential backoff delay
  const delay = Math.pow(2, retryCount) * 1000;
  
  // Wait before retrying
  await new Promise(resolve => setTimeout(resolve, delay));

  // Retry the request
  return api(originalRequest);
};

// Enhanced API service with retry logic
const enhancedApi = {
  request: async (config) => {
    try {
      return await api(config);
    } catch (error) {
      return retryRequest(error);
    }
  },

  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      return retryRequest(error);
    }
  },

  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      return retryRequest(error);
    }
  },

  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      return retryRequest(error);
    }
  },

  patch: async (url, data = {}, config = {}) => {
    try {
      return await api.patch(url, data, config);
    } catch (error) {
      return retryRequest(error);
    }
  },

  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      return retryRequest(error);
    }
  },

  upload: async (url, formData, config = {}) => {
    try {
      return await api.post(url, formData, {
        ...config,
        headers: {
          ...config.headers,
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (error) {
      return retryRequest(error);
    }
  },

  download: async (url, config = {}) => {
    try {
      return await api.get(url, {
        ...config,
        responseType: 'blob',
      });
    } catch (error) {
      return retryRequest(error);
    }
  },
};

// Utility functions
const apiUtils = {
  isSuccess: (response) => response && response.status >= 200 && response.status < 300,
  
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  getPaginationParams: (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc') => ({
    page,
    limit,
    sortBy,
    sortOrder,
  }),

  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },
};

export default enhancedApi;
export { apiUtils }; 