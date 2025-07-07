import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAllProductByFilter, fetchAllBrands, fetchAllCategories, fetchProductById, deleteProduct, updateProduct } from "./ProductApi";

const initialState = {
  products: [],
  brands: [],
  categories: [],
  status: "idle",
  totalItems: 0,
  selectedProducts: null
};


export const fetchAllProductByIdAsync = createAsyncThunk(
  "product/fetchProductById",
  async (id) => {
    const response = await fetchProductById(id);
    return response.data;
  }
);

export const fetchAllBrandsAsync = createAsyncThunk(
  "product/fetchAllBrands",
  async () => {
    const response = await fetchAllBrands();
    return response.data;
  }
);

export const fetchAllCategoriesAsync = createAsyncThunk(
  "product/fetchAllCategories",
  async () => {
    const response = await fetchAllCategories();
    return response.data;
  }
);


export const fetchAllProductByFilterAsync = createAsyncThunk(
  "product/fetchAllProductByFilter",
  async ({ filter, sort, pagination }) => {
    const response = await fetchAllProductByFilter(filter, sort, pagination);
    return response.data;
  }
);

export const deleteProductAsync = createAsyncThunk(
  "product/deleteProduct",
  async (productId) => {
    const response = await deleteProduct(productId);
    return { id: productId };
  }
);

export const updateProductAsync = createAsyncThunk(
  "product/updateProduct",
  async (product) => {
    const response = await updateProduct(product);
    return response.data;
  }
);

export const productListSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
  },

  extraReducers: (builder) => {
    builder
   

      .addCase(fetchAllProductByFilterAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllProductByFilterAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.products = action.payload.products;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchAllBrandsAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllBrandsAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.brands = action.payload;
      })

      .addCase(fetchAllCategoriesAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllCategoriesAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.categories = action.payload;
      })
      .addCase(fetchAllProductByIdAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAllProductByIdAsync.fulfilled, (state, action) => {
        state.status = "idle";
        state.selectedProducts = action.payload;
      })
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.products = state.products.filter(p => (p._id || p.id) !== action.payload.id);
      })
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        state.products = state.products.map(p => (p._id || p.id) === (action.payload._id || action.payload.id) ? action.payload : p);
      })
  },
});


export const selectAllProducts = (state) => state.product.products;
export const selectAllBrands = (state) => state.product.brands;
export const selectAllCategories = (state) => state.product.categories;
export const selectTotalItems = (state) => state.product.totalItems;
export const selectProductById = (state) => state.product.selectedProducts;

export default productListSlice.reducer;

