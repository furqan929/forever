import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { MdCancel, MdRefresh, MdInfo } from "react-icons/md";

// ✅ Order Details Modal Component
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-all duration-200 text-2xl font-bold"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-6 border-b pb-4">
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            Order Details
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Review your order information below
          </p>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600">Order Number:</span>
            <span className="font-mono text-gray-800">
              {order.orderNumber?.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${order.orderStatus === "delivered"
                  ? "bg-green-100 text-green-700"
                  : order.orderStatus === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-blue-100 text-blue-700"
                }`}
            >
              {order.orderStatus}
            </span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="font-semibold text-gray-600">Date:</span>
            <span className="text-gray-700">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold text-gray-600">Total:</span>
            <span className="text-xl font-bold text-blue-600">
              ${order.orderSummary?.totalAmount?.toFixed(2) || "0.00"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 border-t"></div>

        {/* Ordered Items */}
        {order.items?.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
              🛍️ Items Ordered
            </h3>
            <ul className="divide-y divide-gray-200 max-h-56 overflow-y-auto pr-2">
              {order.items.map((item, idx) => (
                <li
                  key={idx}
                  className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg transition"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-800">
                      {item.productName}
                    </span>
                    <span className="text-xs text-gray-500">
                      Quantity: {item.quantity}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-700">
                    ${item.price?.toFixed(2) || "0.00"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

};

const MyOrder = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("token")

      if (!token) {
        setError("Please login to view your orders")
        return
      }

      const res = await axios.get("http://localhost:3000/api/orders/my-orders", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      console.log(res);




      setOrders(res.data.data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      setError("Failed to load orders. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200 relative">
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="absolute top-6 right-6 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all"
        >
          <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
        </button>
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          My Orders
        </h1>
        <p className="text-center text-gray-600 text-lg">
          Track and manage your purchases
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-3">No orders found</h3>
          <p className="text-gray-500 text-lg">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Order #{order.orderNumber?.toUpperCase() || 'N/A'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    ${order.orderSummary?.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-28 h-9 rounded-2xl bg-blue-500 flex items-center justify-center p-2 gap-2 hover:bg-blue-600 transition-all cursor-pointer"
                  >
                    <MdInfo className='text-white text-lg' />
                    <span className='text-md font-bold text-amber-50'>Details</span>
                  </button>

                  {order.orderStatus.toLowerCase() !== 'cancelled' &&
                    order.orderStatus.toLowerCase() !== 'delivered' && (
                      <button
                        className="w-28 h-9 rounded-2xl bg-red-500 flex items-center justify-center p-2 gap-2 hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <MdCancel className='text-white text-lg' />
                        <span className='text-md font-bold text-amber-50'>
                          Cancel
                        </span>
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  )
}

export default MyOrder
