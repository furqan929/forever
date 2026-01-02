import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');

  useEffect(() => {
    if (!pendingUser.email) {
      toast.error('No pending verification found');
      navigate('/signup');
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/verify-otp', {
        email: pendingUser.email,
        otp
      });

      if (res.data.success) {
        toast.success('Email verified successfully!');
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('token', res.data.user.token);
        localStorage.removeItem('pendingUser');
        navigate('/');
        window.location.reload();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const res = await axios.post('http://localhost:3000/api/auth/resend-otp', {
        email: pendingUser.email
      });

      if (res.data.success) {
        toast.success('New code sent to your email!');
        setCooldown(60);
      }
    } catch (err) {
      const remainingSeconds = err.response?.data?.remainingSeconds;
      if (remainingSeconds) {
        setCooldown(remainingSeconds);
        toast.error(`Please wait ${remainingSeconds} seconds`);
      } else {
        toast.error(err.response?.data?.message || 'Failed to resend code');
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-blue-100 text-sm">
              We sent a code to <strong>{pendingUser.email}</strong>
            </p>
          </div>

          <form onSubmit={handleVerify} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Enter 6-Digit Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 rounded-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || cooldown > 0}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <span>Check your spam folder if you don't see the email</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
