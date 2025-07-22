import React, { createContext, useContext, useState } from 'react';

const TransactionContext = createContext();

export const useTransaction = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransaction must be used within a TransactionProvider');
  }
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const openAddTransaction = () => {
    setSelectedTransaction(null);
    setIsModalOpen(true);
  };

  const openEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleTransactionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    closeModal();
  };

  const value = {
    isModalOpen,
    selectedTransaction,
    refreshTrigger,
    openAddTransaction,
    openEditTransaction,
    closeModal,
    handleTransactionSuccess,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}; 