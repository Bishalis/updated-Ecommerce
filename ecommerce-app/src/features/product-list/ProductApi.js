// A mock function to mimic making an async request for data

export function createProduct(product) {
  return new Promise(async (resolve) => {
    const response = await fetch('http://localhost:8080/products', {
      method: 'POST',
      body: JSON.stringify(product),
      headers: { 'content-type': 'application/json' },
    });
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchProductById(id) {
  return new Promise(async (resolve, reject) => {
    try {
      // Log the incoming ID
      console.log('API: Raw ID received:', id, 'Type:', typeof id);
      
      // Ensure id is a string and trim any whitespace
      const productId = String(id).trim();
      console.log('API: Processed ID:', productId);
      
      // Validate the ID format
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new Error(`Invalid product ID format. Expected a 24-character hexadecimal string, got: ${productId}`);
      }
      
      // Try to fetch the product
      const url = `http://localhost:8080/products/${productId}`;
      console.log('API: Making request to:', url);
      
      const response = await fetch(url);
      console.log('API: Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Error response:', errorText);
        throw new Error(`Failed to fetch product: ${errorText}`);
      }
      
      const data = await response.json();
   
      
      // Ensure we have a valid product with an ID
      if (!data || (!data._id && !data.id)) {
        throw new Error('Invalid product data received - missing ID');
      }
      
      resolve({ data });
    } catch (error) {
      console.error('API: Error in fetchProductById:', error);
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
      queryString += `${key}=${lastcategoryValue}&`;
    }
  }

  for (let key in sort) {
    const categoryValues = sort[key];
    queryString += `${key}=${categoryValues}&`;
  }

  for (let key in pagination) {
    const categoryValues = pagination[key];
    queryString += `${key}=${categoryValues}&`;
  }
  
  return new Promise(async (resolve) => {
    console.log('Fetching products with query:', queryString);
    const response = await fetch(
      "http://localhost:8080/products?"+queryString
    );
    const data = await response.json();
    console.log('Received products:', data);
    // Log the first product's ID format
    if (data && data.length > 0) {
      console.log('First product ID:', data[0].id, 'Type:', typeof data[0].id);
    }
    const totalItems = await response.headers.get('X-Total-Count');
    resolve({ data: { products: data, totalItems: parseInt(totalItems) }});
  });
}

export function fetchAllCategories() {
  return new Promise(async (resolve) => {
    const response = await fetch("http://localhost:8080/categories");
    const data = await response.json();
    resolve({ data });
  });
}

export function fetchAllBrands() {
  return new Promise(async (resolve) => {
    const response = await fetch("http://localhost:8080/brands");
    const data = await response.json();
    resolve({ data });
  });
}

export function deleteProduct(productId) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('API: Deleting product with ID:', productId);
      const url = `http://localhost:8080/products/${productId}`;
      console.log('API: Making DELETE request to:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
      });
      
      console.log('API: Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Delete error response:', errorText);
        reject(new Error(errorText));
      } else {
        const data = await response.json();
        console.log('API: Delete successful, response:', data);
        resolve({ data });
      }
    } catch (error) {
      console.error('API: Delete request failed:', error);
      reject(error);
    }
  });
}

export function updateProduct(product) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('API: Updating product:', product);
      const productId = product._id || product.id;
      const url = `http://localhost:8080/products/${productId}`;
      console.log('API: Making PATCH request to:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(product),
        headers: { 'content-type': 'application/json' },
      });
      
      console.log('API: Update response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API: Update error response:', errorText);
        reject(new Error(errorText));
      } else {
        const data = await response.json();
        console.log('API: Update successful, response:', data);
        resolve({ data });
      }
    } catch (error) {
      console.error('API: Update request failed:', error);
      reject(error);
    }
  });
}