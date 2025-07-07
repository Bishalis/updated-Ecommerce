import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { createPaymentIntent } from './stripeApi';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
  : null;

const CheckoutForm = ({ totalAmount, orderId, onPaymentSuccess, onPaymentError, loading, setLoading }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    const createIntent = async () => {
      try {
        const { data } = await createPaymentIntent(totalAmount, orderId);
        setClientSecret(data.clientSecret);
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
        onPaymentError(err.message);
      }
    };

    if (totalAmount > 0) {
      createIntent();
    }
  }, [totalAmount, orderId, onPaymentError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (paymentError) {
      setError(paymentError.message);
      onPaymentError(paymentError.message);
      setLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent);
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Card Details</h3>
        <div className="mb-4">
          <CardElement options={cardElementOptions} />
        </div>
        {error && (
          <div className="text-red-600 text-sm mb-4">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={!stripe || loading || !clientSecret}
          className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors duration-200 ${
            !stripe || loading || !clientSecret
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Processing...' : `Pay $${totalAmount}`}
        </button>
      </div>
    </form>
  );
};

const StripePayment = ({ totalAmount, orderId, onPaymentSuccess, onPaymentError, loading, setLoading }) => {
  if (!stripePromise) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Card Payment</h3>
        <p className="text-sm text-gray-600">
          Stripe is not configured. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm
        totalAmount={totalAmount}
        orderId={orderId}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
        loading={loading}
        setLoading={setLoading}
      />
    </Elements>
  );
};

export default StripePayment; 