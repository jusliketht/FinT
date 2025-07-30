import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import userService from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and validate it on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (token && !isDevelopment) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token) => {
    try {
      const response = await api.get('/auth/me');
      if (response.status === 200) {
        // Handle the wrapped response structure
        const userData = response.data.data || response.data;
        setUser(userData);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await userService.login({ email, password });
      
      // Handle the wrapped response structure from the API interceptor
      const data = response.data || response;
      
      // Check if the response has the expected structure
      if (data && data.user && data.access_token) {
        setUser(data.user);
        localStorage.setItem('authToken', data.access_token);
        return { success: true, data };
      } else {
        console.error('Invalid response structure:', data);
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error response formats
      let errorMessage = 'Login failed';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await userService.createUser(userData);
      const data = response.data || response;
      setUser(data.user);
      localStorage.setItem('authToken', data.access_token);
      return { success: true, data };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 