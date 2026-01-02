
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle, FaShoppingCart, FaPlus, FaMinus, FaChevronDown } from "react-icons/fa";
import { Heart, Menu, X, Home, Grid, Info, ShoppingBag, User } from "lucide-react";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useMyContext } from "../context/Context";
import { assets } from "../assets/assets";
import { FaBox } from "react-icons/fa";
import { IoIosSettings, IoMdExit } from "react-icons/io";
import { API_BASE_URL } from "../config/api";

const Navbar = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [wishlistVisible, setWishlistVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState([]);
  const navigate = useNavigate();

  const { wishlist, getCart, cartItems, handleQuantityChange, deleteWishlist, checkWishlist } = useMyContext();

  const deleteCart = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login first");

    try {
      await axios.delete(`${API_BASE_URL}/api/cart/deleteCart/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Item removed from cart");
      getCart();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item");
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    deleteWishlist(productId);
  };

  const handleWishlistItemClick = (productId) => {
    navigate(`/product/${productId}`);
    setWishlistVisible(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      getCart();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setDropdownOpen(false);
      navigate("/login");
      toast.success("Logged out successfully");
    }
  };

  const userName = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.log("Error parsing user:", error);
      }
    }
  };

  useEffect(() => {
    userName();

  }, []);

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.discountedPrice * item.quantity,
    0
  );

  const navItems = [
    { path: "/", label: "HOME", icon: Home },
    ...(isLoggedIn ? [{ path: "/my-orders", label: "MY ORDERS", icon: ShoppingBag }] : [])
  ];


  return (
    <>
      {/* Main Navbar */}
      <nav className="h-[80px] w-full shadow-lg border-b border-gray-200 fixed top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 group">
              <img
                src={assets.logo}
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
                alt="Logo"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${isActive
                      ? "text-blue-600 bg-blue-50 shadow-sm border border-blue-100"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Desktop Only - Wishlist, Cart, User */}
              <div className="hidden lg:flex items-center space-x-3">
                {isLoggedIn ? (
                  <>
                    {/* Wishlist with Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setWishlistVisible(!wishlistVisible)}
                        className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 text-pink-600 hover:from-pink-100 hover:to-rose-100 border border-pink-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      >
                        <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
                        {wishlist.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg transform group-hover:scale-110">
                            {wishlist.length}
                          </span>
                        )}
                      </button>

                      {/* Wishlist Dropdown */}
                      {wishlistVisible && (
                        <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 py-4 z-50 animate-in fade-in slide-in-from-top-5 max-h-96 overflow-hidden flex flex-col">
                          {/* Header */}
                          <div className="px-4 pb-3 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-lg text-gray-900">Your Wishlist</h3>
                              <span className="bg-pink-100 text-pink-600 text-sm font-semibold px-2 py-1 rounded-full">
                                {wishlist.length} items
                              </span>
                            </div>
                          </div>

                          {/* Wishlist Items */}
                          <div className="flex-1 overflow-y-auto py-2">
                            {wishlist.length === 0 ? (
                              <div className="text-center py-8 px-4">
                                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">Your wishlist is empty</p>
                                <p className="text-gray-400 text-sm mt-1">Start adding your favorite items!</p>
                              </div>
                            ) : (
                              <div className="space-y-2 px-2">
                                {Array.isArray(wishlist) && wishlist.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group cursor-pointer"
                                    onClick={() => handleWishlistItemClick(item._id)}
                                  >
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-12 h-12 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                                        {item.name}
                                      </h4>
                                      <p className="text-blue-600 font-bold text-sm">
                                        ${item.discountedPrice || item.price}
                                      </p>
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFromWishlist(item._id);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          {wishlist.length > 0 && (
                            <div className="px-4 pt-3 border-t border-gray-200">
                              <button
                                onClick={() => {
                                  navigate("/wishlist");
                                  setWishlistVisible(false);
                                }}
                                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2.5 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg text-sm"
                              >
                                View All Wishlist Items
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cart */}
                    <button
                      onClick={() => setCartVisible(true)}
                      className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 hover:from-blue-100 hover:to-cyan-100 border border-blue-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                    >
                      <FaShoppingCart className="w-5 h-5 transition-transform group-hover:scale-110" />
                      {cartItems.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg transform group-hover:scale-110">
                          {cartItems.length}
                        </span>
                      )}
                    </button>

                    {/* User Account */}
                    <div className="relative">
                      <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center space-x-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-3 rounded-2xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 hover:shadow-xl border border-gray-700 group"
                      >
                        <div className="flex items-center space-x-2">
                          <FaUserCircle className="w-5 h-5" />
                          <span className="font-semibold text-sm">{user ? user.name : "Guest"}</span>
                        </div>
                        <FaChevronDown
                          className={`w-3 h-3 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {dropdownOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-5">
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              navigate("/profile");
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 first:rounded-t-2xl"
                          >
                            <FaUserCircle className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              navigate("/my-orders");
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 first:rounded-t-2xl"
                          >
                            <FaBox className="w-4 h-4" />
                            <span>My Orders</span>
                          </button>
                          <button
                            onClick={() => {
                              setDropdownOpen(false);
                              navigate("/settings");
                            }}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 first:rounded-t-2xl"
                          >
                            <IoIosSettings className="w-4 h-4" />
                            <span>Settings</span>
                          </button>

                          {user?.role === "admin" && (
                            <Link
                              to="/admin"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                            >
                              <Grid className="w-4 h-4" />
                              <span>Admin Dashboard</span>
                            </Link>
                          )}

                          <div className="border-t border-gray-200 my-1"></div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-b-2xl"
                          >
                            <IoMdExit className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-6 py-3 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors duration-300 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5 border border-blue-500"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuVisible(true)}
                className="lg:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 transition-all duration-300"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuVisible && (
          <div className="fixed inset-0 z-[70] lg:hidden">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-300"
              onClick={() => setMobileMenuVisible(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-sm w-full bg-white shadow-2xl border-l-2 border-gray-300 transform transition-transform duration-300 ease-out">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-white shadow-sm">
                  <img src={assets.logo} className="h-8 w-auto" alt="Logo" />
                  <button
                    onClick={() => setMobileMenuVisible(false)}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuVisible(false)}
                        className={({ isActive }) =>
                          `flex items-center space-x-4 px-4 py-4 text-base font-medium rounded-2xl transition-all duration-300 ${isActive
                            ? "text-blue-600 bg-blue-50 border border-blue-100 shadow-sm"
                            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </NavLink>
                    ))}

                    {/* Mobile Only - Wishlist & Cart */}
                    {isLoggedIn && (
                      <>
                        <button
                          onClick={() => {
                            setMobileMenuVisible(false);
                            setWishlistVisible(true);
                          }}
                          className="flex items-center justify-between w-full px-4 py-4 text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-2xl transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <Heart className="w-5 h-5" />
                            <span>Wishlist</span>
                          </div>
                          {wishlist.length > 0 && (
                            <span className="bg-pink-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {wishlist.length}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setMobileMenuVisible(false);
                            setCartVisible(true);
                          }}
                          className="flex items-center justify-between w-full px-4 py-4 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300"
                        >
                          <div className="flex items-center space-x-4">
                            <FaShoppingCart className="w-5 h-5" />
                            <span>Shopping Cart</span>
                          </div>
                          {cartItems.length > 0 && (
                            <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                              {cartItems.length}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setMobileMenuVisible(false);
                            navigate("/profile");
                          }}
                          className="flex items-center space-x-4 w-full px-4 py-4 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300"
                        >
                          <User className="w-5 h-5" />
                          <span>My Profile</span>
                        </button>

                        {user?.role === "admin" && (
                          <button
                            onClick={() => {
                              setMobileMenuVisible(false);
                              navigate("/admin");
                            }}
                            className="flex items-center space-x-4 w-full px-4 py-4 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300"
                          >
                            <Grid className="w-5 h-5" />
                            <span>Admin Dashboard</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* Auth Section */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    {isLoggedIn ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-4 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                          <FaUserCircle className="w-6 h-6 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-900">{user ? user.name : "Guest"}</p>
                            <p className="text-sm text-gray-500">Premium Member</p>
                          </div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-4 text-base font-medium text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 border border-red-200 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Link
                          to="/login"
                          className="block w-full text-center px-4 py-4 text-base font-medium text-gray-700 bg-gray-50 rounded-2xl hover:bg-gray-100 border border-gray-200 transition-colors duration-200"
                          onClick={() => setMobileMenuVisible(false)}
                        >
                          Login
                        </Link>
                        <Link
                          to="/signup"
                          className="block w-full text-center px-4 py-4 text-base font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg"
                          onClick={() => setMobileMenuVisible(false)}
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Enhanced Cart Sidebar */}
      {isLoggedIn && cartVisible && (
        <div className="fixed inset-0 z-50 flex">
          {/* Background Overlay */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-500"
            onClick={() => setCartVisible(false)}
          />

          {/* Cart Panel */}
          <div
            className={`
              fixed inset-y-0 right-0 max-w-md w-full bg-white/95 backdrop-blur-lg shadow-2xl 
              transform transition-transform duration-500 ease-out
              ${cartVisible ? 'translate-x-0' : 'translate-x-full'}
              flex flex-col border-l border-gray-200
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 text-white shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <FaShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Cart</h2>
                  <p className="text-blue-100 text-sm font-medium">
                    {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • ${cartTotal.toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCartVisible(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
                    <FaShoppingCart className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h3>
                  <p className="text-gray-500 mb-6">Add some amazing products to get started</p>
                  <button
                    onClick={() => setCartVisible(false)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.product._id}
                      className="group flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-2xl hover:shadow-xl transition-all duration-300 hover:border-blue-200"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-xl flex-shrink-0 shadow-sm group-hover:shadow-md transition-shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-blue-600 font-bold text-lg mb-3">
                          ${item.product.discountedPrice}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(item.product._id, -1)}
                              className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95 border border-gray-200"
                            >
                              <FaMinus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900 text-lg">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.product._id, +1)}
                              className="w-9 h-9 flex items-center justify-center bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-200 active:scale-95 border border-gray-200"
                            >
                              <FaPlus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => deleteCart(item.product._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-110 border border-transparent hover:border-red-200"
                          >
                            <MdDelete className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4 bg-white/80 backdrop-blur-md">
                <div className="flex justify-between items-center text-xl">
                  <span className="font-bold text-gray-900">Total Amount:</span>
                  <span className="font-bold text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Free shipping on orders over $50
                </p>
                <div className="space-y-3">
                  <Link to="/CheckOut">
                    <button
                      onClick={() => setCartVisible(false)}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 rounded-2xl font-bold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                    >
                      Proceed to Checkout
                    </button>
                  </Link>
                  <Link to="/">
                    <button
                      onClick={() => setCartVisible(false)}
                      className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-2xl font-semibold hover:border-blue-400 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50"
                    >
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;