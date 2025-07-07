export const createPaymentIntent = async (totalAmount, orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch('http://localhost:8080/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          totalAmount,
          orderId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }
      
      const data = await response.json();
      resolve({ data });
    } catch (error) {
      reject(error);
    }
  });
}; 