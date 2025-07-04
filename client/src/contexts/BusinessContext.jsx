import React, { createContext, useContext, useState, useEffect } from 'react';
import businessService from '../services/businessService';
import { useAuth } from './AuthContext';

const BusinessContext = createContext();

export function BusinessProvider({ children }) {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      loadUserBusinesses();
    } else {
      setBusinesses([]);
      setSelectedBusiness(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getMyBusinesses();
      setBusinesses(data);
      
      // If there's a selected business, refresh its data
      if (selectedBusiness) {
        const updatedBusiness = data.find(b => b.id === selectedBusiness.id);
        if (updatedBusiness) {
          setSelectedBusiness(updatedBusiness);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load businesses');
      console.error('Error loading businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBusiness = async (businessData) => {
    try {
      setLoading(true);
      setError(null);
      const newBusiness = await businessService.createBusiness(businessData);
      setBusinesses(prev => [...prev, newBusiness]);
      return newBusiness;
    } catch (err) {
      setError(err.message || 'Failed to create business');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBusiness = async (id, businessData) => {
    try {
      setLoading(true);
      setError(null);
      const updatedBusiness = await businessService.updateBusiness(id, businessData);
      setBusinesses(prev => prev.map(b => b.id === id ? updatedBusiness : b));
      
      if (selectedBusiness?.id === id) {
        setSelectedBusiness(updatedBusiness);
      }
      
      return updatedBusiness;
    } catch (err) {
      setError(err.message || 'Failed to update business');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteBusiness = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await businessService.deleteBusiness(id);
      setBusinesses(prev => prev.filter(b => b.id !== id));
      
      if (selectedBusiness?.id === id) {
        setSelectedBusiness(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to delete business');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addUserToBusiness = async (businessId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const updatedBusiness = await businessService.addUserToBusiness(businessId, userId);
      setBusinesses(prev => prev.map(b => b.id === businessId ? updatedBusiness : b));
      
      if (selectedBusiness?.id === businessId) {
        setSelectedBusiness(updatedBusiness);
      }
      
      return updatedBusiness;
    } catch (err) {
      setError(err.message || 'Failed to add user to business');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeUserFromBusiness = async (businessId, userId) => {
    try {
      setLoading(true);
      setError(null);
      const updatedBusiness = await businessService.removeUserFromBusiness(businessId, userId);
      setBusinesses(prev => prev.map(b => b.id === businessId ? updatedBusiness : b));
      
      if (selectedBusiness?.id === businessId) {
        setSelectedBusiness(updatedBusiness);
      }
      
      return updatedBusiness;
    } catch (err) {
      setError(err.message || 'Failed to remove user from business');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    businesses,
    selectedBusiness,
    setSelectedBusiness,
    loading,
    error,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    addUserToBusiness,
    removeUserFromBusiness,
    refreshBusinesses: loadUserBusinesses
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
} 