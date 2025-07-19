import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized - token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post('/auth/refresh', {
            refreshToken,
          });
          
          const { token } = response.data;
          localStorage.setItem('token', token);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Error response format
export const createErrorResponse = (error) => {
  const response = {
    success: false,
    message: 'An unexpected error occurred',
    errors: [],
    statusCode: 500,
    timestamp: new Date().toISOString(),
  };

  if (error.response) {
    // Server responded with error status
    response.statusCode = error.response.status;
    response.message = error.response.data?.message || getErrorMessage(error.response.status);
    response.errors = error.response.data?.errors || [];
  } else if (error.request) {
    // Network error
    response.statusCode = 0;
    response.message = 'Network error. Please check your internet connection.';
  } else {
    // Other error
    response.message = error.message || 'An unexpected error occurred';
  }

  return response;
};

// Get user-friendly error messages
const getErrorMessage = (statusCode) => {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict detected. The resource already exists or has been modified.';
    case 422:
      return 'Validation error. Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Bad gateway. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred.';
  }
};

// Retry mechanism for failed requests
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Determine if request should be retried
const shouldRetry = (error) => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const retryableErrors = ['ECONNRESET', 'ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND'];
  
  return (
    retryableStatuses.includes(error.response?.status) ||
    retryableErrors.includes(error.code) ||
    error.message.includes('timeout')
  );
};

// Enhanced API methods with error handling
export const apiService = {
  // GET request
  async get(url, config = {}) {
    try {
      const response = await retryRequest(() => api.get(url, config));
      return response.data;
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      throw errorResponse;
    }
  },

  // POST request
  async post(url, data = {}, config = {}) {
    try {
      const response = await retryRequest(() => api.post(url, data, config));
      return response.data;
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      throw errorResponse;
    }
  },

  // PUT request
  async put(url, data = {}, config = {}) {
    try {
      const response = await retryRequest(() => api.put(url, data, config));
      return response.data;
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      throw errorResponse;
    }
  },

  // PATCH request
  async patch(url, data = {}, config = {}) {
    try {
      const response = await retryRequest(() => api.patch(url, data, config));
      return response.data;
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      throw errorResponse;
    }
  },

  // DELETE request
  async delete(url, config = {}) {
    try {
      const response = await retryRequest(() => api.delete(url, config));
      return response.data;
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      throw errorResponse;
    }
  },

  // File upload
  async upload(url, file, onProgress, config = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config.headers,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      throw errorResponse;
    }
  },

  // Download file
  async download(url, filename, config = {}) {
    try {
      const response = await api.get(url, {
        ...config,
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (error) {
      const errorResponse = createErrorResponse(error);
      throw errorResponse;
    }
  },
};

// Hook for API calls with automatic error handling
export const useApi = () => {
  const toast = useToast();

  const handleApiCall = async (apiCall, options = {}) => {
    const {
      showLoading = true,
      showSuccess = true,
      showError = true,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
    } = options;

    try {
      if (showLoading) {
        // You can implement a loading state here
      }

      const result = await apiCall();

      if (showSuccess && successMessage) {
        toast.showSuccess(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      if (showError) {
        const message = errorMessage || error.message;
        if (error.statusCode === 0) {
          toast.showNetworkError(error);
        } else if (error.statusCode >= 500) {
          toast.showServerError(error);
        } else if (error.statusCode === 422) {
          toast.showValidationError(error.errors);
        } else {
          toast.showError(message);
        }
      }

      if (onError) {
        onError(error);
      }

      throw error;
    }
  };

  return {
    get: (url, config, options) => handleApiCall(() => apiService.get(url, config), options),
    post: (url, data, config, options) => handleApiCall(() => apiService.post(url, data, config), options),
    put: (url, data, config, options) => handleApiCall(() => apiService.put(url, data, config), options),
    patch: (url, data, config, options) => handleApiCall(() => apiService.patch(url, data, config), options),
    delete: (url, config, options) => handleApiCall(() => apiService.delete(url, config), options),
    upload: (url, file, onProgress, config, options) => 
      handleApiCall(() => apiService.upload(url, file, onProgress, config), options),
    download: (url, filename, config, options) => 
      handleApiCall(() => apiService.download(url, filename, config), options),
  };
};

export default apiService; 