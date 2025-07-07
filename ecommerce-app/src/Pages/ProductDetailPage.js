import React from 'react'
import { ProductDetails } from '../features/product-list/Components/ProductDetails'
import { NavBar } from '../features/Navbar/NavBar'

export const ProductDetailPage = () => {
  return (
    <NavBar>
        <ProductDetails/>
    </NavBar>
  )
}
