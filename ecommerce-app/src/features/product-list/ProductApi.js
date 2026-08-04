import { API_BASE_URL } from "../../app/constants";

// A mock function to mimic making an async request for data

export function createProduct(product) {
  return new Promise(async (resolve, reject) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return reject(data || { message: "Failed to create product" });
    }
    resolve({ data });
  });
}

export function fetchProductById(id) {
  return new Promise(async (resolve, reject) => {
    try {
      // Ensure id is a string and trim any whitespace
      const productId = String(id).trim();
      
      // Validate the ID format
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error(`Invalid product ID format. Expected a 24-character hexadecimal string, got: ${productId}`);
      }
      
      // Try to fetch the product
      const url = `${API_BASE_URL}/products/${productId}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch product: ${errorText}`);
      }
      
      const data = await response.json();
   
      
      // Ensure we have a valid product with an ID
      if (!data || (!data._id && !data.id)) {
        throw new Error('Invalid product data received - missing ID');
      }
      
      resolve({ data });
    } catch (error) {
      reject(error);
    }
  });
}

export function fetchAllProductByFilter(filter, sort, pagination) {
  //filter   = {'catrgory': ['smartphone', laptops]}
  //sort = {_sort:"price " , _order : "desc"}
  //pagination = {_page:1 , _limit=10} _page=1&_limit=10`
  let queryString = '';
  for (let key in filter) {
    const categoryValues = filter[key];
    if (categoryValues.length) {
      const lastcategoryValue = categoryValues[categoryValues.length - 1];
      queryString += `${encodeURIComponent(key)}=${encodeURIComponent(lastcategoryValue)}&`;
    }
  }

  for (let key in sort) {
    const categoryValues = sort[key];
    queryString += `${encodeURIComponent(key)}=${encodeURIComponent(categoryValues)}&`;
  }

  for (let key in pagination) {
    const categoryValues = pagination[key];
    queryString += `${encodeURIComponent(key)}=${encodeURIComponent(categoryValues)}&`;
  }
  
  return new Promise(async (resolve, reject) => {
    const response = await fetch(
      `${API_BASE_URL}/products?${queryString}`
    );
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return reject(data || { message: "Failed to fetch products" });
    }
    const totalItems = await response.headers.get('X-Total-Count');
    resolve({ data: { products: data, totalItems: parseInt(totalItems) }});
  });
}

export function fetchAllCategories() {
  return new Promise(async (resolve) => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchAllBrands() {
  return new Promise(async (resolve) => {
    const response = await fetch(`${API_BASE_URL}/brands`);
    const data = await response.json();
    resolve({ data });
  });
}

export function deleteProduct(productId) {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE_URL}/products/${productId}`;
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
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

export function updateProduct(product) {
  return new Promise(async (resolve, reject) => {
    try {
      const token = localStorage.getItem("token");
      const productId = product._id || product.id;
      const url = `${API_BASE_URL}/products/${productId}`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(product),
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`,
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