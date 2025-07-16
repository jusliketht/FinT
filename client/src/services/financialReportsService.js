import api from './api';

export const financialReportsService = {
  // Ledger
  getAccountLedger: (accountId, params = {}) => 
    api.get(`/financial-reports/ledger/${accountId}`, { params }),

  // Trial Balance
  getTrialBalance: (params = {}) => 
    api.get('/financial-reports/trial-balance', { params }),

  // Profit & Loss
  getProfitAndLoss: (params = {}) => 
    api.get('/financial-reports/profit-and-loss', { params }),

  // Balance Sheet
  getBalanceSheet: (params = {}) => 
    api.get('/financial-reports/balance-sheet', { params }),

  // Cash Flow
  getCashFlow: (params = {}) => 
    api.get('/financial-reports/cash-flow', { params }),
}; 