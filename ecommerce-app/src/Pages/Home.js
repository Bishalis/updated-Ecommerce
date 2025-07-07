import React from 'react'
import { NavBar } from '../features/Navbar/NavBar'
import ProductList from '../features/product-list/Components/ProductList'

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavBar>
        <ProductList />
      </NavBar>
    </div>
  )
}

export default Home
