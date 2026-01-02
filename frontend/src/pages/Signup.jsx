import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
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

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast.error('Please fill all fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, formData);

      if (res.data.success) {
        toast.success(res.data.message);
        localStorage.setItem('pendingUser', JSON.stringify(res.data.user));
        navigate('/verify-email');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-150 flex justify-center items-center">
      <div className="w-90 min-h-80 flex px-5 py-5 flex-col gap-5 shadow-xl rounded-lg">
        <div className="min-w-50 min-h-10 flex justify-center items-center gap-1">
          <h1 className="prata-regular text-3xl">Signup</h1>
          <div className="w-10 border-1"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full min-h-50 flex flex-col justify-around gap-3">
          <input
            className="w-full min-h-12 border-1 p-2"
            onChange={handleChange}
            value={formData.name}
            placeholder="Enter Your Name..."
            type="text"
            name="name"
          />
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
            className="w-full h-10 rounded-lg cursor-pointer bg-black text-amber-50 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Signup'}
          </button>
        </form>

        <p className="text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline prata-regular">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
