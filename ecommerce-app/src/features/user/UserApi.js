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
  return new Promise(async (resolve, reject) =>{
    try {
      const payload = {};

      if (Object.prototype.hasOwnProperty.call(update || {}, "username")) {
        payload.username = update.username;
      }
      if (Object.prototype.hasOwnProperty.call(update || {}, "addresses")) {
        payload.addresses = update.addresses;
      }
      if (Object.prototype.hasOwnProperty.call(update || {}, "profilePicture")) {
        payload.profilePicture = update.profilePicture;
      }

      const response = await fetch(`${API_BASE_URL}/users/own`,{
        method:'PATCH',
        body:JSON.stringify(payload),
        headers:{'content-type':'application/json', 'Authorization': `Bearer ${token}`}
      })

      const data = await response.json()
      if (!response.ok) {
        return reject(data);
      }
      resolve({data})
    } catch (error) {
      reject(error);
    }
  });
}