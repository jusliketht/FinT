import { useState, useCallback } from 'react';
import api from '../services/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (config) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api(config);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((url, config = {}) => {
    return request({ ...config, method: 'GET', url });
  }, [request]);

  const post = useCallback((url, data, config = {}) => {
    return request({ ...config, method: 'POST', url, data });
  }, [request]);

  const put = useCallback((url, data, config = {}) => {
    return request({ ...config, method: 'PUT', url, data });
  }, [request]);

  const del = useCallback((url, config = {}) => {
    return request({ ...config, method: 'DELETE', url });
  }, [request]);

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