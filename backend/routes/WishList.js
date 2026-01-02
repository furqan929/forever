const express = require("express");
const { wishList, getWishlist, deleteWishlist } = require("../controller/product");
const {protect} = require("../middleware/protect");
const router = express.Router();

router.post("/add", protect, wishList);

router.get("/", protect, getWishlist);

router.delete("/delete/:id",protect, deleteWishlist)

module.exports = router;
