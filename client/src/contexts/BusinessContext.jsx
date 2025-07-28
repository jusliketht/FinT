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
  const [isPersonalMode, setIsPersonalMode] = useState(true); // Default to personal mode
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      fetchBusinesses();
    } else {
      setLoading(false);
    }
    loadSavedContext();
  }, []);

  const loadSavedContext = () => {
    // Load saved context from localStorage
    const savedBusinessId = localStorage.getItem('selectedBusinessId');
    const savedMode = localStorage.getItem('isPersonalMode');
    
    if (savedMode === 'false' && savedBusinessId) {
      setIsPersonalMode(false);
      // Business will be set after fetchBusinesses completes
    } else {
      setIsPersonalMode(true);
      setSelectedBusiness(null);
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getAll();
      setBusinesses(data);
      
      // Auto-select saved business if not in personal mode
      const savedBusinessId = localStorage.getItem('selectedBusinessId');
      const savedMode = localStorage.getItem('isPersonalMode');
      
      if (savedMode === 'false' && savedBusinessId && data.length > 0) {
        const savedBusiness = data.find(b => b.id === savedBusinessId);
        if (savedBusiness) {
          setSelectedBusiness(savedBusiness);
          setIsPersonalMode(false);
        } else {
          // Saved business not found, switch to personal mode
          setIsPersonalMode(true);
          setSelectedBusiness(null);
          localStorage.setItem('isPersonalMode', 'true');
          localStorage.removeItem('selectedBusinessId');
        }
      } else if (data.length > 0 && !selectedBusiness && !isPersonalMode) {
        // Auto-select first business if none selected and not in personal mode
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
    setIsPersonalMode(false);
    // Store selected business and mode in localStorage for persistence
    localStorage.setItem('selectedBusinessId', business?.id || '');
    localStorage.setItem('isPersonalMode', 'false');
  };

  const switchToPersonalMode = () => {
    setSelectedBusiness(null);
    setIsPersonalMode(true);
    localStorage.setItem('isPersonalMode', 'true');
    localStorage.removeItem('selectedBusinessId');
  };

  const switchToBusinessMode = (business) => {
    if (business) {
      selectBusiness(business);
    } else if (businesses.length > 0) {
      selectBusiness(businesses[0]);
    }
  };

  const createBusiness = async (businessData) => {
    try {
      const newBusiness = await businessService.create(businessData);
      setBusinesses(prev => [...prev, newBusiness]);
      
      // Auto-select newly created business
      if (!selectedBusiness && !isPersonalMode) {
        selectBusiness(newBusiness);
      }
      
      return newBusiness;
    } catch (err) {
      throw err;
    }
  };

  const updateBusiness = async (id, data) => {
    try {
      const updatedBusiness = await businessService.update(id, data);
      setBusinesses(prev => prev.map(b => b.id === id ? updatedBusiness : b));
      
      // Update selected business if it's the one being updated
      if (selectedBusiness?.id === id) {
        setSelectedBusiness(updatedBusiness);
      }
      
      return updatedBusiness;
    } catch (err) {
      throw err;
    }
  };

  const deleteBusiness = async (id) => {
    try {
      await businessService.delete(id);
      setBusinesses(prev => prev.filter(b => b.id !== id));
      
      // If deleted business was selected, switch to personal mode
      if (selectedBusiness?.id === id) {
        switchToPersonalMode();
      }
    } catch (err) {
      throw err;
    }
  };

  const getCurrentContext = () => {
    if (isPersonalMode) {
      return {
        type: 'personal',
        name: 'Personal',
        id: null,
        description: 'Personal financial management'
      };
    }
    
    return {
      type: 'business',
      name: selectedBusiness?.name || 'Business',
      id: selectedBusiness?.id,
      description: selectedBusiness?.description || 'Business financial management'
    };
  };

  const value = {
    businesses,
    selectedBusiness,
    isPersonalMode,
    loading,
    error,
    selectBusiness,
    switchToPersonalMode,
    switchToBusinessMode,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    getCurrentContext,
    refreshBusinesses: fetchBusinesses
  };

  return (
    <BusinessContext.Provider value={value}>
      {children}
    </BusinessContext.Provider>
  );
}; 