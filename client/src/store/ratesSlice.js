import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchRates = createAsyncThunk('rates/fetch', async () => {
  const { data } = await api.get('/rates');
  return data.data;
});

const ratesSlice = createSlice({
  name: 'rates',
  initialState: {
    goldRate: 7200, silverRate: 92,
    goldRate24K: 7854, goldRate22K: 7200, goldRate18K: 5890,
    fetchedAt: null, loading: false
  },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchRates.pending, (s) => { s.loading = true; })
     .addCase(fetchRates.fulfilled, (s, { payload }) => {
       return { ...s, ...payload, loading: false };
     })
     .addCase(fetchRates.rejected, (s) => { s.loading = false; });
  }
});

export default ratesSlice.reducer;
