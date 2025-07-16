import { useState, useEffect, useCallback } from 'react';
import transactionService from '../services/transactionService';
import { useBusiness } from '../contexts/BusinessContext';

export const useTransactions = (filters = {}) => {
  const { selectedBusiness } = useBusiness();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const loadTransactions = useCallback(async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = {
        ...filters,
        businessId: selectedBusiness.id,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await transactionService.getAll(params);
      setTransactions(response.transactions);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        totalPages: response.totalPages
      }));
    } catch (err) {
      setError(err.message || 'Failed to load transactions');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, filters, pagination.page, pagination.limit]);

  const createTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newTransaction = await transactionService.create({
        ...transactionData,
        businessId: selectedBusiness?.id
      });
      
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      setError(err.message || 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness]);

  const updateTransaction = useCallback(async (id, transactionData) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedTransaction = await transactionService.update(id, transactionData);
      
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      return updatedTransaction;
    } catch (err) {
      setError(err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await transactionService.delete(id);
      
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setPage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const refresh = useCallback(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    loading,
    error,
    pagination,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setPage,
    setLimit,
    refresh
  };
};

export default useTransactions; 