import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaEye,
  FaHeart,
  FaShoppingCart,
  FaFilter,
  FaTimes,
  FaArrowUp,
  FaTh,
  FaList,
  FaSearch,
  FaBox,
  FaTags,
  FaStar,
} from "react-icons/fa";
import { useMyContext } from "../context/Context";
import { toast } from "sonner";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import LoadingSpinner from "../components/LoadingSpinner";

const Products = () => {
  const { addCart, addToWishlist, wishlist } = useMyContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brand, setBrand] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalProducts: 0,
  });
  const [viewMode, setViewMode] = useState("grid");
  const [isScrolled, setIsScrolled] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    brand: "all",
    page: 1,
    limit: 12,
  });

  // Scroll detection
  useEffect(() => {
    document.title = "Shop Products - Forever";
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/categories`);
      setCategories(res.data.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // Fetch brands
  const fetchBrand = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/products/brand`);
      setBrand(res.data.brand);
    } catch (err) {
      console.error("Error fetching brands:", err);
    }
  };

  // Fetch products
  const fetchProducts = async (currentFilters) => {
    setLoading(true);
    try {
      const queryString = new URLSearchParams(currentFilters).toString();
      const response = await axios.get(
        `${API_BASE_URL}/api/products/products?${queryString}`
      );
      setCart(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([fetchCategories(), fetchBrand(), fetchProducts(filters)]);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    fetchProducts(filters);
  }, [filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total) {
      setFilters((prev) => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      category: "all",
      brand: "all",
      page: 1,
      limit: 12,
    });
  };

  const handleAddToCart = (product) => {
    addCart(product._id);
    toast.success(`Added ${product.name} to cart!`);
  };

  const handleAddToWishlist = (productId, productName) => {
    addToWishlist(productId);
    const isAdding = !wishlist.includes(productId);
    toast.info(
      isAdding
        ? `Added ${productName} to wishlist!`
        : `Removed ${productName} from wishlist!`
    );
  };


  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // Enhanced Sidebar Component
  const Sidebar = () => (
    <div
      className={`w-full lg:w-80 h-[calc(100vh-80px)] top-[80px] left-0 bg-white overflow-y-auto transition-all duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:sticky z-30 shadow-2xl lg:shadow-none border-r border-gray-100`}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <FaFilter className="text-white text-sm" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Filters</h3>
              <p className="text-xs text-gray-500">Refine your search</p>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Products
          </label>
          <div className="relative group">
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))
              }
              className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaTags className="text-purple-500" />
              Categories
            </label>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {categories.length}
            </span>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar bg-gray-50 rounded-xl p-3 border border-gray-200">
            <label className="flex items-center p-2.5 rounded-lg hover:bg-white cursor-pointer transition-all group">
              <input
                type="radio"
                name="category"
                checked={filters.category === "all"}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, category: "all", page: 1 }))
                }
                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
              <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-purple-600 transition-colors">
                All Categories
              </span>
            </label>
            {categories.map((elem, index) => (
              <label
                key={index}
                className="flex items-center p-2.5 rounded-lg hover:bg-white cursor-pointer transition-all group"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === elem}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, category: elem, page: 1 }))
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-500"
                />
                <span className="ml-3 text-sm text-gray-700 capitalize group-hover:text-purple-600 transition-colors">
                  {elem}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Brands */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FaBox className="text-indigo-500" />
              Brands
            </label>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {brand.length}
            </span>
          </div>
          <div className="space-y-1 max-h-64 overflow-y-auto custom-scrollbar bg-gray-50 rounded-xl p-3 border border-gray-200">
            <label className="flex items-center p-2.5 rounded-lg hover:bg-white cursor-pointer transition-all group">
              <input
                type="radio"
                name="brand"
                checked={filters.brand === "all"}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, brand: "all", page: 1 }))
                }
                className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-500"
              />
              <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-purple-600 transition-colors">
                All Brands
              </span>
            </label>
            {brand.map((elem, index) => (
              <label
                key={index}
                className="flex items-center p-2.5 rounded-lg hover:bg-white cursor-pointer transition-all group"
              >
                <input
                  type="radio"
                  name="brand"
                  checked={filters.brand === elem}
                  onChange={() =>
                    setFilters((prev) => ({ ...prev, brand: elem, page: 1 }))
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-500"
                />
                <span className="ml-3 text-sm text-gray-700 capitalize group-hover:text-purple-600 transition-colors">
                  {elem}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleResetFilters}
          className="w-full py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
        >
          <FaTimes className="text-gray-500" />
          Reset All Filters
        </button>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Showing</p>
              <p className="text-2xl font-bold text-purple-600">{cart.length}</p>
            </div>
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <FaBox className="text-purple-500 text-xl" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Products found</p>
        </div>
      </div>
    </div>
  );

  // Enhanced Product Card - Grid View
  const ProductCardGrid = ({ product }) => {
    // const isWishlisted = wishlist.includes(product._id);
    const discountPercentage = Math.round(
      ((product.price - product.discountedPrice) / product.price) * 100
    );

    return (
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
        <div className="relative h-72 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <button
              onClick={() => handleAddToWishlist(product._id, product.name)}
              className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all flex items-center justify-center"
            >
              <FaHeart
                className={`text-base ${Array.isArray(wishlist) && wishlist.some(item => item._id === product._id) ? "text-red-500 fill-current" : "text-gray-600"}`}
              />
            </button>

            <Link to={`/product/${product._id}`}>
              <button className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-all flex items-center justify-center">
                <FaEye className="text-gray-600 text-base" />
              </button>
            </Link>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 text-lg group-hover:text-purple-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mb-3 font-medium">{product.brand}</p>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-gray-900">
              Rs.{product.discountedPrice}
            </span>
            {product.price > product.discountedPrice && (
              <span className="text-sm text-gray-400 line-through">
                Rs.{product.price}
              </span>
            )}
          </div>

          <button
            onClick={() => handleAddToCart(product)}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <FaShoppingCart />
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  // Enhanced Product Card - List View
  const ProductCardList = ({ product }) => {
    const isWishlisted = wishlist.includes(product._id);
    const discountPercentage = Math.round(
      ((product.price - product.discountedPrice) / product.price) * 100
    );

    return (
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-80 h-64 md:h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 mb-3 font-medium">{product.brand}</p>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {product.description || "Premium quality product with excellent features and benefits."}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">
                    Rs.{product.discountedPrice}
                  </span>
                  {product.price > product.discountedPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      Rs.{product.price}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToWishlist(product._id, product.name)}
                  className="w-11 h-11 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center shadow-sm hover:shadow"
                >
                  <FaHeart
                    className={`text-base ${Array.isArray(wishlist) && wishlist.some(item => item._id === product._id) ? "text-red-500 fill-current" : "text-gray-600"}`}
                  />
                </button>
                <Link to={`/product/${product._id}`}>
                  <button className="w-11 h-11 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center shadow-sm hover:shadow">
                    <FaEye className="text-gray-600 text-base" />
                  </button>
                </Link>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <FaShoppingCart />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-indigo-50/30">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c084fc;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a855f7;
        }
      `}</style>

      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden w-14 h-14 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        >
          <FaFilter className="text-lg" />
        </button>

        {isScrolled && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce"
          >
            <FaArrowUp className="text-lg" />
          </button>
        )}
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 lg:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row">
        <Sidebar />

        {/* Products Section */}
        <div className="flex-1">
          <div className="py-12 px-4 lg:px-8 max-w-[1800px] mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 mb-4">
                Discover Amazing Products
              </h1>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Explore our carefully curated collection of premium products tailored just for you
              </p>
            </div>

            {/* View Mode Toggle & Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-bold text-purple-600">{cart.length}</span> of{" "}
                  <span className="font-bold text-gray-900">{pagination.totalProducts || cart.length}</span> products
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 flex gap-1">
                <button
                  onClick={() => toggleViewMode("grid")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${viewMode === "grid"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <FaTh />
                  <span className="hidden sm:inline text-sm font-medium">Grid</span>
                </button>
                <button
                  onClick={() => toggleViewMode("list")}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${viewMode === "list"
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <FaList />
                  <span className="hidden sm:inline text-sm font-medium">List</span>
                </button>
              </div>
            </div>

            {/* Product Cards */}
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto border border-gray-100">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaBox className="text-4xl text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    No Products Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search query to find what you're looking for.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : loading ? (
              <LoadingSpinner message="Loading products..." />
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
                      : "grid grid-cols-1 gap-6"
                  }
                >
                  {cart.map((product) =>
                    viewMode === "grid" ? (
                      <ProductCardGrid key={product._id} product={product} />
                    ) : (
                      <ProductCardList key={product._id} product={product} />
                    )
                  )}
                </div>

                {/* Pagination */}
                {pagination.total > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${pagination.current === 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-lg"
                        }`}
                    >
                      ← Previous
                    </button>

                    <div className="hidden sm:flex gap-2">
                      {Array.from({ length: Math.min(pagination.total, 5) }, (_, i) => {
                        let pageNum;
                        if (pagination.total <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.current <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.current >= pagination.total - 2) {
                          pageNum = pagination.total - 4 + i;
                        } else {
                          pageNum = pagination.current - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-11 h-11 rounded-xl font-semibold transition-all ${pagination.current === pageNum
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-110"
                              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-600 hover:text-purple-600"
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.total}
                      className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${pagination.current === pagination.total
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-lg"
                        }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Stats Section */}
          <div className="w-full px-4 lg:px-8 pb-12 max-w-[1800px] mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {/* Total Products */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaBox className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-4xl font-black text-gray-900 mb-1">
                  {pagination.totalProducts || 18}
                </div>
                <div className="text-sm font-medium text-gray-500">Total Products</div>
                <div className="mt-3 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>

              {/* Categories */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-green-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaTags className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-4xl font-black text-gray-900 mb-1">
                  {categories.length}
                </div>
                <div className="text-sm font-medium text-gray-500">Categories</div>
                <div className="mt-3 h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>

              {/* Brands */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaStar className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-4xl font-black text-gray-900 mb-1">
                  {brand.length}
                </div>
                <div className="text-sm font-medium text-gray-500">Brands</div>
                <div className="mt-3 h-1 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>

              {/* Favorites */}
              <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <FaHeart className="text-white text-xl" />
                  </div>
                </div>
                <div className="text-4xl font-black text-gray-900 mb-1">
                  {wishlist.length}
                </div>
                <div className="text-sm font-medium text-gray-500">Favorites</div>
                <div className="mt-3 h-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

