import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { GrOverview } from "react-icons/gr";
import Collection from './Collection';
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaArrowAltCircleDown } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { API_BASE_URL } from '../config/api';

const EditProduct = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    brand: product.brand || '',
    price: product.price || '',
    discountedPrice: product.discountedPrice || '',
    description: product.description || '',
    image: product.image || '',
    category: product.category || '',
    stock: product.stock || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(product._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
          <p className="text-gray-600 mt-1">Update product information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Original Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discounted Price ($) *
              </label>
              <input
                type="number"
                name="discountedPrice"
                value={formData.discountedPrice}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL *
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            {formData.image && (
              <div className="mt-2">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Admin = () => {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [pagination, setPagination] = useState({})
  const [filters, setFilters] = useState({})

  const [createProduct, setCreateProduct] = useState({
    name: "",
    description: "",
    price: "",
    brand: "",
    category: "",
    stock: "",
    discountedPrice: "",
    image: ""
  });


  const [isFormOpen, setIsFormOpen] = useState(false)

  const [update, setUpdate] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)


  // Fetch data functions
  const fetchUsers = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      setError("No token found. Please login.")
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.log(err)
      setError(err.message)
    }
  }

  const dashboardOverview = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("No token found. Please login.")
      return
    }

    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin2/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(res)
    } catch (err) {
      console.log(err)
      toast.error(err.message || "Something went wrong")
    }
  }

  const fetchOrders = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("No token found. Please login.")
      return
    }
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setOrders(res.data)
    } catch (err) {
      console.log(err)
      setError(err.message)
    }
  }

  const fetchProducts = async (currentFilters) => {
    try {
      const queryString = new URLSearchParams(currentFilters).toString();
      const response = await axios.get(
        `${API_BASE_URL}/api/products/products?${queryString}`
      );
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/api/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product deleted successfully!");
      setProducts((prev) => prev.filter((elem) => elem._id !== id));
    } catch (error) {
      toast.error("Error deleting product");
      console.error(error);
    }
  };

  // نیا handleUpdate function
  const handleUpdate = (productId) => {
    const productToEdit = products.find(product => product._id === productId);
    setEditingProduct(productToEdit);
  };

  // نیا handleSave function
  const handleSave = async (productId, updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/products/${productId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Product updated successfully!");

      setProducts(prev => prev.map(product =>
        product._id === productId ? response.data : product
      ));

      setEditingProduct(null);
      setUpdate(true);
    } catch (error) {
      toast.error("Error updating product");
      console.error(error);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
  };





  const deleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User deleted successfully!");
      setUsers(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      toast.error("Error deleting user");
      console.error(error);
    }
  };



  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  useEffect(() => {
    fetchProducts(filters);
  }, [filters])

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  const roles = ['all', ...new Set(users.map(user => user.role).filter(Boolean))]

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchUsers(), fetchOrders(), fetchProducts(filters)])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    setError(null)
    Promise.all([fetchUsers(), fetchOrders(), fetchProducts(filters)]).finally(() => {
      setLoading(false)
    })
  }


  const handleChangeCreate = (e) => {
    const { name, value } = e.target;
    setCreateProduct({ ...createProduct, [name]: value });
  }


  const handleCreate = async () => {
    try {
      let token = localStorage.getItem("token")
      let res = await axios.post(`${API_BASE_URL}/api/admin2/createProducts`, createProduct, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      console.log(res);

      setIsFormOpen(false)

    }
    catch (err) {
      console.log(err, "Error creating Product");

    }
  }


  const handleOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `${API_BASE_URL}/api/orders/${orderId}/status`,
        {
          status: newStatus,
          note: "Updated by admin panel"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log(res.data.status == "cancelled");
      

      toast.success(`Order updated to ${newStatus}`);

      // UI update
      setOrders(prev =>
        prev.map(order =>
          order._id === orderId
            ? { ...order, orderStatus: newStatus }
            : order
        )
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to update order status");
    }
  };

  // Stats calculations
  const totalUsers = users.length
  const activeUsers = users.filter(user => user.status === 'active').length
  const adminUsers = users.filter(user => user.role === 'admin').length
  const totalOrders = orders.length
  const totalProducts = products.length
  const pendingOrders = orders.filter(order => order.orderStatus === 'pending').length

  // Render different sections based on activeSection
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">${order.orderSummary?.totalAmount?.toFixed(2)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )

      case 'users':
        return (
          <>
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                    Search Users
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="search"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                    <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Role
                  </label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    {roles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {!loading && !error && filteredUsers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user, index) => (
                        <tr key={user._id || index} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name || 'No Name'}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'moderator'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : user.status === 'inactive'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}>
                              {user.status || 'unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="text-red-600 hover:text-red-800 font-semibold"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredUsers.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || selectedRole !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No users have been created yet'
                  }
                </p>
                {(searchTerm || selectedRole !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedRole('all')
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </>
        )

      case 'orders':
        return (
          <div className='w-full bg-white rounded-xl shadow-sm p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h1 className='text-2xl font-bold text-gray-900'>Orders</h1>
              <span className='bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full'>
                {orders.length} Orders
              </span>
            </div>

            <div className='space-y-4'>
              {orders.map((order) => (
                <div key={order._id} className='bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200'>
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <div className='flex items-center space-x-3'>
                        <h3 className='font-semibold text-gray-900'>{order.orderNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                          order.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <p className='text-sm text-gray-500 mt-1'>{order.shippingInfo?.fullName} • {order.shippingInfo?.email}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-bold text-gray-900'>${order.orderSummary?.totalAmount?.toFixed(2)}</p>
                      <p className='text-sm text-gray-500'>{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className='flex items-center justify-between py-3 border-t border-gray-200'>
                    <div className='flex items-center space-x-3'>
                      <span className={`w-2 h-2 rounded-full ${order.isPaid ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      <span className='text-sm text-gray-600'>{order.paymentMethod?.type}</span>
                    </div>

                    <div className="backdrop-blur-md bg-white/40 flex gap-3 items-center rounded-xl p-[2px] shadow-lg">
                      <IoMdInformationCircleOutline className='text-xl ml-2 cursor-pointer' />
                      <div className="relative w-40">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleOrderStatus(order._id, e.target.value)}
                          className="appearance-none w-full capitalize px-4 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-200 cursor-pointer"
                        >
                          <option className="py-2 capitalize">pending</option>
                          <option className="py-2 capitalize">confirmed</option>
                          <option className="py-2 capitalize">processing</option>
                          <option className="py-2 capitalize">shipped</option>
                          <option className="py-2 capitalize">delivered</option>
                          <option className="py-2 capitalize">cancelled</option>
                          <option className="py-2 capitalize">refunded</option>
                        </select>

                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                          <FaArrowAltCircleDown />
                        </span>
                      </div>
                    </div>




                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className='text-center py-12'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <svg className='w-8 h-8 text-gray-400' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className='text-lg font-medium text-gray-900 mb-2'>No orders yet</h3>
                  <p className='text-gray-500'>Orders will appear here once customers start placing them.</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'products':
        return (
          <div className='w-full min-h-100 rounded-xl bg-white p-6'>
            <h1 className='text-2xl font-bold mb-6'>Products</h1>
            <button
              onClick={() => { setIsFormOpen(true) }}
              className='px-7 py-2 bg-blue-600 cursor-pointer  text-white rounded-lg m-4 hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2'>Add Product</button>

            <div
              className={`w-full h-full ${isFormOpen ? "flex" : "hidden"
                } fixed top-0 left-0 bg-black bg-opacity-40 backdrop-blur-sm z-50 justify-center items-center`}
            >
              <div className="w-[90%] md:w-[50%] max-h-[90vh] overflow-y-auto p-6 bg-white rounded-2xl shadow-xl">

                <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Product</h2>

                {/* Product Name */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Product Name</label>
                  <input
                    onChange={handleChangeCreate}
                    value={createProduct.name}
                    type="text"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter product name"
                    name="name"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Description</label>
                  <textarea
                    onChange={handleChangeCreate}
                    value={createProduct.description}
                    rows={3}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter description"
                    name="description"
                  />
                </div>

                {/* Brand & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Brand</label>
                    <input
                      onChange={handleChangeCreate}
                      value={createProduct.brand}
                      type="text"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter brand name"
                      name="brand"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Category</label>
                    <input
                      onChange={handleChangeCreate}
                      value={createProduct.category}
                      type="text"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter category"
                      name="category"
                    />
                  </div>
                </div>

                {/* Prices */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Original Price</label>
                    <input
                      onChange={handleChangeCreate}
                      value={createProduct.price}
                      type="number"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="0.00"
                      name="price"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Image URL"
                    value={createProduct.image}
                    onChange={(e) => setCreateProduct({ ...createProduct, image: e.target.value })}
                  />

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Discounted Price</label>
                    <input
                      onChange={handleChangeCreate}
                      value={createProduct.discountedPrice}
                      type="number"
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="0.00"
                      name="discountedPrice"
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-1">Stock Quantity</label>
                  <input
                    onChange={handleChangeCreate}
                    value={createProduct.stock}
                    type="number"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="0"
                    name="stock"
                  />
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => handleCreate()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition"
                  >
                    Add Product
                  </button>

                  <button
                    onClick={() => setIsFormOpen(false)}
                    className="border border-gray-400 hover:bg-gray-100 text-gray-700 font-semibold px-6 py-3 rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>






            {products.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-sm p-8 max-w-md mx-auto border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No products available
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Try adjusting your filters or search query.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((ele) => {
                    const discountPercentage = Math.round(
                      ((ele.price - ele.discountedPrice) / ele.price) * 100
                    );

                    return (
                      <div
                        key={ele._id}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                      >
                        <div className="relative h-60 overflow-hidden rounded-t-2xl">
                          <img
                            src={ele.image}
                            alt={ele.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {discountPercentage > 0 && (
                            <span className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs font-semibold rounded-full">
                              -{discountPercentage}%
                            </span>
                          )}

                        </div>

                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                            {ele.name}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {ele.brand}
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            ${ele.discountedPrice}{" "}
                            {ele.price > ele.discountedPrice && (
                              <span className="text-sm text-gray-400 line-through ml-2">
                                ${ele.price}
                              </span>
                            )}
                          </p>
                          <div className='w-full mt-4 flex justify-center items-center gap-4'>
                            <button
                              onClick={() => handleUpdate(ele._id)}
                              className='px-4 py-2 rounded-lg cursor-pointer bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 transition-colors duration-200'
                            >
                              <FaEdit className='text-sm' />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(ele._id)}
                              className="px-4 py-2 rounded-lg cursor-pointer bg-red-500 hover:bg-red-600 text-white flex items-center gap-2 transition-colors duration-200"
                            >
                              <MdDelete className="text-sm" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination.total > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={() => handlePageChange(pagination.current - 1)}
                      disabled={pagination.current === 1}
                      className={`px-4 py-2 rounded-lg ${pagination.current === 1
                        ? "bg-gray-300 text-gray-500"
                        : "bg-purple-600 text-white hover:bg-purple-500"
                        }`}
                    >
                      ← Prev
                    </button>

                    {Array.from({ length: pagination.total }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1.5 rounded-lg ${pagination.current === i + 1
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-purple-100"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(pagination.current + 1)}
                      disabled={pagination.current === pagination.total}
                      className={`px-4 py-2 rounded-lg ${pagination.current === pagination.total
                        ? "bg-gray-300 text-gray-500"
                        : "bg-purple-600 text-white hover:bg-purple-500"
                        }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )

      case 'overview':
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-2xl font-bold text-gray-900">{adminUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-orange-500">
                <div className="flex items-center">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.name || 'No Name'}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                        <p className="text-xs text-gray-500">${order.orderSummary?.totalAmount?.toFixed(2)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="mt-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' },
            { id: 'orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
            { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
            { id: 'overview', label: 'Overview', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 14v-2' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors duration-200 ${activeSection === item.id
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900 ml-2 capitalize">{activeSection}</h1>
            </div>

            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-red-800 font-medium">Error loading data</h3>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              </div>
              <button
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && renderContent()}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <EditProduct
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}


    </div>
  )
}

export default Admin