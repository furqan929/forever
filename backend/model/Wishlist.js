const mongoose = require("mongoose");

const wishlistSchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "ForeverUser", required: true },
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);
