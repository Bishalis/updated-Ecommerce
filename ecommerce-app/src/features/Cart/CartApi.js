import { API_BASE_URL } from "../../app/constants";


export function addToCart(item) {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve) => {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: "POST",
      body: JSON.stringify(item),
      headers: { 
        "Content-type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function updatecart(update) {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve) => {
    const response = await fetch(`${API_BASE_URL}/cart/${update.id}`, {
      method: "PATCH",
      body: JSON.stringify(update),
      headers: { 
        "Content-type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function deletecart(itemId) {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve) => {
    const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: "DELETE",
      headers: { 
        "Content-type": "application/json",
        "Authorization": `Bearer ${token}`
      },
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchItemsByUserId() {
  return new Promise(async (resolve) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/cart`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function deleteItemsFromcart(itemId) {
  const token = localStorage.getItem("token");
  return new Promise(async (resolve) => {
    const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`
      },
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function resetCart(userId) {
  return new Promise(async (resolve) => {
    const response = await fetchItemsByUserId(userId);
    const items = response.data;
    for (let item of items) {
      await deleteItemsFromcart(item.id);
    }
    resolve({ status: "success" });
  });
}
