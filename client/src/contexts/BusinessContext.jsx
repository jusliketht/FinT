import React, { createContext, useContext, useState, useEffect } from 'react';
import businessService from '../services/businessService';

const BusinessContext = createContext();

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (!context) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
};

export const BusinessProvider = ({ children }) => {
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getAll();
      setBusinesses(data);
      
      // Auto-select first business if none selected
      if (data.length > 0 && !selectedBusiness) {
        setSelectedBusiness(data[0]);
      }
    } catch (err) {
      setError('Failed to fetch businesses');
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectBusiness = (business) => {
    setSelectedBusiness(business);
    // Store selected business in localStorage for persistence
    localStorage.setItem('selectedBusinessId', business?.id || '');
  };

  const createBusiness = async (businessData) => {
    try {
      const newBusiness = await businessService.create(businessData);
      setBusinesses(prev => [...prev, newBusiness]);
      
      // Auto-select newly created business
      if (!selectedBusiness) {
        setSelectedBusiness(newBusiness);
      }
      
      return newBusiness;
    } catch (err) {
      throw err;
    }
  };

  const updateBusiness = async (businessId, businessData) => {
    try {
      const updatedBusiness = await businessService.update(businessId, businessData);
      setBusinesses(prev => 
        prev.map(business => 
          business.id === businessId ? updatedBusiness : business
        )
      );
      
      // Update selected business if it's the one being updated
      if (selectedBusiness?.id === businessId) {
        setSelectedBusiness(updatedBusiness);
      }
      
      return updatedBusiness;
    } catch (err) {
      throw err;
    }
  };

  const deleteBusiness = async (businessId) => {
    try {
      await businessService.delete(businessId);
      setBusinesses(prev => prev.filter(business => business.id !== businessId));
      
      // Clear selected business if it's the one being deleted
      if (selectedBusiness?.id === businessId) {
        setSelectedBusiness(null);
      }
    } catch (err) {
      throw err;
    }
  };

  const refreshBusinesses = () => {
    fetchBusinesses();
  };

  // Load selected business from localStorage on mount
  useEffect(() => {
    const savedBusinessId = localStorage.getItem('selectedBusinessId');
    if (savedBusinessId && businesses.length > 0) {
      const savedBusiness = businesses.find(b => b.id === savedBusinessId);
      if (savedBusiness) {
        setSelectedBusiness(savedBusiness);
      }
    }
  }, [businesses]);

  // Save selected business to localStorage when it changes
  useEffect(() => {
    if (selectedBusiness) {
      localStorage.setItem('selectedBusinessId', selectedBusiness.id);
    } else {
      localStorage.removeItem('selectedBusinessId');
    }
  }, [selectedBusiness]);

  const value = {
    businesses,
    selectedBusiness,
    loading,
    error,
    selectBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    refreshBusinesses,
    setSelectedBusiness
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
};

export default BusinessContext; 