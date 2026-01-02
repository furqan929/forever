let express = require("express")
let router = express.Router()
let {protect} = require("../middleware/protect");
let { getAllUsers, deleteUser, getOrders ,productsAdmin} = require("../controller/Admin")

router.get("/all-users", protect, getAllUsers)
router.delete("/delete-user/:id", protect, deleteUser)

router.get("/orders", protect, getOrders);
router.get("/products", protect, productsAdmin);

module.exports = router;    