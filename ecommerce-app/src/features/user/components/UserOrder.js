import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserLoggedInOrderAsync, selectUserOrders, fetchAllOrdersAsync, selectAllOrders, updateOrderStatusAsync } from "../UserSlice";
import { selectLoggedInUser } from "../../auth/authSlice";
import { Link, Navigate } from "react-router-dom";

export function UserOrders() {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const userOrders = useSelector(selectUserOrders);
  const allOrders = useSelector(selectAllOrders);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      try {
        console.log('Fetching orders for user:', user?.role, user?.id);
        if (user?.role === "admin") {
          const result = await dispatch(fetchAllOrdersAsync()).unwrap();
          console.log('Admin orders result:', result);
        } else if (user) {
          const result = await dispatch(fetchUserLoggedInOrderAsync(user.id)).unwrap();
          console.log('User orders result:', result);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setMessage({ type: "error", text: "Failed to fetch orders: " + err.message });
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [dispatch, user]);

  const orders = user?.role === "admin" ? (allOrders || []) : (userOrders || []);
  console.log('Current orders:', orders, 'User role:', user?.role);

  const handleStatusChange = async (orderId, newStatus) => {
    setIsLoading(true);
    try {
      await dispatch(updateOrderStatusAsync({ orderId, status: newStatus })).unwrap();
      setMessage({ type: "success", text: "Order status updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update order status." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {!user && <Navigate to="/login" replace={true} />}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === "admin" ? "All Orders" : "My Orders"}
          </h1>
          <p className="text-gray-600">
            {user?.role === "admin" 
              ? "Manage and track all customer orders" 
              : "Track your order history and status"
            }
          </p>
        </div>

        {/* Back to Admin Home Link */}
        {user?.role === "admin" && (
          <div className="mb-6">
            <Link 
              to="/admin-dashboard" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        )}
        
        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'error' 
              ? 'bg-red-50 border-red-200 text-red-700' 
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* Loading State */}
        {ordersLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* No Orders Message */}
        {!ordersLoading && (!orders || orders.length === 0) && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              {user?.role === "admin" ? "No Orders Found" : "No Orders Yet"}
            </h3>
            <p className="mt-2 text-gray-500">
              {user?.role === "admin" 
                ? "There are no orders in the system yet." 
                : "You haven't placed any orders yet."
              }
            </p>
          </div>
        )}

        {/* Orders List */}
        {!ordersLoading && orders && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id || order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Order #{order._id || order.id}
                      </h2>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                      </span>
                    </div>
                    
                    {/* Admin Status Control */}
                    {user?.role === "admin" && (
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700">
                          Update Status:
                        </label>
                        <select
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order._id || order.id, e.target.value)}
                          disabled={isLoading}
                          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                          {orderStatuses.map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((product, idx) => (
                      <div key={product._id || product.id || idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="h-full w-full object-cover object-center"
                            onError={(e) => {
                              e.target.src = '/placeholder.png';
                            }}
                          />
                        </div>
        
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {product.quantity}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            ${product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Order Summary</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Total Items:</span>
                          <span className="font-medium">{order.totalItems} items</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Amount:</span>
                          <span className="font-medium text-gray-900">${order.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Shipping Address */}
                    {order.selectedAddresses && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-600">
                          <p className="font-medium">{order.selectedAddresses.name}</p>
                          <p>{order.selectedAddresses.email}</p>
                          <p>{order.selectedAddresses.phone}</p>
                          <p className="mt-1">
                            {order.selectedAddresses.street}, {order.selectedAddresses.city}, {order.selectedAddresses.state} {order.selectedAddresses.pinCode}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
