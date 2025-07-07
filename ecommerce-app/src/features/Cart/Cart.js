import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteItemAsync, updateItemAsync, selectItems, selectCartError, selectCartSuccess, selectCartStatus } from "./CartSlice";
import { Link, Navigate } from "react-router-dom";
import { TrashIcon } from '@heroicons/react/24/outline';

export function Cart() {
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const rawItems = useSelector(selectItems);
  const cartError = useSelector(selectCartError);
  const cartSuccess = useSelector(selectCartSuccess);
  const cartStatus = useSelector(selectCartStatus);

  const coercedItems = (Array.isArray(rawItems) ? rawItems : []).map(item => ({
    ...item,
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));

  const validItems = coercedItems.filter(
    item => !isNaN(item.price) && !isNaN(item.quantity) && item.price >= 0 && item.quantity > 0
  );

  const totalAmount = validItems.reduce(
    (amount, item) => amount + item.price * item.quantity,
    0
  );
  const totalItems = validItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const handleQuantity = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty >= 1 && newQty <= 10) {
      dispatch(updateItemAsync({ ...item, quantity: newQty }));
    }
  };

  const handleRemove = (id) => {
    dispatch(deleteItemAsync(id));
  };

  if (!rawItems || rawItems.length === 0) {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Your Cart</h2>

        {cartError && (
          <div className="p-2 mb-4 rounded text-center bg-red-100 text-red-700">{cartError}</div>
        )}
        {cartSuccess && (
          <div className="p-2 mb-4 rounded text-center bg-green-100 text-green-700">{cartSuccess}</div>
        )}
        {cartStatus === 'loading' && (
          <div className="flex justify-center items-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {validItems.length === 0 ? (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-bold">Your cart is empty 🛒</h2>
            <Link
              to="/"
              className="mt-4 inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-6">
              {validItems.map((product) => (
                <div key={product.id} className="flex flex-col sm:flex-row items-center bg-white rounded-lg shadow p-4 gap-4">
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-24 h-24 object-cover rounded-md border"
                    onError={e => { e.target.onerror = null; e.target.src = '/placeholder.png'; }}
                  />
                  <div className="flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                        <p className="text-gray-500 mt-1">${product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center mt-2 sm:mt-0">
                        <button
                          aria-label="Decrease quantity"
                          className="px-2 py-1 rounded-l bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                          onClick={() => handleQuantity(product, -1)}
                          disabled={product.quantity <= 1}
                        >
                          -
                        </button>
                        <span className="px-4 py-1 bg-gray-100 border-t border-b text-lg">{product.quantity}</span>
                        <button
                          aria-label="Increase quantity"
                          className="px-2 py-1 rounded-r bg-gray-200 hover:bg-gray-300 text-lg font-bold"
                          onClick={() => handleQuantity(product, 1)}
                          disabled={product.quantity >= 10}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    aria-label="Remove item"
                    onClick={() => handleRemove(product.id)}
                    className="ml-0 sm:ml-4 mt-4 sm:mt-0 p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between h-fit">
              <h4 className="text-xl font-bold mb-4">Order Summary</h4>
              <div className="flex justify-between mb-2">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Total Price:</span>
                <span className="font-semibold">${totalAmount.toFixed(2)}</span>
              </div>
              <Link
                to={validItems.length > 0 ? "/checkout" : "/"}
                className={`w-full text-center py-2 rounded font-bold text-white ${validItems.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'}`}
                tabIndex={validItems.length > 0 ? 0 : -1}
                aria-disabled={validItems.length === 0}
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
