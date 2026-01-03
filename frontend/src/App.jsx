import React from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Collection from './pages/Collection';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import VerifyResetOTP from './pages/VerifyResetOTP';
import ResetPasswordNew from './pages/ResetPasswordNew';
import PlaceOrder from './pages/PlaceOrder';
import Orders from './pages/Orders';
import Navbar from './components/Navbar';
import SingleProduct from './components/SingleProduct';
import WishList from './components/WishList';
import CheckOut from './components/CheckOut';
import MyOrder from './pages/MyOrder';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';
import { ToastContainer } from 'react-toastify';

const App = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/admin") || 
                     location.pathname === "/verify-email" ||
                     location.pathname === "/verify-reset-otp" ||
                     location.pathname === "/reset-password" ||
                     location.pathname === "/forgot-password";

  return (
    <div className='pt-20'>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path='/' element={<Collection />} />
        <Route path='/about' element={<About />} />

        {/* Auth routes */}
        <Route path='/login' element={<AuthRoute><Login /></AuthRoute>} />
        <Route path='/signup' element={<AuthRoute><Signup /></AuthRoute>} />
        <Route path='/verify-email' element={<VerifyEmail />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/verify-reset-otp' element={<VerifyResetOTP />} />
        <Route path='/reset-password' element={<ResetPasswordNew />} />

        <Route path='/place-order' element={<PlaceOrder />} />
        <Route path='/orders' element={<Orders />} />
        <Route path="/product/:id" element={<SingleProduct />} />
        <Route path="/wishlist" element={<WishList />} />
        <Route path='/CheckOut' element={<CheckOut />} />
        <Route path='/my-orders' element={<MyOrder />} />
        <Route path='/profile' element={<Profile />} />
        <Route path="/settings" element={<Settings />} />

        {/* Protected admin route */}
        <Route path='/admin' element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={1500}
        closeOnClick
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg shadow-lg"
      />
    </div>
  );
}

export default App;
