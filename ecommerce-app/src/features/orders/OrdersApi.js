import { API_BASE_URL } from "../../app/constants";

export  function  addOrder(order) {
    return new Promise(async (resolve) =>{
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/orders`,{
        method:'POST',
        body:JSON.stringify(order),
        headers:{
          'Content-type':'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      resolve({data})
  });
  }

export function fetchAllOrders() {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function updateOrderStatus(orderId, status) {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: { 
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        reject(new Error(errorText));
      } else {
        const data = await response.json();
        resolve({ data });
      }
    } catch (error) {
      reject(error);
    }
  });
}
