let express = require("express")
let { getProducts, getProductsById, addReview, getReviews, getCategories, getBrand, createProduct, updateProduct, deleteProduct } = require("../controller/product")
const { protect, admin } = require("../middleware/protect")


let router = express.Router()

router.get("/products", getProducts)
router.get("/products/:id", getProductsById)
router.post("/:id/review", protect, addReview)
router.get("/:id/reviews", getReviews);
router.get("/categories", getCategories)
router.get("/brand", getBrand)


// Admin Routes (authentication + admin role required)
router.post('/', protect, admin,  createProduct);
router.put('/:id', protect, admin,  updateProduct);
router.delete('/:id', protect, admin,  deleteProduct);

module.exports = router;