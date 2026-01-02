let express = require("express")
let {protect} = require("../middleware/protect")
let { addToCart, getCart, removeFromCart} = require("../controller/Cart")
let router = express.Router();


router.post("/addCart", protect, addToCart)
router.get("/getCart", protect, getCart)

router.delete("/deleteCart/:id", protect, removeFromCart)


module.exports = router;
