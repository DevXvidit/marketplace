import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import ratesReducer from './ratesSlice';
import cartReducer from './cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    rates: ratesReducer,
    cart: cartReducer,
  },
});
