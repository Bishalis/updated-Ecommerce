import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../features/product-list/ProductListSlice";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/Cart/CartSlice";
import orderReducer from "../features/orders/OrdersSlice";
import userReducer from "../features/user/UserSlice";
export const store = configureStore({
  reducer: {
    product: productReducer,
    auth: authReducer,
    cart: cartReducer,
    order: orderReducer,
    user: userReducer,
  },
});
