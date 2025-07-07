import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { addToCart ,fetchItemsByUserId, updatecart,deletecart, resetCart} from './CartApi';

const initialState = {
  value: 0,
  status: 'idle',
  items:[],
  cartLoaded : false,
  error: null,
  success: null
};


export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async (item, { rejectWithValue }) => {
    try {
      const response = await addToCart(item);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const updateItemAsync = createAsyncThunk(
  'cart/updatecart',
  async (update, { rejectWithValue }) => {
    try {
      const response = await updatecart(update);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const deleteItemAsync = createAsyncThunk(
  'cart/deletecart',
  async (itemId, { rejectWithValue }) => {
    try {
      const response = await deletecart(itemId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const fetchItemsByUserIdAsync = createAsyncThunk(
  'cart/fetchItemsByUserId',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await fetchItemsByUserId(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetcartAsync = createAsyncThunk(
  'cart/resetCart',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await resetCart(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const cartSlice = createSlice({
  name: 'cart',  // Corrected slice name
  initialState,
  reducers: {
    // You can add synchronous reducers here if needed
    clearCart: (state) => {
      state.items = [];
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add to Cart
      .addCase(addToCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        console.log('addToCartAsync.fulfilled called with payload:', action.payload);
        state.status = 'succeeded';
        state.success = 'Added to cart!';
        state.error = null;
        
        // Ensure payload exists and has required fields
        if (!action.payload || !action.payload.id) {
          console.error('Invalid cart item payload:', action.payload);
          return;
        }

        const existingIndex = state.items.findIndex(
          item => item.product === action.payload.product
        );

        if (existingIndex >= 0) {
          // Update quantity if item exists
          state.items[existingIndex].quantity += action.payload.quantity || 1;
          console.log('Updated existing item quantity:', state.items[existingIndex]);
        } else {
          // Add new item with required structure
          const newItem = {
            id: action.payload.id,
            product: action.payload.product,
            title: action.payload.title,
            price: action.payload.price,
            quantity: action.payload.quantity || 1,
            thumbnail: action.payload.thumbnail,
          };
          state.items.push(newItem);
          console.log('Added new item to cart:', newItem);
        }
        console.log('Current cart items:', state.items);
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to add item to cart';
        state.success = null;
      })

      // Fetch Cart Items
      .addCase(fetchItemsByUserIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchItemsByUserIdAsync.fulfilled, (state, action) => {
        console.log('fetchItemsByUserIdAsync.fulfilled called with payload:', action.payload);
        state.status = 'succeeded';
        state.items = Array.isArray(action.payload) 
          ? action.payload.map(item => ({
              id: item.id,
              product: item.product,
              title: item.title,
              price: item.price,
              quantity: item.quantity,
              thumbnail: item.thumbnail,
            }))
          : [];
        console.log('Updated cart items from fetch:', state.items);
        state.cartLoaded = true;
      })
      .addCase(fetchItemsByUserIdAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || 'Failed to load cart';
        state.cartLoaded = true;
      })

      // Update Cart Item
      .addCase(updateItemAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateItemAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            quantity: action.payload.quantity
          };
        }
      })

      // Delete Cart Item
      .addCase(deleteItemAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const deletedId = action.payload && action.payload.id
          ? action.payload.id
          : action.meta.arg; // meta.arg is the id sent to the thunk
        state.items = state.items.filter(item => item.id !== deletedId);
      })

      // Reset Cart
      .addCase(resetcartAsync.fulfilled, (state) => {
        state.status = 'succeeded';
        state.items = [];
      });
  }
});



export const selectItems = (state) => state.cart.items;
export const selectCartStatus = (state) => state.cart.status;
export const selectCartError = (state) => state.cart.error;
export const selectCartLoaded = (state) => state.cart.cartLoaded;
export const selectCartSuccess = (state) => state.cart.success;

export default cartSlice.reducer;
