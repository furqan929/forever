let express = require("express");
let { protect } = require("../middleware/protect");
const { paymentMethod } = require("../controller/Stripe.js")
const router = express.Router();

router.post("/post-checkout-session", protect, paymentMethod)

module.exports = router;
