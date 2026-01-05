import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft, RefreshCw } from 'lucide-react';

const StripeCancel = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Payment Cancelled - Forever";
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
                <div className="relative w-28 h-28 bg-gradient-to-br from-red-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
                    <XCircle className="w-14 h-14 text-white relative z-10" strokeWidth={2.5} />
                </div>
                
                <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Payment Cancelled</h2>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    Your payment was cancelled. Don't worry, no charges were made to your account. Your cart items are still saved.
                </p>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">What happened?</h3>
                    <p className="text-gray-600 text-sm">
                        The payment process was interrupted or cancelled. You can try again whenever you're ready.
                    </p>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/CheckOut')}
                        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        <span>Try Again</span>
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Continue Shopping</span>
                    </button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-sm text-gray-700 font-medium flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Your cart items are safe and waiting for you
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StripeCancel;
