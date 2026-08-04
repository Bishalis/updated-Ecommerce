import { API_BASE_URL } from "../../app/constants";

export  function  createUsers(userData) {
  return new Promise(async (resolve, reject) =>{
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`,{
        method:'POST',
        body:JSON.stringify(userData),
        headers:{'Content-type':'application/json'}
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return reject(data || { message: "Signup failed", success: false });
      }
      resolve({data});
    } catch (error) {
      reject({ message: error?.message || "Network error", success: false });
    }
});
}




export function signOut() {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`);
      if (response.ok) {
        resolve({ data:'success' });
      } else {
        const errorData = await response.json().catch(() => ({ message: "Logout failed" }));
        reject(errorData);
      }
    } catch (error) {
      reject({ message: error?.message || "Network error", success: false });
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

      const data = await response.json().catch(() => null);

      if (response.ok) {
        resolve({ data });
      } else {
        reject(data || { message: 'Login failed', success: false });
      }
    } catch (error) {
      reject({ message: error?.message || 'Network error', success: false });
    }

  });
}

export function checkAuth() {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        reject({ message: 'No token found', success: false });
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
        const errorData = await response.json().catch(() => ({ message: 'Invalid token' }));
        reject(errorData);
      }
    } catch (error) {
      reject({ message: error?.message || "Network error", success: false });
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
        const errorData = await response.json().catch(() => ({ message: "Google login failed" }));
        reject(errorData);
      }
    } catch (error) {
      reject({ message: error?.message || "Network error", success: false });
    }
  });
}

export function requestPasswordReset(email) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password-request`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        return reject(data || { message: "Failed to request password reset", success: false });
      }
      resolve({ data });
    } catch (error) {
      reject({ message: error?.message || "Network error", success: false });
    }
  });
}