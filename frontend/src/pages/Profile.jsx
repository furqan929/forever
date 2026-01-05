import React, { useEffect, useState } from 'react';
import { ArrowLeft, Camera, LogOut, Package, Heart, ShoppingCart, Award, Mail, Calendar, Edit3, Lock, AlertCircle, User, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMyContext } from '../context/Context';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const Profile = () => {
    const { cartItems, wishlist } = useMyContext()

    const [orders, setOrders] = useState([])
    const [user, setUser] = useState(null);

    let navigate = useNavigate();

    // ✅ States for editing name
    const [showEditModal, setShowEditModal] = useState(false);
    const [newName, setNewName] = useState("");

    // ✅ Fetch Orders
    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem("token")

            if (!token) {
                return;
            }

            const res = await axios.get(`${API_BASE_URL}/api/orders/my-orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOrders(res.data.data || [])
        } catch (error) {
            console.error("Error fetching orders:", error)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    // ✅ Load user from localStorage
    const loadUser = () => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } catch (error) {
                console.log("Error parsing user:", error);
            }
        }
    };
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload()

    };

    useEffect(() => {
        document.title = "My Profile - Forever";
        loadUser();
    }, []);

    // ✅ Update Name Function
    const updateName = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.put(
                `${API_BASE_URL}/api/user/update-name`,
                { name: newName },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const updatedUser = res.data.user;

            // ✅ Update LocalStorage + UI
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);

            setShowEditModal(false);
            alert("Name updated successfully!");
        } catch (err) {
            console.error(err);
            alert("Error updating name!");
        }
    };

    // ✅ Initials
    const getInitials = (name) => {
        if (!name) return 'FA';
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30'>

            {/* ✅ Enhanced Edit Name Modal */}
            {showEditModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 px-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-3xl shadow-2xl w-[90%] max-w-md transform transition-all animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100 rounded-2xl">
                                <Edit3 size={24} className="text-blue-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Edit Your Name</h2>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter your full name"
                                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200 text-gray-900 font-medium"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={updateName}
                                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Header */}
            <div className='bg-white/90 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-40 shadow-sm'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
                    <div className='flex items-center justify-between'>
                        <Link to="/">
                            <button className='flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-all duration-200 group'>
                                <div className='p-2.5 rounded-xl group-hover:bg-blue-50 transition-all duration-200 group-hover:scale-105'>
                                    <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                                </div>
                                <span className='font-semibold text-sm sm:text-base'>Back to Home</span>
                            </button>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/35 font-semibold text-sm hover:scale-105'>
                            <LogOut size={18} />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Profile Banner */}
            <div className='relative overflow-hidden'>
                <div className='h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative'>
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
                    <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='relative -mt-24'>
                        <div className='flex flex-col sm:flex-row items-center sm:items-end gap-6 pb-6'>

                            <div className='relative group'>
                                <div className='w-40 h-40 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 
                                flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-2xl 
                                group-hover:scale-105 transition-transform duration-300'>
                                    {getInitials(user?.name)}
                                </div>
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 via-indigo-400/20 to-purple-500/20 blur-xl -z-10"></div>
                            </div>

                            <div className='flex-1 text-center sm:text-left pb-2'>
                                <h1 className='text-4xl sm:text-5xl font-bold text-white mb-3 drop-shadow-lg'>{user?.name || 'User Name'}</h1>
                                <p className='text-blue-100 text-sm mb-5 font-medium'>Welcome back! Manage your profile and orders</p>

                                <div className='flex flex-wrap items-center justify-center sm:justify-start gap-3 text-gray-700'>
                                    <span className='flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'>
                                        <Mail size={16} className='text-blue-600' />
                                        <span className='text-sm font-semibold'>{user?.email}</span>
                                    </span>

                                    <span className='flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105'>
                                        <Calendar size={16} className='text-purple-600' />
                                        <span className='text-sm font-semibold'>Member since 2025</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>

                {/* ✅ Enhanced Action Buttons */}
                <div className='flex flex-wrap justify-center gap-4'>
                    <button
                        onClick={() => {
                            setNewName(user?.name || "");
                            setShowEditModal(true);
                        }}
                        className='flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105'
                    >
                        <Edit3 size={18} />
                        <span>Edit Name</span>
                    </button>

                    <Link to="/forget-password">
                        <button className='flex items-center gap-2.5 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105'>
                            <Lock size={18} />
                            <span>Change Password</span>
                        </button>
                    </Link>
                </div>

                {/* Enhanced Stats Grid */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
                    <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 hover:border-blue-200 transition-all duration-300 group hover:scale-105'>
                        <div className="flex items-center justify-between mb-3">
                            <span className='text-gray-600 font-semibold text-sm'>Total Orders</span>
                            <div className="p-2.5 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                                <Package size={20} className="text-blue-600" />
                            </div>
                        </div>
                        <div className='text-4xl font-bold text-gray-900 mb-1'>{orders.length}</div>
                        <p className="text-xs text-gray-500 font-medium">All time purchases</p>
                    </div>

                    <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 hover:border-pink-200 transition-all duration-300 group hover:scale-105'>
                        <div className="flex items-center justify-between mb-3">
                            <span className='text-gray-600 font-semibold text-sm'>Wishlist</span>
                            <div className="p-2.5 bg-pink-100 rounded-xl group-hover:bg-pink-200 transition-colors">
                                <Heart size={20} className="text-pink-600" />
                            </div>
                        </div>
                        <div className='text-4xl font-bold text-gray-900 mb-1'>{wishlist.length}</div>
                        <p className="text-xs text-gray-500 font-medium">Saved items</p>
                    </div>

                    <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 hover:border-purple-200 transition-all duration-300 group hover:scale-105'>
                        <div className="flex items-center justify-between mb-3">
                            <span className='text-gray-600 font-semibold text-sm'>Cart Items</span>
                            <div className="p-2.5 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
                                <ShoppingCart size={20} className="text-purple-600" />
                            </div>
                        </div>
                        <div className='text-4xl font-bold text-gray-900 mb-1'>{cartItems.length}</div>
                        <p className="text-xs text-gray-500 font-medium">Ready to checkout</p>
                    </div>

                    <div className='bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 hover:border-green-200 transition-all duration-300 group hover:scale-105'>
                        <div className="flex items-center justify-between mb-3">
                            <span className='text-gray-600 font-semibold text-sm'>Total Spent</span>
                            <div className="p-2.5 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
                                <TrendingUp size={20} className="text-green-600" />
                            </div>
                        </div>
                        <div className='text-4xl font-bold text-gray-900 mb-1'>Rs. 0</div>
                        <p className="text-xs text-gray-500 font-medium">Lifetime value</p>
                    </div>
                </div>

                {/* Enhanced Account Section */}
                <div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300'>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-red-100 rounded-2xl">
                            <AlertCircle size={24} className="text-red-600" />
                        </div>
                        <h2 className='text-2xl font-bold text-gray-900'>Account Management</h2>
                    </div>
                    <p className='text-sm text-gray-600 mb-8 font-medium'>Manage your account settings and preferences. These actions are permanent.</p>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <button
                            onClick={() => handleLogout()}
                            className='group px-6 py-4 bg-orange-50 hover:bg-orange-100 text-orange-700 font-semibold rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <div className="flex items-center justify-center gap-2">
                                <AlertCircle size={18} />
                                <span>Deactivate Account</span>
                            </div>
                        </button>
                        <button className='group px-6 py-4 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200 hover:scale-105 hover:shadow-lg'>
                            <div className="flex items-center justify-center gap-2">
                                <AlertCircle size={18} />
                                <span>Delete Account</span>
                            </div>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;