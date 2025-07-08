import { API_BASE_URL } from "../../app/constants";
// A mock function to mimic making an async request for data
import { useCookies } from "react-cookie";
export  function  createUsers(userData) {
  return new Promise(async (resolve) =>{
    const response = await fetch(`${API_BASE_URL}/auth/signup`,{
      method:'POST',
      body:JSON.stringify(userData),
      headers:{'Content-type':'application/json'}
    })
    const data = await response.json()
    resolve({data})
});
}




export function signOut() {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`);
      if (response.ok) {
        resolve({ data:'success' });
      } else {
        const error = await response.text();
        reject(error);
      }
    } catch (error) {
      console.log(error)
      reject( error );
    }
  });
}


export function loginUser(loginInfo) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(loginInfo),
        headers: { 'content-type': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        resolve({ data });
      } else {
        const error = await response.text();
        reject(error);
      }
    } catch (error) {
      reject( error );
    }

  });
}

export function checkAuth() {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        reject(new Error('No token found'));
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/check`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        resolve({ data });
      } else {
        reject(new Error('Invalid token'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

export function googleLogin(googleToken) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        body: JSON.stringify({ token: googleToken }),
        headers: { 'content-type': 'application/json' },
      });
      
      if (response.ok) {
        const data = await response.json();
        resolve({ data });
      } else {
        const error = await response.text();
        reject(error);
      }
    } catch (error) {
      reject(error);
    }
  });
}