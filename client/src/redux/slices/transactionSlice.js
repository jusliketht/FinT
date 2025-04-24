import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Upload file
export const uploadFile = createAsyncThunk(
  'transactions/uploadFile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'File upload failed');
    }
  }
);

// Get transactions
export const getTransactions = createAsyncThunk(
  'transactions/getTransactions',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/transactions', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);

// Generate balance sheet
export const generateBalanceSheet = createAsyncThunk(
  'transactions/generateBalanceSheet',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/balance-sheet', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `balance-sheet-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate balance sheet');
    }
  }
);

// Generate profit and loss statement
export const generateProfitLoss = createAsyncThunk(
  'transactions/generateProfitLoss',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/profit-loss', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `profit-loss-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate profit & loss statement');
    }
  }
);

// Generate cash flow statement
export const generateCashFlow = createAsyncThunk(
  'transactions/generateCashFlow',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/reports/cash-flow', {
        params,
        responseType: 'blob'
      });
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cash-flow-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate cash flow statement');
    }
  }
);

const initialState = {
  transactions: [],
  totalTransactions: 0,
  loading: false,
  uploadLoading: false,
  reportLoading: false,
  error: null,
  uploadSuccess: false
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetUploadSuccess: (state) => {
      state.uploadSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload file
      .addCase(uploadFile.pending, (state) => {
        state.uploadLoading = true;
        state.error = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.uploadLoading = false;
        state.uploadSuccess = true;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.uploadLoading = false;
        state.error = action.payload;
        state.uploadSuccess = false;
      })
      
      // Get transactions
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.totalTransactions = action.payload.total;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Generate reports (shared loading state for all reports)
      .addCase(generateBalanceSheet.pending, (state) => {
        state.reportLoading = true;
        state.error = null;
      })
      .addCase(generateBalanceSheet.fulfilled, (state) => {
        state.reportLoading = false;
      })
      .addCase(generateBalanceSheet.rejected, (state, action) => {
        state.reportLoading = false;
        state.error = action.payload;
      })
      
      .addCase(generateProfitLoss.pending, (state) => {
        state.reportLoading = true;
        state.error = null;
      })
      .addCase(generateProfitLoss.fulfilled, (state) => {
        state.reportLoading = false;
      })
      .addCase(generateProfitLoss.rejected, (state, action) => {
        state.reportLoading = false;
        state.error = action.payload;
      })
      
      .addCase(generateCashFlow.pending, (state) => {
        state.reportLoading = true;
        state.error = null;
      })
      .addCase(generateCashFlow.fulfilled, (state) => {
        state.reportLoading = false;
      })
      .addCase(generateCashFlow.rejected, (state, action) => {
        state.reportLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, resetUploadSuccess } = transactionSlice.actions;
export default transactionSlice.reducer; 