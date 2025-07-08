import { API_BASE_URL } from "../../app/constants";

export  function  fetchLoggedInUserOrders() {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve) =>{
    const response = await fetch(`${API_BASE_URL}/orders/own`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json()
    resolve({data})
  });
}

export  function  fetchLoggedInUser() {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve) =>{
    const response = await fetch(`${API_BASE_URL}/users/own`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json()
    resolve({data})
  });
}

export  function  updateUser(update) {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve) =>{
    const response = await fetch(`${API_BASE_URL}/users/${update.id}`,{
      method:'PATCH',
      body:JSON.stringify(update),
      headers:{'content-type':'application/json', 'Authorization': `Bearer ${token}`}
    })
    const data = await response.json()
    resolve({data})
  });
}