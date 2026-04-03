import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

const getInitialUser = () => {
  const s = sessionStorage.getItem('user');
  if (s) return JSON.parse(s);
  const l = localStorage.getItem('user');
  if (l) return JSON.parse(l);
  return null;
};

const getInitialToken = () => sessionStorage.getItem('token') || localStorage.getItem('token') || null;

export const loginUser = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    const storage = data.data.role === 'admin' ? sessionStorage : localStorage;
    storage.setItem('user', JSON.stringify(data.data));
    storage.setItem('token', data.token);
    return { user: data.data, token: data.token };
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Login failed'); }
});

export const registerUser = createAsyncThunk('auth/register', async (creds, { rejectWithValue }) => {
  try {
    await api.post('/auth/register', creds);
    return { success: true };
  } catch (e) { return rejectWithValue(e.response?.data?.message || 'Registration failed'); }
});

export const getMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (e) { return rejectWithValue(e.response?.data?.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: getInitialUser(), token: getInitialToken(), loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null; state.token = null;
      localStorage.removeItem('user'); localStorage.removeItem('token');
      sessionStorage.removeItem('user'); sessionStorage.removeItem('token');
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, { payload }) => { state.loading = false; state.error = payload; };
    builder
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading = false; state.user = payload.user; state.token = payload.token;
      })
      .addCase(loginUser.rejected, rejected)
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, rejected)
      .addCase(getMe.fulfilled, (state, { payload }) => { state.user = payload; });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
