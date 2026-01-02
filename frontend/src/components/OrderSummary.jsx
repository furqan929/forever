import React from "react";
import { FaGift } from "react-icons/fa";

const OrderSummary = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* Heading */}
      <h1 className="text-2xl font-bold mb-5">Order Summary</h1>

     

    
      {/* Promo Code */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-2 text-gray-700">
          <FaGift className="text-pink-500" />
          <p className="font-semibold">Promo Code</p>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter code"
            className="flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
          <button className="w-full h-10 mt-5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition">
            Apply
          </button>
      </div>

      {/* Checkout Button */}
      <button className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition shadow">
        Proceed to Checkout
      </button>
    </div>
  );
};

export default OrderSummary;
