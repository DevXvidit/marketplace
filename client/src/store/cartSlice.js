import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchWishlist = createAsyncThunk('cart/fetchWishlist', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/users/wishlist');
    return data.data || [];
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to load wishlist');
  }
});

export const toggleWishlistRemote = createAsyncThunk('cart/toggleWishlistRemote', async (product, { dispatch, rejectWithValue }) => {
  try {
    await api.post(`/users/wishlist/${product._id}`);
    dispatch(fetchWishlist());
    return { productId: product._id };
  } catch (e) {
    return rejectWithValue(e.response?.data?.message || 'Failed to update wishlist');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], wishlist: [], wishlistLoading: false },
  reducers: {
    addToCart: (state, { payload }) => {
      const exists = state.items.find(i => i._id === payload._id);
      if (!exists) state.items.push({ ...payload, qty: 1 });
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter(i => i._id !== payload);
    },
    clearCart: (state) => { state.items = []; },
    clearWishlist: (state) => { state.wishlist = []; },
  }
  ,
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.wishlistLoading = true;
      })
      .addCase(fetchWishlist.fulfilled, (state, { payload }) => {
        state.wishlist = payload;
        state.wishlistLoading = false;
      })
      .addCase(fetchWishlist.rejected, (state) => {
        state.wishlistLoading = false;
      })
      .addCase(toggleWishlistRemote.pending, (state, action) => {
        const product = action.meta.arg;
        if (!product?._id) return;
        const idx = state.wishlist.findIndex(i => i._id === product._id);
        if (idx > -1) state.wishlist.splice(idx, 1);
        else state.wishlist.push(product);
      });
  }
});

export const { addToCart, removeFromCart, clearCart, clearWishlist } = cartSlice.actions;
export default cartSlice.reducer;
