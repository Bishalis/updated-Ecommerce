import React, { useEffect, Fragment, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import { Dialog, Disclosure, Menu, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  fetchAllProductByFilterAsync,
  selectAllProducts,
  selectTotalItems,
  selectAllBrands,
  selectAllCategories,
  fetchAllBrandsAsync,
  fetchAllCategoriesAsync,
  deleteProductAsync,
  updateProductAsync
} from "../ProductListSlice";

import {
  ChevronDownIcon,
  FunnelIcon,
  MinusIcon,
  PlusIcon,
  Squares2X2Icon,
} from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { ITEMS_PER_PAGE } from "../../../app/constants";
import { selectLoggedInUser } from "../../auth/authSlice";


const sortOptions = [
  { name: "Best Rating", _sort: "rating", _order: "desc" },
  { name: "Low to High", _sort: "price", _order: "asc" },
  { name: "High to Low", _sort: "price", _order: "desc" },
];



function classNames(...classes) {
  return classes.filter(Boolean).join("");
}
export default function ProductList() {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUser);
  const totalItems = useSelector(selectTotalItems);
  
  // Debug: Log user info in main component
  console.log('ProductList - Main component user:', user);
  console.log('ProductList - Main component user role:', user?.role);
  const brands = useSelector(selectAllBrands);
  const categories = useSelector(selectAllCategories);
  const [filter, setFilter] = useState({});
  const [sort, setSort] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const products = useSelector(selectAllProducts);
  const filters = [

    {
      id: "category",
      name: "Category",
      options: categories,
    },
    {
      id: "brand",
      name: "Brand",
      options: brands,
    }
  ];

  const handleFilter = (e, section, option) => {
    const newFilter = { ...filter };
    if (e.target.checked) {
      if (newFilter[section.id]) {
        newFilter[section.id].push(option.value);
      } else {
        newFilter[section.id] = [option.value];
      }
    } else {
      const index = newFilter[section.id].findIndex(
        (el) => el === option.value
      );
      newFilter[section.id].splice(index, 1);
    }

    setFilter(newFilter);
  };

  const handleSort = (e, option) => {
    setSort({ _sort: option._sort, _order: option._order });
  };

  const handlePage = (page) => {
    setPage(page);
  };

  useEffect(() => {
    const pagination = { _page: page, _limit: ITEMS_PER_PAGE };
    dispatch(fetchAllProductByFilterAsync({ filter, sort, pagination }));
  }, [dispatch, filter, sort, page]);

  useEffect(() => {
    setPage(1);
  }, [totalItems, sort]);

  useEffect(()=>{
    dispatch(fetchAllBrandsAsync())
    dispatch(fetchAllCategoriesAsync())
  },[])

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Discover Amazing Products
            </h1>
            <p className="mt-6 text-xl text-indigo-100 max-w-3xl mx-auto">
              Shop the latest trends with our curated collection of premium products. 
              Quality, style, and innovation all in one place.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#products"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-indigo-600 shadow-sm hover:bg-indigo-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Shop Now
              </a>
              <a
                href="#categories"
                className="text-lg font-semibold leading-6 text-white hover:text-indigo-100"
              >
                Browse Categories <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Link */}
      {user?.role === "admin" && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <Link 
            to="/admin-dashboard" 
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>
      )}

      {/* Mobile filter dialog */}
      <MobileFilter
        mobileFiltersOpen={mobileFiltersOpen}
        setMobileFiltersOpen={setMobileFiltersOpen}
        handleFilter={handleFilter}
        filters={filters}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12" id="products">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Featured Products
            </h2>
            <p className="text-gray-600">
              Discover our handpicked selection of premium products
            </p>
          </div>

          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="group inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Sort
                  <ChevronDownIcon
                    className="-mr-1 ml-1 h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-40 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {sortOptions.map((option) => (
                      <Menu.Item key={option.name}>
                        {({ active }) => (
                          <button
                            onClick={(e) => {
                              handleSort(e, option);
                            }}
                            className={classNames(
                              active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                              "block w-full text-left px-4 py-2 text-sm"
                            )}
                          >
                            {option.name}
                          </button>
                        )}
                      </Menu.Item>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>

            <button
              type="button"
              className="rounded-lg border border-gray-300 bg-white p-2 text-gray-400 hover:text-gray-500 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <span className="sr-only">Filters</span>
              <FunnelIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Products Section */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
          {/* Desktop Filters */}
          <DesktopFilter handleFilter={handleFilter} filters={filters}/>

          {/* Product Grid */}
          <ProductGrid products={products} />
        </div>

        {/* Pagination */}
        <div className="mt-12">
          <Pagination
            totalItems={totalItems}
            handlePage={handlePage}
            page={page}
            setPage={setPage}
          />
        </div>
      </main>
    </div>
  );
}

function MobileFilter({
  mobileFiltersOpen,
  setMobileFiltersOpen,
  handleFilter,
  filters
}) {
  return (
    <Transition.Root show={mobileFiltersOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-40 lg:hidden"
        onClose={setMobileFiltersOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-6 shadow-xl">
              <div className="flex items-center justify-between px-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                <button
                  type="button"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex-1 px-6">
                {filters.map((section) => (
                  <Disclosure
                    as="div"
                    key={section.id}
                    className="border-b border-gray-100 py-4 last:border-b-0"
                  >
                    {({ open }) => (
                      <>
                        <h3 className="-my-3 flow-root">
                          <Disclosure.Button className="flex w-full items-center justify-between py-3 text-sm text-gray-700 hover:text-gray-900 focus:outline-none">
                            <span className="font-medium text-gray-900">
                              {section.name}
                            </span>
                            <span className="ml-6 flex items-center">
                              {open ? (
                                <MinusIcon
                                  className="h-4 w-4 text-gray-500"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlusIcon
                                  className="h-4 w-4 text-gray-500"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                          </Disclosure.Button>
                        </h3>
                        <Disclosure.Panel className="pt-4">
                          <div className="space-y-3">
                            {section.options.map((option, optionIdx) => (
                              <div
                                key={option.value}
                                className="flex items-center"
                              >
                                <input
                                  id={`filter-mobile-${section.id}-${optionIdx}`}
                                  name={`${section.id}[]`}
                                  defaultValue={option.value}
                                  type="checkbox"
                                  defaultChecked={option.checked}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                                  onChange={(e) =>
                                    handleFilter(e, section, option)
                                  }
                                />
                                <label
                                  htmlFor={`filter-mobile-${section.id}-${optionIdx}`}
                                  className="ml-3 min-w-0 flex-1 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                                >
                                  {option.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                ))}
              </div>

              {/* Apply Filters Button */}
              <div className="border-t border-gray-100 px-6 py-4">
                <button
                  type="button"
                  className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

function ProductGrid({ products }) {
  const user = useSelector(selectLoggedInUser);
  const dispatch = useDispatch();
  
  // Debug: Log user info
  console.log('ProductGrid - User:', user);
  console.log('ProductGrid - User role:', user?.role);
  console.log('ProductGrid - Is admin?', user?.role === "admin");
  const [message, setMessage] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Delete handler for admin
  const handleDelete = async (productId) => {
    console.log('Delete button clicked for product ID:', productId);
    console.log('Current user:', user);
    
    if (window.confirm("Are you sure you want to delete this product?")) {
      setIsLoading(true);
      try {
        console.log('Dispatching deleteProductAsync with ID:', productId);
        await dispatch(deleteProductAsync(productId)).unwrap();
        console.log('Product deleted successfully');
        setMessage({ type: "success", text: "Product deleted successfully." });
      } catch (err) {
        console.error('Error deleting product:', err);
        setMessage({ type: "error", text: err.message || "Failed to delete product." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Edit handler for admin
  const handleEdit = (product) => {
    console.log('Edit button clicked for product:', product);
    console.log('Current user:', user);
    setEditProduct(product);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditProduct({ ...editProduct, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Submitting edit for product:', editProduct);
      await dispatch(updateProductAsync(editProduct)).unwrap();
      console.log('Product updated successfully');
      setMessage({ type: "success", text: "Product updated successfully." });
      setEditModalOpen(false);
    } catch (err) {
      console.error('Error updating product:', err);
      setMessage({ type: "error", text: err.message || "Failed to update product." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="lg:col-span-3">
      <div className="bg-white">
        {message && (
          <div className={`p-2 mb-2 rounded text-center ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{message.text}</div>
        )}
        {/* Edit Modal */}
        {editModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <form onSubmit={handleEditSubmit} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Edit Product</h2>
              <label className="block mb-2">Title
                <input name="title" value={editProduct.title} onChange={handleEditChange} className="w-full border p-1 rounded" />
              </label>
              <label className="block mb-2">Price
                <input name="price" type="number" value={editProduct.price} onChange={handleEditChange} className="w-full border p-1 rounded" />
              </label>
              <label className="block mb-2">Brand
                <input name="brand" value={editProduct.brand} onChange={handleEditChange} className="w-full border p-1 rounded" />
              </label>
              <label className="block mb-2">Category
                <input name="category" value={editProduct.category} onChange={handleEditChange} className="w-full border p-1 rounded" />
              </label>
              <label className="block mb-2">Description
                <textarea name="description" value={editProduct.description} onChange={handleEditChange} className="w-full border p-1 rounded" />
              </label>
              <label className="block mb-2">Thumbnail URL
                <input name="thumbnail" value={editProduct.thumbnail} onChange={handleEditChange} className="w-full border p-1 rounded" />
              </label>
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={isLoading} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50">
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={() => setEditModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              return (
                <div 
                  key={product._id || product.id} 
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer border border-gray-100"
                  onClick={() => {
                    try {
                      window.location.href = `/product-detail/${product._id || product.id}`;
                    } catch (error) {
                      console.error('Navigation error:', error);
                    }
                  }}
                >
                  {/* Product Image */}
                  <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 group-hover:opacity-90 transition-opacity duration-300">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                        {product.title}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center mt-2">
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{product.rating}</span>
                        </div>
                        {product.discountPercentage > 0 && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            -{Math.round(product.discountPercentage)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          ${product.price}
                        </p>
                        {product.discountPercentage > 0 && (
                          <p className="text-sm text-gray-500 line-through">
                            ${Math.round(product.price * (1 - product.discountPercentage / 100))}
                          </p>
                        )}
                      </div>
                      
                      {/* Quick Add Button */}
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart functionality can be added here
                        }}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Admin Controls */}
                  {user?.role === "admin" && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product._id || product.id);
                        }}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                      >
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({ handlePage, page, setPage, totalItems }) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="mb-4 sm:mb-0">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {totalItems > 0 ? (page - 1) * ITEMS_PER_PAGE + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(page * ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-gray-900">{totalItems}</span> results
          </p>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-center">
            <nav className="flex items-center space-x-1" aria-label="Pagination">
              {/* Previous Button */}
              <button
                onClick={() => handlePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <ChevronLeftIcon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Previous</span>
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                const isCurrentPage = pageNumber === page;
                
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      isCurrentPage
                        ? "z-10 bg-indigo-600 text-white border border-indigo-600"
                        : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              {/* Next Button */}
              <button
                onClick={() => handlePage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Next</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}

function DesktopFilter({ handleFilter, filters }) {
  return (
    <div className="hidden lg:block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
        {filters.map((section) => (
          <Disclosure
            as="div"
            key={section.id}
            className="border-b border-gray-100 py-4 last:border-b-0"
          >
            {({ open }) => (
              <div>
                <h3 className="-my-3 flow-root">
                  <Disclosure.Button className="flex w-full items-center justify-between py-3 text-sm text-gray-700 hover:text-gray-900 focus:outline-none">
                    <span className="font-medium text-gray-900">
                      {section.name}
                    </span>
                    <span className="ml-6 flex items-center">
                      {open ? (
                        <MinusIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                      ) : (
                        <PlusIcon className="h-4 w-4 text-gray-500" aria-hidden="true" />
                      )}
                    </span>
                  </Disclosure.Button>
                </h3>
                <Disclosure.Panel className="pt-4">
                  <div className="space-y-3">
                    {section.options.map((option, optionIdx) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          id={`filter-${section.id}-${optionIdx}`}
                          name={`${section.id}[]`}
                          defaultValue={option.value}
                          type="checkbox"
                          defaultChecked={option.checked}
                          onChange={(e) => {
                            handleFilter(e, section, option);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                        />
                        <label
                          htmlFor={`filter-${section.id}-${optionIdx}`}
                          className="ml-3 text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
}
