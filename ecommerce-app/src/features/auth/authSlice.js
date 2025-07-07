import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { checkAuth, loginUser, signOut, googleLogin } from "./authApi";
import { createUsers } from "./authApi";

const initialState = {
  error: null,
  loggedInUser: null,
  status: "idle",
  userChecked: false,
};

export const createUserAsync = createAsyncThunk(
  "user/createUsers",
  async (userData) => {
    const response = await createUsers(userData);
    // The value we return becomes the `fulfilled` action payload
    return response.data;
  }
);

export const loginUserAsync = createAsyncThunk(
  "user/loginUser",
  async (loginInfo, { rejectWithValue }) => {
    try {
      const response = await loginUser(loginInfo);
      return response.data;
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);

export const signOutAsync = createAsyncThunk("user/signOut", async () => {
  const response = await signOut();
  // The value we return becomes the `fulfilled` action payload
  return response.data;
});

export const checkUserAsync = createAsyncThunk("user/checkAuth", async () => {
  const response = await checkAuth();
  return response.data;
});

export const googleLoginAsync = createAsyncThunk(
  "user/googleLogin",
  async (googleToken, { rejectWithValue }) => {
    try {
      const response = await googleLogin(googleToken);
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(createUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.error = null;
        // Map _id to id if present
        const user = action.payload.user || action.payload;
        state.loggedInUser = user ? { ...user, id: user._id || user.id } : user;
        // Save token to localStorage if present
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      })
      .addCase(checkUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(checkUserAsync.fulfilled, (state, action) => {
        state.status = "idle";
        // Map _id to id if present
        const user = action.payload.user || action.payload;
        state.loggedInUser = user ? { ...user, id: user._id || user.id } : user;
        state.userChecked = true;
      })
      .addCase(checkUserAsync.rejected, (state, action) => {
        state.status = "idle";
        state.userChecked = true;
      })

      .addCase(loginUserAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUserAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.error = null;
        // Map _id to id if present
        const user = action.payload.user || action.payload;
        state.loggedInUser = user ? { ...user, id: user._id || user.id } : user;
        // Save token to localStorage if present
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(loginUserAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      })

      .addCase(signOutAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signOutAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.loggedInUser = null;
        state.error = null;
        // Remove token from localStorage on logout
        localStorage.removeItem('token');
      })
      .addCase(googleLoginAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(googleLoginAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.error = null;
        // Map _id to id if present
        const user = action.payload.user || action.payload;
        state.loggedInUser = user ? { ...user, id: user._id || user.id } : user;
        // Save token to localStorage if present
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(googleLoginAsync.rejected, (state, action) => {
        state.status = "idle";
        state.error = action.payload;
      });
  },
});

export const { increment } = authSlice.actions;
export const selectLoggedInUser = (state) => state.auth.loggedInUser;
export const selectUserChecked = (state) => state.auth.userChecked;
export const selectError = (state) => state.auth.error;

export default authSlice.reducer;
