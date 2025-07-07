import React, { useEffect } from "react";
import "./App.css";
import Home from "./Pages/Home";
import { SignInPage } from "./Pages/SignInPage";
import { SignUpPage } from "./Pages/SignUpPage";
import { BrowserRouter, Route, Routes, Navigate, Link } from "react-router-dom";
import { CartPages } from "./Pages/CartPages";
import { Checkout } from "./Pages/CheckOut";
import { ProductDetailPage } from "./Pages/ProductDetailPage";
import Protected from "./features/auth/Protected";
import { useDispatch, useSelector } from "react-redux";
import { selectLoggedInUser ,checkUserAsync,selectUserChecked} from "./features/auth/authSlice";
import { fetchItemsByUserIdAsync } from "./features/Cart/CartSlice";
import PageNotFound from "./Pages/404";
import OrderSuccessPage from "./Pages/Order-successPage";
import { UserOrders } from "./features/user/components/UserOrder";
import UserOrderPage from "./Pages/UserOrderPage";
import { UserProfile } from "./features/user/components/UserProfile";
import UserProfilePage from "./Pages/UserProfilePage";
import { fetchLoggedInUserAsync } from "./features/user/UserSlice";
import { LogOut } from "./features/auth/LogOut";
import ForgetPasswordPage from "./Pages/ForgetPasswordPage";
import ProductList from "./features/product-list/Components/ProductList";

// Placeholder AdminDashboard component
function AdminDashboard() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link 
          to="/logout" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <Link to="/admin-products" className="block text-blue-600 hover:text-blue-800">Manage Products</Link>
            <Link to="/admin-orders" className="block text-blue-600 hover:text-blue-800">Manage Orders</Link>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Welcome, Admin!</h3>
          <p className="text-gray-600">You have full access to manage products and orders.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <p className="text-gray-600">Check your recent product and order updates here.</p>
        </div>
      </div>
    </div>
  );
}

// Placeholder Admin pages
function AdminProducts() {
  // TODO: Add admin-specific controls (edit/delete) in ProductList
  return (
    <div>
      <div className="flex justify-between items-center p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
        <Link 
          to="/logout" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </div>
      <ProductList />
    </div>
  );
}

function AdminOrders() {
  // TODO: Adapt UserOrders to fetch all orders for admin, not just the logged-in user's
  return (
    <div>
      <div className="flex justify-between items-center p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">Manage Orders</h1>
        <Link 
          to="/logout" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </Link>
      </div>
      <UserOrders />
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const userChecked = useSelector(selectUserChecked);

  useEffect(() => {
    dispatch(checkUserAsync());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(fetchItemsByUserIdAsync());
      dispatch(fetchLoggedInUserAsync())
    }
  }, [dispatch, user]);

  // Show loading while checking user authentication
  if (!userChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          user?.role === "admin" ? <Navigate to="/admin-dashboard" replace /> : <Home />
        } />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* User routes */}
        <Route path="/cart" element={<Protected><CartPages /></Protected>} />
        <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="/product-detail/:id" element={<Protected><ProductDetailPage /></Protected>} />
        <Route path="/order-success/:id" element={<OrderSuccessPage />} />
        <Route path="/order" element={<UserOrderPage/>} />
        <Route path="/profile" element={<UserProfilePage/>} />
        
        {/* Admin routes - always available but protected */}
        <Route path="/admin-dashboard" element={
          user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin-products" element={
          user?.role === "admin" ? <AdminProducts /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin-orders" element={
          user?.role === "admin" ? <AdminOrders /> : <Navigate to="/login" replace />
        } />
        
        <Route path="/logout" element={<LogOut/>} />
        <Route path="/forget-password" element={<ForgetPasswordPage></ForgetPasswordPage>} />
        <Route path="*" element={<PageNotFound></PageNotFound>} />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
