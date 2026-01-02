import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";

const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [product, setProduct] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch Reviews
  const getReview = async (id) => {
    try {
      let res = await axios.get(
        `${API_BASE_URL}/api/products/${id}/reviews`
      );
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
      setReviews([]);
    }
  };

  // ✅ Fetch Single Product
  const getProduct = async (id) => {
    setLoading(true);
    setError(null);
    try {
      let res = await axios.get(
        `${API_BASE_URL}/api/products/products/${id}`
      );
      setProduct(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load product");
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add To Cart
  const addCart = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please Login First.");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/cart/addCart`,
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      getCart();
    } catch (err) {
      console.error(err);
      toast.error("Something Went Wrong.");
    }
  };

  // ✅ Wishlist Toggle FIXED
  const addToWishlist = async (productId) => {
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login first!");
        return;
      }

      // ✅ Add item
          let res = await axios.post(
          `${API_BASE_URL}/api/wishlist/add`,
          { productId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(res.data);
        

        setWishlist(res.data.wishlist);
        toast.success(res.data.message);
        checkWishlist()
     
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  // ✅ Load Wishlist From Backend FIXED
  const checkWishlist = async () => {
    let token = localStorage.getItem("token");
    if (!token) return;

    try {
      let res = await axios.get(`${API_BASE_URL}/api/wishlist/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      

      // ✅ Backend returns: { wishlist: [ "id1", "id2" ] }
     setWishlist(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Load cart
  const getCart = async () => {
    try {
      let token = localStorage.getItem("token");
      if (!token) return;

      let res = await axios.get(`${API_BASE_URL}/api/cart/getCart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setPageLoading(false);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load cart");
    }
  };

  // ✅ Quantity Change
  const handleQuantityChange = async (productId, change) => {
    let token = localStorage.getItem("token");
    if (!token) return toast.error("Please Login First");

    try {
      await axios.post(
        `${API_BASE_URL}/api/cart/addCart`,
        { productId, quantity: change },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      getCart();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update quantity");
    }
  };

  // ✅ FIX deleteWishlist → updates UI now
  const deleteWishlist = async (id) => {
    try {
      let token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/wishlist/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // ✅ REMOVE from state
     setWishlist((prev) => Array.isArray(prev)
      ? prev.filter((item) => item !== id)
      : []
    );
      checkWishlist()

      toast.success("WishList removed!");
    } catch (err) {
      console.log(err);
      toast.error("Failed To Delete WishList");
    }
  };

  // ✅ ONE TIME LOAD (fixed duplicate calls)
  useEffect(() => {
    checkWishlist();
    getCart();
  }, []);

  return (
    <MyContext.Provider
      value={{
        getReview,
        getCart,
        reviews,
        getProduct,
        product,
        addCart,
        addToWishlist,
        wishlist,
        cart,
        setCart,
        cartItems,
        setCartItems,
        handleQuantityChange,
        pageLoading,
        deleteWishlist,
        loading,
        error,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
