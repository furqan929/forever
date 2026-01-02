// import axios from 'axios'
// import React, { useState } from 'react'
// import { toast, ToastContainer } from 'react-toastify'
// import { FaStar } from "react-icons/fa";

// const Reviews = ({ id,getReview }) => {
//   let [comment, setComment] = useState("")
//   let [rating, setRating] = useState(0);

//   let Review = async () => {
//     let token = localStorage.getItem("token");

//     if (!token) {
//       toast("Please Login First.");
//       return;
//     }

//     try {
//       let res = await axios.post(
//         `http://localhost:3000/api/products/${id}/review`,
//         {
//           comment,
//           rating,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       setComment("");
//       setRating(0);
//       getReview()
//     } catch (error) {
//       // console.error(error);
//       toast(error.response.data.message);
//     }
//   };

//   return (
//     <div>
//       <div className='w-full min-h-30 border-1'>
//         <div className='w-full h-14 border-1 flex justify-around items-center'>
//           <input
//             type="text"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             className='w-[70%] h-13 border-1 rounded-lg p-5 active:scale-99 transition-all'
//             name="comment"
//             placeholder='Write A Review...'
//           />
//           <button
//             onClick={Review}
//             className='w-45 h-13 bg-green-500 text-amber-50 rounded-xl cursor-pointer text-lg shadow-lg active:scale-95 transition-all'
//           >
//             Reviews
//           </button>
//         </div>

//         {/* Dynamic stars with map */}
//         <div className='w-full h-15 border-1 flex justify-center items-center gap-2 mt-2'>
//           {[...Array(5)].map((_, index) => {
//             let starValue = index + 1;
//             return (
//               <FaStar
//                 key={index}
//                 onClick={() => setRating(starValue)}
//                 className={`w-6 h-6 cursor-pointer transition-all ${starValue <= rating ? "text-amber-400" : "text-gray-400"
//                   }`}
//               />
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Reviews;
import axios from 'axios'
import React, { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { FaStar, FaPaperPlane, FaEdit } from "react-icons/fa";

const Reviews = ({ id, getReview }) => {
  let [comment, setComment] = useState("")
  let [rating, setRating] = useState(0);
  let [hover, setHover] = useState(0);
  let [isSubmitting, setIsSubmitting] = useState(false);

  let Review = async () => {
    let token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login to submit a review");
      return;
    }

    if (!rating) {
      toast.warning("Please select a rating");
      return;
    }

    if (!comment.trim()) {
      toast.warning("Please write a review comment");
      return;
    }

    setIsSubmitting(true);

    try {
      let res = await axios.post(
        `http://localhost:3000/api/products/${id}/review`,
        {
          comment: comment.trim(),
          rating,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setComment("");
      setRating(0);
      getReview();
      toast.success("Review submitted successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      Review();
    }
  };

  return (
    <div className="w-full max-w-2xl m-4 mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FaEdit className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">Write a Review</h3>
        </div>

        {/* Rating Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How would you rate this product?
          </label>
          <div className="flex justify-center gap-2">
            {[...Array(5)].map((_, index) => {
              const starValue = index + 1;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHover(starValue)}
                  onMouseLeave={() => setHover(0)}
                  className="transform transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none"
                >
                  <FaStar
                    className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${starValue <= (hover || rating)
                      ? "text-amber-500 drop-shadow-sm"
                      : "text-gray-300"
                      } ${starValue <= (hover || rating)
                        ? "filter drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                        : ""
                      }`}
                  />
                </button>
              );
            })}
          </div>
          {rating > 0 && (
            <p className="text-center text-sm text-gray-600 mt-2">
              {rating} star{rating > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Comment Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Share your experience
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
            name="comment"
            placeholder="What did you like or dislike about this product? Share your thoughts..."
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Be honest and specific</span>
            <span>{comment.length}/500</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={Review}
          disabled={isSubmitting || !rating || !comment.trim()}
          className={`w-full flex items-center justify-center gap-2 h-12 rounded-xl font-medium transition-all duration-200 ${isSubmitting || !rating || !comment.trim()
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            } active:scale-95`}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Submitting...
            </>
          ) : (
            <>
              <FaPaperPlane className="w-4 h-4" />
              Submit Review
            </>
          )}
        </button>

        {/* Helper Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Your review will help other customers make better decisions
        </p>
      </div>
    </div>
  )
}

export default Reviews;