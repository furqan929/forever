import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Mail, Gift, ArrowRight } from 'lucide-react';

const Success = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Payment Successful - Forever";
    }, []);

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
                        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <span>View My Orders</span>
                        <ArrowRight className="w-5 h-5" />
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

export default Success;
