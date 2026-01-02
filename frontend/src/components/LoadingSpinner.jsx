const LoadingSpinner = ({ size = "medium" }) => {
  const sizes = {
    small: "w-6 h-6",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-green-600 ${sizes[size]}`}></div>
  );
};

export default LoadingSpinner;