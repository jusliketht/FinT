import { useState, useCallback } from 'react';
import enhancedApi from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    try {
      setLoading(true);
      setError(null);
      const response = await enhancedApi.request(config);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config = {}) => {
    return enhancedApi.get(url, config);
  }, []);

  const post = useCallback((url, data, config = {}) => {
    return enhancedApi.post(url, data, config);
  }, []);

  const put = useCallback((url, data, config = {}) => {
    return enhancedApi.put(url, data, config);
  }, []);

  const del = useCallback((url, config = {}) => {
    return enhancedApi.delete(url, config);
  }, []);

  return {
    loading,
    error,
    request,
    get,
    post,
    put,
    delete: del
  };
};

export default useApi; 