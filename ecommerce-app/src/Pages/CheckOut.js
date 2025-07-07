import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateItemAsync, deleteItemAsync } from "../features/Cart/CartSlice";
import { selectItems } from "../features/Cart/CartSlice";
import { Navigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { updateUserAsync } from "../features/user/UserSlice";
import {
  selectLoggedInUser,
} from "../features/auth/authSlice";
import { addOrderAsync, selectCurrentOrderStatus } from "../features/orders/OrdersSlice";
import StripePayment from "../features/stripe/StripePayment";

export const Checkout = () => {
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const rawItems = useSelector(selectItems);
  const items = Array.isArray(rawItems) ? rawItems : [];
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validItems = items.filter(item => 
    typeof item.price !== 'undefined' && 
    typeof item.quantity !== 'undefined' &&
    !isNaN(Number(item.price)) &&
    !isNaN(Number(item.quantity))
  );

  const totalAmount = validItems.reduce(
    (amount, item) => Number(item.price) * Number(item.quantity) + amount,
    0
  );
  const totalItems = validItems.reduce((total, item) => Number(item.quantity) + total, 0);

  const handleQuantity = (e, item) => {
    dispatch(updateItemAsync({ ...item, quantity: +e.target.value }));
  };
  const handleRemove = (e, id) => {
    dispatch(deleteItemAsync(id));
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const user = useSelector(selectLoggedInUser);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState(null);
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showStripePayment, setShowStripePayment] = useState(false);
  const currentOrderStatus = useSelector(selectCurrentOrderStatus);

  const handleAddress = (e) => {
    setSelectedAddressIdx(Number(e.target.value));
    setError("");
  };
  const handlePayment = (e) => {
    setPaymentMethod(e.target.value);
    setError("");
  };

  const handleOrder = async (e) => {
    if (!paymentMethod) {
      setError("Please select a payment method.");
      return;
    }
    
    // Determine which address to use
    let shippingAddress;
    if (useSavedAddress) {
      if (selectedAddressIdx === null) {
        setError("Please select a shipping address.");
        return;
      }
      shippingAddress = user.addresses[selectedAddressIdx];
    } else {
      // Use temporary address from form
      if (!tempAddress.name || !tempAddress.email || !tempAddress.phone || !tempAddress.street || !tempAddress.city || !tempAddress.state || !tempAddress.pinCode) {
        setError("Please fill in all address fields.");
        return;
      }
      shippingAddress = tempAddress;
    }
    
    setError("");
    setLoading(true);
    
    try {
      const order = {
        items,
        totalAmount,
        totalItems,
        user: user.id, // Send only the user ID, not the full user object
        paymentMethod,
        selectedAddresses: shippingAddress,
        status: 'pending'
      };
      
      const result = await dispatch(addOrderAsync(order));
      
      // Save address if user chose to save it
      if (saveAddress && !useSavedAddress && user && user.id) {
        dispatch(
          updateUserAsync({
            ...user,
            id: user.id,
            addresses: [...(Array.isArray(user.addresses) ? user.addresses : []), tempAddress],
          })
        );
      }
      
      // If card payment is selected, show Stripe payment form
      if (paymentMethod === 'card') {
        setCurrentOrder(result.payload);
        setShowStripePayment(true);
      } else {
        // For cash payment, redirect to success page
        setCurrentOrder(result.payload);
      }
      
      setLoading(false);
    } catch (error) {
      setError("Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    // Payment successful, redirect to success page
    setShowStripePayment(false);
  };

  const handlePaymentError = (error) => {
    setError(`Payment failed: ${error}`);
    setShowStripePayment(false);
  };
  return (
    <>
      {!items.length && <Navigate to="/" replace={true} />}
      {currentOrder && !showStripePayment && <Navigate to={`/order-success/${currentOrder.id}`} replace={true} /> }
      
      {/* Stripe Payment Modal */}
      {showStripePayment && currentOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Complete Payment</h2>
              <button
                onClick={() => setShowStripePayment(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <StripePayment
              totalAmount={totalAmount}
              orderId={currentOrder.id}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-5">
          {/* Address & Payment Section */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-8 mb-8">
            <form
              className="mx-auto max-w-7xl"
              noValidate
              onSubmit={handleSubmit((data) => {
                if (user && user.id) {
                  dispatch(
                    updateUserAsync({
                      ...user,
                      id: user.id,
                      addresses: [...(Array.isArray(user.addresses) ? user.addresses : []), data],
                    })
                  );
                }
                reset();
              })}
            >
              {/* Address Mode Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Address Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="new-address"
                      name="address-mode"
                      checked={!useSavedAddress}
                      onChange={() => setUseSavedAddress(false)}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="new-address" className="ml-2 text-sm font-medium text-gray-900">
                      Use new address
                    </label>
                  </div>
                  {user && Array.isArray(user.addresses) && user.addresses.length > 0 && (
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="saved-address"
                        name="address-mode"
                        checked={useSavedAddress}
                        onChange={() => setUseSavedAddress(true)}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label htmlFor="saved-address" className="ml-2 text-sm font-medium text-gray-900">
                        Use saved address
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* New Address Form */}
              {!useSavedAddress && (
                <div className="border-b border-gray-200 pb-8 mb-8">
                  <h2 className="font-semibold text-gray-900 text-3xl mb-2">Shipping Information</h2>
                  <p className="mt-1 text-sm text-gray-600 mb-4">Enter your shipping address for this order.</p>
                                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="first-name" className="block text-sm font-medium text-gray-900">Full name</label>
                      <input 
                        type="text" 
                        value={tempAddress.name || ''}
                        onChange={(e) => setTempAddress({...tempAddress, name: e.target.value})}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email address</label>
                      <input 
                        id="email" 
                        value={tempAddress.email || ''}
                        onChange={(e) => setTempAddress({...tempAddress, email: e.target.value})}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-900">Phone</label>
                      <input 
                        id="phone" 
                        value={tempAddress.phone || ''}
                        onChange={(e) => setTempAddress({...tempAddress, phone: e.target.value})}
                        type="tel" 
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                      />
                    </div>
                    <div className="col-span-full">
                      <label htmlFor="street" className="block text-sm font-medium text-gray-900">Street address</label>
                      <input 
                        type="text" 
                        value={tempAddress.street || ''}
                        onChange={(e) => setTempAddress({...tempAddress, street: e.target.value})}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                      />
                    </div>
                    <div className="sm:col-span-2 sm:col-start-1">
                      <label htmlFor="city" className="block text-sm font-medium text-gray-900">City</label>
                      <input 
                        type="text" 
                        value={tempAddress.city || ''}
                        onChange={(e) => setTempAddress({...tempAddress, city: e.target.value})}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="region" className="block text-sm font-medium text-gray-900">State / Province</label>
                      <input 
                        type="text" 
                        value={tempAddress.state || ''}
                        onChange={(e) => setTempAddress({...tempAddress, state: e.target.value})}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="pinCode" className="block text-sm font-medium text-gray-900">ZIP / Postal code</label>
                      <input 
                        type="text" 
                        value={tempAddress.pinCode || ''}
                        onChange={(e) => setTempAddress({...tempAddress, pinCode: e.target.value})}
                        id="postal-code" 
                        autoComplete="postal-code" 
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                      />
                    </div>
                    <div className="sm:col-span-6 flex items-center gap-x-4 mt-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="save-address"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                        <label htmlFor="save-address" className="ml-2 text-sm text-gray-900">
                          Save this address for future orders
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Address Selection */}
              {useSavedAddress && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Select Shipping Address</h3>
                  <ul role="list" className="divide-y divide-gray-100">
                    {user && Array.isArray(user.addresses) && user.addresses.length > 0 ? user.addresses.map((address, index) => (
                      <li key={index} className={`flex justify-between gap-x-6 py-5 rounded-lg px-4 mb-2 border ${selectedAddressIdx === index ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
                        <div className="flex min-w-0 gap-x-4 items-center">
                          <input
                            onChange={handleAddress}
                            name="address"
                            type="radio"
                            value={index}
                            checked={selectedAddressIdx === index}
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                          />
                          <div className="min-w-0 flex-auto">
                            <p className="text-sm font-semibold leading-6 text-gray-900">{address.name}</p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{address.email}</p>
                            <p className="text-xs text-gray-500">{address.street}, {address.city}, {address.state}, {address.pinCode}</p>
                          </div>
                        </div>
                        <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                          <p className="text-sm leading-6 text-gray-900">{address.phone}</p>
                        </div>
                      </li>
                    )) : <li className="text-gray-500 text-sm">No saved addresses. Please add one above.</li>}
                  </ul>
                </div>
              )}
              {/* Payment Selection */}
              <fieldset className="mb-8">
                <legend className="text-lg font-semibold text-gray-900 mb-2">Payment Methods</legend>
                <div className="space-y-4">
                  <div className={`flex items-center gap-x-3 p-2 rounded ${paymentMethod === 'cash' ? 'bg-indigo-50 border border-indigo-600' : ''}`}>
                    <input
                      onChange={handlePayment}
                      value="cash"
                      name="payments"
                      type="radio"
                      checked={paymentMethod === "cash"}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="cash" className="block text-sm font-medium leading-6 text-gray-900">Cash</label>
                  </div>
                  <div className={`flex items-center gap-x-3 p-2 rounded ${paymentMethod === 'card' ? 'bg-indigo-50 border border-indigo-600' : ''}`}>
                    <input
                      onChange={handlePayment}
                      value="card"
                      name="payments"
                      type="radio"
                      checked={paymentMethod === "card"}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="card" className="block text-sm font-medium leading-6 text-gray-900">Credit/Debit Card</label>
                  </div>
                </div>
              </fieldset>
              {error && <div className="text-red-600 font-semibold mb-4">{error}</div>}
            </form>

            {/* Separate Address Save Form */}
            <div className="mt-8 border-t pt-8">
              <h3 className="text-lg font-semibold mb-4">Save New Address</h3>
              <p className="text-sm text-gray-600 mb-4">Save a new address for future orders (optional)</p>
              <form
                noValidate
                onSubmit={handleSubmit((data) => {
                  if (user && user.id) {
                    dispatch(
                      updateUserAsync({
                        ...user,
                        id: user.id,
                        addresses: [...(Array.isArray(user.addresses) ? user.addresses : []), data],
                      })
                    );
                  }
                  reset();
                })}
              >
                <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="save-name" className="block text-sm font-medium text-gray-900">Full name</label>
                    <input type="text" {...register("name", { required: "name is required" })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div className="sm:col-span-4">
                    <label htmlFor="save-email" className="block text-sm font-medium text-gray-900">Email address</label>
                    <input {...register("email", { required: "email is required" })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="save-phone" className="block text-sm font-medium text-gray-900">Phone</label>
                    <input {...register("phone", { required: "phone is required" })} type="tel" className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div className="col-span-full">
                    <label htmlFor="save-street" className="block text-sm font-medium text-gray-900">Street address</label>
                    <input type="text" {...register("street", { required: "street is required" })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div className="sm:col-span-2 sm:col-start-1">
                    <label htmlFor="save-city" className="block text-sm font-medium text-gray-900">City</label>
                    <input type="text" {...register("city", { required: "city is required" })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="save-region" className="block text-sm font-medium text-gray-900">State / Province</label>
                    <input type="text" {...register("state", { required: "state is required" })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="save-pinCode" className="block text-sm font-medium text-gray-900">ZIP / Postal code</label>
                    <input type="text" {...register("pinCode", { required: "pinCode is required" })} className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div className="sm:col-span-6 flex justify-end gap-x-4 mt-4">
                    <button type="button" className="text-sm font-semibold leading-6 text-gray-900" onClick={() => reset()}>Reset</button>
                    <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save Address</button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Cart Summary Section */}
          <div className="lg:col-span-2 mx-auto max-w-2xl bg-white rounded-lg shadow-md p-8">
            <h2 className="text-3xl font-bold mb-6">Order Summary</h2>
            <div className="divide-y divide-gray-200 mb-6">
              {items.map((product, idx) => (
                <div key={product.id} className="flex py-4 items-center">
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
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                      <p className="text-lg font-semibold text-gray-900">${product.price}</p>
                    </div>
                    <p className="text-sm text-gray-500">Qty: {product.quantity}</p>
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, product.id)}
                    type="button"
                    className="ml-4 text-red-600 hover:text-red-800 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-semibold text-gray-900 mb-2">
              <span>Subtotal</span>
              <span>${isNaN(totalAmount) ? 0 : totalAmount}</span>
            </div>
            <div className="flex justify-between text-base text-gray-700 mb-2">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="flex justify-between text-base text-gray-700 mb-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-indigo-700 border-t pt-4 mt-4">
              <span>Total</span>
              <span>${isNaN(totalAmount) ? 0 : totalAmount}</span>
            </div>
            <div className="mt-8">
              <button
                onClick={handleOrder}
                disabled={loading || !paymentMethod || (useSavedAddress && selectedAddressIdx === null) || (!useSavedAddress && (!tempAddress.name || !tempAddress.email || !tempAddress.phone || !tempAddress.street || !tempAddress.city || !tempAddress.state || !tempAddress.pinCode))}
                className={`w-full flex items-center justify-center rounded-md border border-transparent px-6 py-3 text-base font-medium text-white shadow-sm transition-colors duration-200 ${loading || !paymentMethod || (useSavedAddress && selectedAddressIdx === null) || (!useSavedAddress && (!tempAddress.name || !tempAddress.email || !tempAddress.phone || !tempAddress.street || !tempAddress.city || !tempAddress.state || !tempAddress.pinCode)) ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loading ? 'Placing Order...' : 'Order Now'}
              </button>
            </div>
            <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
              <p>
                or{' '}
                <Link to="/">
                  <button
                    type="button"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                    onClick={() => setOpen(false)}
                  >
                    Continue Shopping
                    <span aria-hidden="true"> &rarr;</span>
                  </button>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
