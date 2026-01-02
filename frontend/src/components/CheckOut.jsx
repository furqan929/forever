import React, { useState, useEffect } from 'react';
import { ShoppingCart, Truck, CreditCard, MapPin, Phone, Mail, User, Package, Shield, CheckCircle, Minus, Plus, X, Gift, Star, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const MultiStepCheckout = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [cartItems, setCartItems] = useState([]);
    const [shippingOptions, setShippingOptions] = useState([]);
    const [orderSummary, setOrderSummary] = useState({});
    const [loading, setLoading] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [errors, setErrors] = useState({});

    // Form data
    const [shippingInfo, setShippingInfo] = useState({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Pakistan'
    });

    const [selectedShipping, setSelectedShipping] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [notes, setNotes] = useState('');
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [stripePayment, setStripePayment] = useState()

    const getAuthToken = () => {
        return localStorage.getItem("token");
    };

    const apiCall = async (endpoint, options = {}) => {
        const token = getAuthToken();
        if (!token) {
            throw new Error("No authentication token");
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...defaultOptions,
                ...options,
                headers: { ...defaultOptions.headers, ...options.headers }
            });

            return await response.json();
        } catch (error) {
            console.error(`API call failed for ${endpoint}:`, error);
            throw error;
        }
    };



    const fetchCartItems = async () => {
        try {
            const response = await apiCall('/cart/getCart');
            
            // Backend returns cart object with items array inside
            const items = response.items || [];
            
            if (items.length > 0) {
                const formattedItems = items.map(item => {
                    // item.product is populated by backend
                    const product = item.product;
                    
                    return {
                        id: product?._id || item._id,
                        name: product?.name || 'Unknown Product',
                        price: product?.price || 0,
                        originalPrice: product?.price || 0,
                        finalPrice: product?.discountedPrice || product?.price || 0,
                        quantity: item.quantity || 1,
                        image: product?.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
                        rating: product?.rating || 0,
                        numReviews: product?.numReviews || 0,
                        inStock: (product?.stock || 0) > 0,
                        stock: product?.stock || 0,
                        category: product?.category || 'General'
                    };
                });
                setCartItems(formattedItems);
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            setCartItems([]);
        }
    };


    const fetchShippingOptions = async () => {
        try {
            const defaultShippingOptions = [
                {
                    id: 'standard',
                    name: 'Standard Delivery',
                    price: 5.99,
                    estimatedDays: '3-5 business days',
                    icon: Package,
                    premium: false
                },
                {
                    id: 'express',
                    name: 'Express Delivery',
                    price: 12.99,
                    estimatedDays: '1-2 business days',
                    icon: Truck,
                    premium: false
                },
                {
                    id: 'overnight',
                    name: 'Overnight Delivery',
                    price: 24.99,
                    estimatedDays: 'Next business day',
                    icon: Clock,
                    premium: true
                }
            ];

            setShippingOptions(defaultShippingOptions);
            if (defaultShippingOptions.length > 0) {
                setSelectedShipping(defaultShippingOptions[0].id);
            }
        } catch (error) {
            console.error('Error fetching shipping options:', error);
            const fallbackOptions = [
                {
                    id: 'standard',
                    name: 'Standard Delivery',
                    price: 5.99,
                    estimatedDays: '3-5 business days',
                    icon: Package,
                    premium: false
                }
            ];
            setShippingOptions(fallbackOptions);
            setSelectedShipping(fallbackOptions[0].id);
        }
    };

    const calculateOrderTotals = async () => {
        if (!selectedShipping) return;

        try {
            const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
            const shippingCost = shippingOptions.find(option => option.id === selectedShipping)?.price || 0;

            let discount = 0;
            if (promoApplied) {
                const discountRates = {
                    'WELCOME10': 0.10,
                    'DISCOUNT15': 0.15,
                    'SAVE20': 0.20,
                    'NEW25': 0.25
                };
                discount = subtotal * (discountRates[promoCode] || 0);
            }

            const tax = (subtotal - discount) * 0.05;
            const totalAmount = subtotal + shippingCost + tax - discount;

            setOrderSummary({
                subtotal: parseFloat(subtotal.toFixed(2)),
                shippingCost: parseFloat(shippingCost.toFixed(2)),
                discount: parseFloat(discount.toFixed(2)),
                tax: parseFloat(tax.toFixed(2)),
                totalAmount: parseFloat(totalAmount.toFixed(2))
            });
        } catch (error) {
            console.error('Error calculating totals:', error);
        }
    };

    useEffect(() => {
        fetchCartItems();

        fetchShippingOptions();
    }, []);

    useEffect(() => {
        if (cartItems.length > 0 && selectedShipping) {
            calculateOrderTotals();
        }
    }, [cartItems, selectedShipping, promoCode, promoApplied]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const updateQuantity = async (id, change) => {
        const currentItem = cartItems.find(item => item.id === id);
        if (!currentItem) return;

        const newQuantity = currentItem.quantity + change;
        if (newQuantity < 1) return;

        try {
            await apiCall('/cart/updateCart', {
                method: 'POST',
                body: JSON.stringify({
                    productId: id,
                    quantity: change > 0 ? 1 : -1
                })
            });

            setCartItems(prev => prev.map(item =>
                item.id === id
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        } catch (error) {
            console.error('Error updating quantity:', error);
            setCartItems(prev => prev.map(item =>
                item.id === id
                    ? { ...item, quantity: newQuantity }
                    : item
            ));
        }
    };

    const removeItem = async (id) => {
        try {
            await apiCall(`/cart/deleteCart/${id}`, {
                method: 'DELETE'
            });

            setCartItems(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error removing item:', error);
            setCartItems(prev => prev.filter(item => item.id !== id));
        }
    };

    const applyPromoCode = async () => {
        const code = promoCode.trim().toUpperCase();
        const validPromos = ['WELCOME10', 'DISCOUNT15', 'SAVE20', 'NEW25'];

        if (validPromos.includes(code)) {
            setPromoApplied(true);
            setPromoCode(code);
            calculateOrderTotals();
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            return cartItems.length > 0;
        }

        if (step === 2) {
            const required = {
                fullName: 'Full name is required',
                email: 'Email is required',
                phone: 'Phone number is required',
                address: 'Address is required',
                city: 'City is required',
                state: 'State is required',
                postalCode: 'Postal code is required'
            };

            Object.keys(required).forEach(field => {
                if (!shippingInfo[field].trim()) {
                    newErrors[field] = required[field];
                }
            });

            if (shippingInfo.email && !/\S+@\S+\.\S+/.test(shippingInfo.email)) {
                newErrors.email = 'Please enter a valid email';
            }

            // Phone validation removed - users can enter any format like 03034929957

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }

        if (step === 3) {
            return selectedShipping !== '';
        }

        if (step === 4) {
            if (!agreeToTerms) {
                return false;
            }
            return true;
        }

        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 4));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };



    const placeOrder = async () => {
        if (!validateStep(4)) return;

        setLoading(true);

        try {
            const orderData = {
                shippingInfo,
                shippingMethodId: selectedShipping,
                paymentMethod: paymentMethod,
                notes,
                promoCode: promoApplied ? promoCode : null
            };

            const response = await apiCall('/orders/place1', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });

            if (response.success) {
                setOrderNumber(response.order?.orderNumber || `ORD-${Date.now()}`);
                setOrderPlaced(true);
                setCartItems([]);
            } else {
                throw new Error(response.message || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setStripePayment(cartItems)
    }, [cartItems]);

    const stripePaymentMethod = async () => {
        try {
            const token = localStorage.getItem("token");

            let res = await axios.post(
                `${API_BASE_URL}/api/payment/post-checkout-session`,
                { cartItems },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (res.data.success) {
                window.location.href = res.data.url;
            }
        } catch (error) {
            console.error("Error In stripe", error.response?.data || error.message);
        }
    };



    // useEffect(() => {
    //     stripePaymentMethod()
    // }, [cartItems]);



    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
                    <div className="relative w-28 h-28 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
                        <CheckCircle className="w-14 h-14 text-white relative z-10" strokeWidth={2.5} />
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Order Confirmed!</h2>
                    <p className="text-gray-600 mb-8 text-lg leading-relaxed">Thank you for your purchase. Your order has been successfully placed and will be processed shortly.</p>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-sm">
                        <p className="text-sm text-gray-500 mb-2 font-semibold uppercase tracking-wider">Order Number</p>
                        <p className="text-2xl font-bold text-gray-900 mb-5 tracking-wide">{orderNumber}</p>
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
                            onClick={() => window.location.href = '/trackmyorder'}
                            className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Track Your Order
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="w-full border-2 border-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                        >
                            Continue Shopping
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-sm">
                        <p className="text-sm text-amber-900 font-medium flex items-center justify-center">
                            <Gift className="w-4 h-4 mr-2" />
                            Earn 50 reward points with this purchase!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const steps = [
        { number: 1, title: "Cart Review", icon: ShoppingCart },
        { number: 2, title: "Shipping Info", icon: MapPin },
        { number: 3, title: "Shipping Method", icon: Truck },
        { number: 4, title: "Payment & Review", icon: CreditCard }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <div className="bg-white shadow-lg border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                            Secure Checkout
                        </h1>
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
                            <Shield className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">SSL Secured</span>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="mt-10">
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => {
                                const Icon = step.icon;
                                const isActive = currentStep === step.number;
                                const isCompleted = currentStep > step.number;

                                return (
                                    <div key={step.number} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center">
                                            <div className={`flex items-center justify-center w-14 h-14 rounded-2xl border-2 transition-all duration-500 ${isCompleted
                                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                                                : isActive
                                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                                                    : 'bg-white border-gray-300 text-gray-400 shadow-sm'
                                                }`}>
                                                {isCompleted ? <CheckCircle className="w-7 h-7" strokeWidth={2.5} /> : <Icon className="w-6 h-6" strokeWidth={2.5} />}
                                            </div>
                                            <div className="mt-3 text-center">
                                                <p className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                    Step {step.number}
                                                </p>
                                                <p className={`text-sm font-semibold mt-1 ${isActive ? 'text-blue-700' : isCompleted ? 'text-emerald-700' : 'text-gray-400'}`}>
                                                    {step.title}
                                                </p>
                                            </div>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`flex-1 h-1 mx-4 rounded-full transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gray-200'}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                            {/* Step 1: Cart Review */}
                            {currentStep === 1 && (
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Review Your Cart</h2>
                                    {cartItems.length === 0 ? (
                                        <div className="text-center py-16">
                                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <ShoppingCart className="w-12 h-12 text-gray-400" />
                                            </div>
                                            <p className="text-xl text-gray-500 font-medium">Your cart is empty</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-5">
                                            {cartItems.map((item) => (
                                                <div key={item.id} className="flex items-center space-x-6 p-6 border-2 border-gray-100 rounded-2xl hover:shadow-lg hover:border-gray-200 transition-all duration-300 bg-gradient-to-br from-white to-gray-50">
                                                    <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl shadow-md" />
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 text-lg mb-2">{item.name}</h3>
                                                        {item.numReviews > 0 && (
                                                            <div className="flex items-center space-x-2 mb-3">
                                                                <div className="flex items-center">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-amber-400 fill-current' : 'text-gray-300'}`} />
                                                                    ))}
                                                                </div>
                                                                <span className="text-sm text-gray-600 font-medium">({item.numReviews})</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center space-x-3">
                                                            <button
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={item.quantity <= 1}
                                                            >
                                                                <Minus className="w-4 h-4 text-gray-700" strokeWidth={2.5} />
                                                            </button>
                                                            <span className="font-bold text-lg px-4 py-1 bg-gray-50 rounded-lg">{item.quantity}</span>
                                                            <button
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={item.quantity >= item.stock}
                                                            >
                                                                <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
                                                            </button>
                                                        </div>
                                                        {!item.inStock && (
                                                            <p className="text-red-600 text-sm mt-2 font-medium">Out of stock</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="flex items-center justify-end space-x-2 mb-1">
                                                            {item.originalPrice && item.originalPrice > item.finalPrice && (
                                                                <span className="text-lg text-gray-400 line-through">Rs. {(item.originalPrice * item.quantity).toLocaleString()}</span>
                                                            )}
                                                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Rs. {(item.finalPrice * item.quantity).toLocaleString()}</span>
                                                        </div>
                                                        <p className="text-sm text-gray-500 mb-3">Rs. {item.finalPrice.toLocaleString()} each</p>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                                        >
                                                            <X className="w-5 h-5" strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step 2: Shipping Information */}
                            {currentStep === 2 && (
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Shipping Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                                <User className="inline w-4 h-4 mr-2 text-blue-600" />
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={shippingInfo.fullName}
                                                onChange={handleInputChange}
                                                className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${errors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                                placeholder="Enter your full name"
                                            />
                                            {errors.fullName && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center font-medium">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.fullName}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                                <Mail className="inline w-4 h-4 mr-2 text-blue-600" />
                                                Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={shippingInfo.email}
                                                onChange={handleInputChange}
                                                className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                                placeholder="your.email@example.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center font-medium">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">
                                                <Phone className="inline w-4 h-4 mr-2 text-blue-600" />
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={shippingInfo.phone}
                                                onChange={handleInputChange}
                                                className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                                placeholder="03001234567"
                                            />
                                            {errors.phone && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center font-medium">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">City *</label>
                                            <select
                                                name="city"
                                                value={shippingInfo.city}
                                                onChange={handleInputChange}
                                                className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${errors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                            >
                                                <option value="">Select City</option>
                                                <option value="Karachi">Karachi</option>
                                                <option value="Lahore">Lahore</option>
                                                <option value="Islamabad">Islamabad</option>
                                                <option value="Rawalpindi">Rawalpindi</option>
                                                <option value="Faisalabad">Faisalabad</option>
                                                <option value="Multan">Multan</option>
                                                <option value="Peshawar">Peshawar</option>
                                                <option value="Quetta">Quetta</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.city && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center font-medium">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.city}
                                                </p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Complete Address *</label>
                                            <textarea
                                                name="address"
                                                value={shippingInfo.address}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                                placeholder="House/Flat no, Street, Area, Landmarks"
                                            />
                                            {errors.address && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center font-medium">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.address}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">State/Province *</label>
                                            <select
                                                name="state"
                                                value={shippingInfo.state}
                                                onChange={handleInputChange}
                                                className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${errors.state ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                            >
                                                <option value="">Select State</option>
                                                <option value="Punjab">Punjab</option>
                                                <option value="Sindh">Sindh</option>
                                                <option value="KPK">Khyber Pakhtunkhwa</option>
                                                <option value="Balochistan">Balochistan</option>
                                                <option value="AJK">Azad Jammu & Kashmir</option>
                                                <option value="GB">Gilgit-Baltistan</option>
                                                <option value="ICT">Islamabad Capital Territory</option>
                                            </select>
                                            {errors.state && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center font-medium">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.state}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Postal Code *</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                value={shippingInfo.postalCode}
                                                onChange={handleInputChange}
                                                className={`w-full px-5 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm ${errors.postalCode ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                                                    }`}
                                                placeholder="75500"
                                            />
                                            {errors.postalCode && (
                                                <p className="mt-2 text-sm text-red-600 flex items-center font-medium">
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {errors.postalCode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Shipping Method */}
                            {currentStep === 3 && (
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Choose Shipping Method</h2>
                                    <div className="space-y-4">
                                        {shippingOptions.map((option) => {
                                            const Icon = option.icon;
                                            return (
                                                <label key={option.id} className={`block p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${selectedShipping === option.id
                                                    ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-[1.02]'
                                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                                                    }`}>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-4">
                                                            <input
                                                                type="radio"
                                                                name="shipping"
                                                                value={option.id}
                                                                checked={selectedShipping === option.id}
                                                                onChange={(e) => setSelectedShipping(e.target.value)}
                                                                className="w-5 h-5 text-blue-600"
                                                            />
                                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${option.premium ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'
                                                                } shadow-lg`}>
                                                                <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center space-x-3 mb-2">
                                                                    <h3 className="font-bold text-gray-900 text-lg">{option.name}</h3>
                                                                    {option.premium && (
                                                                        <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                                                                            PREMIUM
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-green-600 font-semibold flex items-center">
                                                                    <Clock className="w-4 h-4 mr-2" />
                                                                    {option.estimatedDays}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                                                {option.price === 0 ? 'FREE' : `Rs. ${option.price.toLocaleString()}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Payment & Review */}
                            {/* Step 4: Payment & Review */}
                            {currentStep === 4 && (
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Payment & Final Review</h2>

                                    {/* Payment Methods */}
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Method</h3>
                                        <div className="space-y-3">
                                            {/* Cash on Delivery Option */}
                                            <label className={`block p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'cash_on_delivery' ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <input
                                                            type="radio"
                                                            name="payment"
                                                            value="cash_on_delivery"
                                                            checked={paymentMethod === 'cash_on_delivery'}
                                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                                            className="w-5 h-5 text-blue-600"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-gray-900 mb-1">Cash on Delivery</p>
                                                            <p className="text-sm text-gray-600">Pay when your order arrives at your doorstep</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-full shadow-md">
                                                        <span className="text-white text-xs font-bold uppercase tracking-wide">Recommended</span>
                                                    </div>
                                                </div>
                                            </label>

                                            {/* Stripe Payment Option */}
                                            <label className={`block p-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${paymentMethod === 'stripe' ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
                                                }`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <input
                                                            type="radio"
                                                            name="payment"
                                                            value="stripe"
                                                            checked={paymentMethod === 'stripe'}
                                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                                            className="w-5 h-5 text-blue-600"
                                                        />
                                                        <div>
                                                            <p className="font-bold text-gray-900 mb-1">Credit/Debit Card (Stripe)</p>
                                                            <p className="text-sm text-gray-600">Secure online payment via Stripe</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full shadow-md">
                                                            <span className="text-white text-xs font-bold uppercase tracking-wide">Secure</span>
                                                        </div>
                                                        <CreditCard className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                </div>
                                            </label>
                                        </div>

                                        {/* Stripe Payment Button - Only shows when Stripe is selected */}
                                        {paymentMethod === 'stripe' && (
                                            <div className="mt-6">
                                                <button
                                                    onClick={stripePaymentMethod}
                                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-3"
                                                >
                                                    <CreditCard className="w-6 h-6" />
                                                    <span>Pay with Stripe</span>
                                                </button>
                                                <p className="text-sm text-gray-600 text-center mt-3">You'll be redirected to Stripe's secure payment page</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Order Summary */}
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
                                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                                            <div className="space-y-4">
                                                {cartItems.map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                                                        <div className="flex items-center space-x-4">
                                                            <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg shadow-md" />
                                                            <div>
                                                                <p className="font-bold text-gray-900">{item.name}</p>
                                                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                        <p className="font-bold text-gray-900">Rs. {(item.finalPrice * item.quantity).toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Shipping Information Summary */}
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Shipping Details</h3>
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <p className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-wide">Delivery Address</p>
                                                    <p className="font-bold text-gray-900 mb-1">{shippingInfo.fullName}</p>
                                                    <p className="text-gray-700">{shippingInfo.address}</p>
                                                    <p className="text-gray-700">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.postalCode}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-wide">Contact</p>
                                                    <p className="text-gray-700 flex items-center mb-1">
                                                        <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                                        {shippingInfo.email}
                                                    </p>
                                                    <p className="text-gray-700 flex items-center">
                                                        <Phone className="w-4 h-4 mr-2 text-blue-600" />
                                                        {shippingInfo.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-6 pt-6 border-t border-blue-200">
                                                <p className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-wide">Shipping Method</p>
                                                <p className="font-bold text-gray-900">
                                                    {shippingOptions.find(opt => opt.id === selectedShipping)?.name}
                                                </p>
                                                <p className="text-green-600 text-sm font-semibold mt-1">
                                                    Estimated delivery: {shippingOptions.find(opt => opt.id === selectedShipping)?.estimatedDays}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Special Instructions */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-bold text-gray-700 mb-3">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            rows="3"
                                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm bg-white"
                                            placeholder="Any special delivery instructions, preferred delivery time, etc..."
                                        />
                                    </div>

                                    {/* Terms and Conditions */}
                                    <div className="mb-8">
                                        <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-blue-300 transition-all">
                                            <input
                                                type="checkbox"
                                                checked={agreeToTerms}
                                                onChange={(e) => setAgreeToTerms(e.target.checked)}
                                                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                            />
                                            <div className="text-sm text-gray-700">
                                                <p className="font-semibold">I agree to the <a href="#" className="text-blue-600 hover:underline">Terms & Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>. I confirm that all information provided is accurate and I authorize the processing of this order.</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Order Confirmation Notice */}
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 mb-6 shadow-sm">
                                        <div className="flex items-start space-x-3">
                                            <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                                            <div className="text-sm text-amber-900">
                                                <p className="font-bold mb-1">Please Review Your Order</p>
                                                <p>Once you place this order, changes may not be possible. Make sure all details are correct before proceeding.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-12 gap-4">
                                <button
                                    onClick={prevStep}
                                    disabled={currentStep === 1}
                                    className={`px-8 py-4 rounded-xl font-bold transition-all shadow-md ${currentStep === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 hover:shadow-lg'
                                        }`}
                                >
                                    Previous Step
                                </button>

                                {currentStep < 4 ? (
                                    <button
                                        onClick={nextStep}
                                        disabled={cartItems.length === 0}
                                        className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${cartItems.length === 0
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                                            }`}
                                    >
                                        Continue to Next Step
                                    </button>
                                ) : (
                                    <button
                                        onClick={placeOrder}
                                        disabled={loading || !agreeToTerms}
                                        className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-lg ${loading || !agreeToTerms
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                                            }`}
                                    >
                                        {loading ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Processing Order...</span>
                                            </div>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-xl p-8 sticky top-8 border border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Order Summary</h3>

                            {/* Promo Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    <Gift className="inline w-4 h-4 mr-2 text-blue-600" />
                                    Promo Code
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                        placeholder="Enter code"
                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
                                        disabled={promoApplied}
                                    />
                                    {!promoApplied ? (
                                        <button
                                            onClick={applyPromoCode}
                                            disabled={!promoCode.trim()}
                                            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md ${promoCode.trim()
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
                                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            Apply
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setPromoApplied(false);
                                                setPromoCode('');
                                            }}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                        >
                                            Applied ✓
                                        </button>
                                    )}
                                </div>
                                {promoApplied && (
                                    <p className="text-green-600 text-sm mt-2 flex items-center font-medium bg-green-50 p-2 rounded-lg">
                                        <Gift className="w-4 h-4 mr-1" />
                                        Promo code "{promoCode}" applied!
                                    </p>
                                )}
                            </div>

                            {/* Cart Items Summary */}
                            <div className="mb-6">
                                <h4 className="font-bold text-gray-900 mb-3">Items ({cartItems.length})</h4>
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">Rs. {(item.finalPrice * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-4 mb-6 pb-6 border-b-2 border-gray-200">
                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                                    <span>Rs. {orderSummary.subtotal?.toLocaleString() || '0'}</span>
                                </div>

                                <div className="flex justify-between text-gray-600 font-medium">
                                    <span>Shipping</span>
                                    <span>
                                        {orderSummary.shippingCost === 0 ? (
                                            <span className="text-green-600 font-bold">FREE</span>
                                        ) : (
                                            `Rs. ${orderSummary.shippingCost?.toLocaleString() || '0'}`
                                        )}
                                    </span>
                                </div>

                                {orderSummary.tax > 0 && (
                                    <div className="flex justify-between text-gray-600 font-medium">
                                        <span>Tax</span>
                                        <span>Rs. {orderSummary.tax?.toLocaleString()}</span>
                                    </div>
                                )}

                                {orderSummary.discount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>Promo Discount ({promoCode})</span>
                                        <span>-Rs. {orderSummary.discount?.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl font-bold text-gray-900">Total Amount</span>
                                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Rs. {orderSummary.totalAmount?.toLocaleString() || '0'}
                                </span>
                            </div>

                            {/* Savings Badge */}
                            {orderSummary.discount > 0 && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border-2 border-green-200 shadow-sm">
                                    <div className="flex items-center space-x-2 text-green-700">
                                        <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
                                        <span className="text-sm font-bold">You're saving Rs. {orderSummary.discount?.toLocaleString()}!</span>
                                    </div>
                                </div>
                            )}

                            {/* Security Badge */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
                                <div className="flex items-center space-x-2 text-green-700">
                                    <Shield className="w-5 h-5" strokeWidth={2.5} />
                                    <span className="text-sm font-bold">256-bit SSL encryption secured</span>
                                </div>
                            </div>

                            {/* Available Promo Codes */}
                            {!promoApplied && (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
                                    <h4 className="font-bold text-amber-900 mb-3 flex items-center">
                                        <Gift className="w-4 h-4 mr-2" />
                                        Available Offers
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-amber-900 p-2 bg-white rounded-lg shadow-sm">
                                            <span className="font-bold">WELCOME10</span>
                                            <span className="font-medium">10% off</span>
                                        </div>
                                        <div className="flex justify-between text-amber-900 p-2 bg-white rounded-lg shadow-sm">
                                            <span className="font-bold">DISCOUNT15</span>
                                            <span className="font-medium">15% off</span>
                                        </div>
                                        <div className="flex justify-between text-amber-900 p-2 bg-white rounded-lg shadow-sm">
                                            <span className="font-bold">SAVE20</span>
                                            <span className="font-medium">20% off</span>
                                        </div>
                                        <div className="flex justify-between text-amber-900 p-2 bg-white rounded-lg shadow-sm">
                                            <span className="font-bold">NEW25</span>
                                            <span className="font-medium">25% off</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Help & Support */}
                            <div className="mt-6 text-center pt-6 border-t-2 border-gray-200">
                                <p className="text-sm text-gray-500 mb-3 font-medium">Need help with your order?</p>
                                <div className="flex justify-center space-x-4">
                                    <a href="tel:+923001234567" className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-bold hover:underline">
                                        <Phone className="w-4 h-4 mr-1" />
                                        Call Support
                                    </a>
                                    <a href="mailto:support@example.com" className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-bold hover:underline">
                                        <Mail className="w-4 h-4 mr-1" />
                                        Email Us
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-10 text-center shadow-2xl max-w-md">
                        <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Processing Your Order</h3>
                        <p className="text-gray-600">Please wait while we confirm your order...</p>
                    </div>
                </div>
            )}
        </div>


    );
};

export default MultiStepCheckout;