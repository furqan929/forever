// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://forever-one-umber.vercel.app';

export { API_BASE_URL };

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  PRODUCTS: `${API_BASE_URL}/api/products`,
  CART: `${API_BASE_URL}/api/cart`,
  WISHLIST: `${API_BASE_URL}/api/wishlist`,
  ORDERS: `${API_BASE_URL}/api/orders`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  ADMIN2: `${API_BASE_URL}/api/admin2`,
  PAYMENT: `${API_BASE_URL}/api/payment`,
  USER: `${API_BASE_URL}/api/user`,
  PASSWORDS: `${API_BASE_URL}/api/passwords`
};
