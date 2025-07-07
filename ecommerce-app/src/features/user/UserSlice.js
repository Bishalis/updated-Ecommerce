import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// import { fetchCount } from './counterAPI';
import {
  fetchLoggedInUser,
  fetchLoggedInUserOrders,
  updateUser,
} from "./UserApi";
import { fetchAllOrders } from "../orders/OrdersApi";
import { updateOrderStatus } from "../orders/OrdersApi";

const initialState = {
  userOrders: [],
  allOrders: [], // for admin
  status: "idle",
  userInfo: null, // this will have more info
};

export const fetchUserLoggedInOrderAsync = createAsyncThunk(
  "user/fetchLoggedInUserOrders",
  async (id) => {
    const response = await fetchLoggedInUserOrders(id);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const fetchLoggedInUserAsync = createAsyncThunk(
  "user/fetchLoggedInUser",
  async (id) => {
    const response = await fetchLoggedInUser(id);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const updateUserAsync = createAsyncThunk(
  "user/updateUser",
  async (id) => {
    const response = await updateUser(id);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const fetchAllOrdersAsync = createAsyncThunk(
  "user/fetchAllOrders",
  async () => {
    const response = await fetchAllOrders();
    return response.data;
  }
);

export const updateOrderStatusAsync = createAsyncThunk(
  "user/updateOrderStatus",
  async ({ orderId, status }) => {
    const response = await updateOrderStatus(orderId, status);
    return { orderId, status, updatedOrder: response.data };
  }
);

export const authSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLoggedInOrderAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserLoggedInOrderAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.userOrders = action.payload;
      })

      .addCase(updateUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.userOrders = action.payload;
      })
      .addCase(fetchLoggedInUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchLoggedInUserAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.userInfo = action.payload;
      })
      .addCase(fetchAllOrdersAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.allOrders = action.payload;
      })
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        const { orderId, updatedOrder } = action.payload;
        // Update in userOrders - ensure it's an array before mapping
        if (Array.isArray(state.userOrders)) {
          state.userOrders = state.userOrders.map(order => 
            (order._id || order.id) === orderId ? updatedOrder : order
          );
        }
        // Update in allOrders - ensure it's an array before mapping
        if (Array.isArray(state.allOrders)) {
          state.allOrders = state.allOrders.map(order => 
            (order._id || order.id) === orderId ? updatedOrder : order
          );
        }
      });
  },
});


export const selectUserOrders = (state) => state.user.userOrders;

export const selectUserInfo = (state) => state.user.userInfo;

export const selectAllOrders = (state) => state.user.allOrders;

export default authSlice.reducer;


