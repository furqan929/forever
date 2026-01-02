// const express = require("express");
// const router = express.Router();
// const {protect} = require("../middleware/protect");
// const {
//     placeOrder,
//     getUserOrders,
//     getOrderById,
//     cancelOrder
// } = require("../controller/Order");

// // Order routes
// router.post("/place", protect, placeOrder);
// router.get("/my-orders", protect, getUserOrders);
// router.get("/:id/deteil", protect, getOrderById);
// router.delete("/:id/cancel", protect, cancelOrder)

// module.exports = router;

const express = require("express");
const { 
  // User controllers
  placeOrder, 
  getUserOrders, 
  getOrderById, 
  getShippingOptions, 
  calculateOrderTotal,
  cancelOrder,
  
  // Admin controllers
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics
} = require("../controller/Order");
const { protect, admin } = require("../middleware/protect");

const router = express.Router();

// ============= PUBLIC ROUTES =============
// Get shipping options (no auth required)
router.get("/shipping-options", getShippingOptions);


// ============= USER PROTECTED ROUTES =============
// Calculate order total before checkout
router.post("/calculate-total", protect, calculateOrderTotal);

// 1.
// Place new order
router.post("/place1", protect, placeOrder);

// Get user's own orders
router.get("/my-orders", protect, getUserOrders);

// Get specific order by ID (user's own order)
router.get("/:id/deteil", protect, getOrderById);

// Cancel user's own order
router.put("/:id/cancel", protect, cancelOrder);

// ============= ADMIN ROUTES =============
// Get all orders (admin only)
router.get("/admin/all", protect, admin, getAllOrders);

// Get order statistics (admin only)
router.get("/admin/statistics", protect, admin, getOrderStatistics);

// Update order status (admin only)
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;