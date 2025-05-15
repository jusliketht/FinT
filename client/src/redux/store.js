import { configureStore } from '@reduxjs/toolkit';
import transactionReducer from './slices/transactionSlice';

const store = configureStore({
  reducer: {
    transactions: transactionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export { store };
export default store; 