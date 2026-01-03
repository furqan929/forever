import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../config/api";

const WishList = () => {
  const [wishlist, setWishlist] = useState([]);

  const getWishlist = async () => {
    try {
      let token = localStorage.getItem("token");
      let res = await axios.get(`${API_BASE_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWishlist(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wishlist");
    }
  };

  const deleteWishlist = async (id) => {
    try {
      let token = localStorage.getItem("token");

      await axios.delete(`${API_BASE_URL}/api/wishlist/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("WishList removed!");
      getWishlist();
    } catch (err) {
      console.log(err);
      toast.error("Failed To Delete WishList");
    }
  };

  useEffect(() => {
    getWishlist();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Wishlist</h1>

      {wishlist.length > 0 ? (
        <div className="space-y-4">
          {wishlist.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between border p-4 rounded-xl shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h2 className="font-semibold text-lg">{item.name}</h2>
                  <p className="text-gray-500">Rs. {item.discountedPrice}</p>
                </div>
              </div>

              <button
                onClick={() => deleteWishlist(item._id)}
                className="w-10 h-10 flex justify-center items-center cursor-pointer rounded-lg bg-red-500 text-white shadow hover:bg-red-600 hover:scale-105 active:scale-95 transition-all"
              >
                <MdDelete className="text-xl" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No items in wishlist</p>
      )}
    </div>
  );
};

export default WishList;
