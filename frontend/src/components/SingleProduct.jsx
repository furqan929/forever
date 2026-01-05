import React, { useEffect, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { FaHeart, FaShoppingCart, FaStar, FaTag } from "react-icons/fa";
import Reviews from "./Reviews";
import { useMyContext } from "../context/Context";

const SingleProduct = () => {
  const { id } = useParams();

  const {
    getReview,
    reviews,
    getProduct,
    product,
    addCart,
    addToWishlist,
    wishlist,
    loading,
    error
  } = useMyContext();

  useEffect(() => {
    if (id) {
      getProduct(id);
      getReview(id);
    }
  }, [id, getProduct, getReview]);

  // Memoized values for better performance
  const isWishlisted = useMemo(() =>
    wishlist.includes(product?._id),
    [wishlist, product?._id]
  );

  const discountPercentage = useMemo(() => {
    if (!product?.price || !product?.discountedPrice) return 0;
    return Math.round(((product.price - product.discountedPrice) / product.price) * 100);
  }, [product?.price, product?.discountedPrice]);

  // Memoized event handlers
  const handleAddToCart = useCallback(() => {
    if (product?._id) {
      addCart(product._id);
    }
  }, [product?._id, addCart]);

  const handleAddToWishlist = useCallback(() => {
    if (product?._id) {
      addToWishlist(product._id);
    }
  }, [product?._id, addToWishlist]);


  if (error) {
    return (
      <div className="text-center py-8 sm:py-10 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
          <h2 className="text-red-600 text-lg sm:text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-500 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 sm:mt-4 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8 sm:py-10 px-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 max-w-md mx-auto">
          <h2 className="text-yellow-600 text-lg sm:text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-yellow-500 text-sm sm:text-base">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <Link to="/">
        <button className="w-28 h-13 border-1 ml-10 m-3 rounded-xl border-blue-400 text-blue-400 cursor-pointer">← Back</button>
      </Link>
      {/* Main Product Section */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8">
            {/* Product Images */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 xs:h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 object-cover rounded-lg sm:rounded-xl shadow-md transition-transform duration-300 group-hover:scale-105"
                  loading="eager"
                />
                {discountPercentage > 0 && (
                  <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center">
                    <FaTag className="mr-1 text-xs sm:text-sm" /> {discountPercentage}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center space-y-4 sm:space-y-5 lg:space-y-6">
              <div>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full mb-2 sm:mb-3">
                  {product.brand}
                </span>
                <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${star <= (product.averageRating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-gray-600 text-sm sm:text-base">
                    ({reviews.length} reviews)
                  </span>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">
                    Rs. {product.discountedPrice}
                  </span>
                  {product.discountedPrice < product.price && (
                    <span className="text-lg sm:text-xl lg:text-2xl text-gray-500 line-through">
                      Rs. {product.price}
                    </span>
                  )}
                </div>
                {discountPercentage > 0 && (
                  <p className="text-green-600 font-semibold text-sm sm:text-base">
                    You save Rs. {(product.price - product.discountedPrice).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {product.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-green-600 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold hover:bg-green-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  <FaShoppingCart className="text-xs sm:text-sm" />
                  Add to Cart
                </button>

                <button
                  onClick={handleAddToWishlist}
                  className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${isWishlisted
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "bg-gray-50 border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500"
                    }`}
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <FaHeart className={`w-5 h-5 sm:w-6 sm:h-6 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div>
                  <span className="text-xs sm:text-sm text-gray-500">Availability</span>
                  <p className="font-semibold text-green-600 text-sm sm:text-base">In Stock</p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-500">Category</span>
                  <p className="font-semibold capitalize text-sm sm:text-base">{product.category || "General"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 mt-6 sm:mt-8 lg:mt-10 xl:mt-12">
        <Reviews id={product._id} getReview={getReview} />

        {reviews.length > 0 ? (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 mt-4 sm:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Customer Reviews ({reviews.length})
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold text-base sm:text-lg">
                  ⭐ {product.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-gray-500 text-sm sm:text-base">Average Rating</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {reviews.map((review, index) => {
                // Safety check for review data
                if (!review || !review.user) return null;
                
                return (
                <div
                  key={review._id || index}
                  className="border border-gray-100 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                        {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                          {review.user?.name || 'Anonymous'}
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">
                      <FaStar className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      <span className="font-semibold text-yellow-700 text-sm sm:text-base">
                        {review.rating || 0}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{review.comment || ''}</p>
                </div>
              )})}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 sm:py-10 lg:py-12 bg-white rounded-xl sm:rounded-2xl shadow-md">
            <div className="max-w-md mx-auto px-4">
              <FaStar className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-600 mb-2">
                No Reviews Yet
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                Be the first to share your thoughts about this product!
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SingleProduct;