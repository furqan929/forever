import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', formData);

      if (res.data.success) {
        toast.success(res.data.message);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.user.token);
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.requiresVerification) {
        toast.error(errorData.message);
        localStorage.setItem('pendingUser', JSON.stringify({ email: errorData.email }));
        navigate('/verify-email');
      } else {
        toast.error(errorData?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-150 flex justify-center items-center">
      <div className="w-90 min-h-70 flex px-5 py-5 flex-col gap-5 shadow-xl rounded-lg">
        <div className="min-w-50 min-h-10 flex justify-center items-center gap-1">
          <h1 className="prata-regular text-3xl">Login</h1>
          <div className="w-10 border-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full min-h-30 flex flex-col justify-around gap-3">
          <input
            className="w-full min-h-12 border-1 p-2"
            onChange={handleChange}
            value={formData.email}
            placeholder="Enter Your Email..."
            type="email"
            name="email"
          />
          <input
            className="w-full min-h-12 border-1 p-2"
            onChange={handleChange}
            value={formData.password}
            placeholder="Enter Your Password..."
            type="password"
            name="password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-black rounded-lg text-amber-50 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <Link to="/forgot-password">
          <button className="text-blue-400 cursor-pointer ml-45 prata-regular">
            Forgot Password?
          </button>
        </Link>

        <p className="text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline prata-regular">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
