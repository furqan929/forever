import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Mail, Gift } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [clearing, setClearing] = useState(true);
    const sessionId = searchParams.get('session_id');

    useEffect(() => {
        const clearCart = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Clear the cart after successful payment
                    await axios.delete(`${API_BASE_URL}/api/cart/clearCart`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            } catch (error) {
                console.error('Error clearing cart:', error);
            } finally {
                setClearing(false);
            }
        };

        if (sessionId) {
            clearCart();
        } else {
            setClearing(false);
        }
    }, [sessionId]);

    if (clearing) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Processing your order...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
                <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                    <CheckCircle className="w-14 h-14 text-white relative z-10" strokeWidth={2.5} />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Payment Successful!</h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Thank you for your purchase. Your payment has been processed successfully and your order will be shipped soon.
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
                    <p className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wider">Transaction ID</p>
                    <p className="text-lg font-bold text-gray-900 mb-5 tracking-wide break-all">{sessionId || 'N/A'}</p>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">Confirmation sent</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <Package className="w-4 h-4 text-green-600" />
                            <span className="font-medium">Processing</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/my-orders')}
                        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        View My Orders
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                    >
                        Continue Shopping
                    </button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
                    <p className="text-sm text-amber-900 font-medium flex items-center justify-center">
                        <Gift className="w-4 h-4 mr-2" />
                        Earn reward points with this purchase!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
