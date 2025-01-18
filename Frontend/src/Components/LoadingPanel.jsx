const LoadingPanel = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 fixed top-0 left-0 right-0 bottom-0 z-50">
      <div className="flex flex-col items-center justify-center space-y-6 p-8 rounded-lg bg-white bg-opacity-10 backdrop-blur-xl shadow-lg border border-white">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin-slow"></div>
          <div className="absolute w-16 h-16 rounded-full border-4 border-dashed border-gray-400 animate-pulse"></div>
        </div>
        <span className="text-white text-2xl font-extrabold animate-pulse">Loading...</span>
        <span className="text-white text-lg opacity-80">Please wait while we prepare your content</span>
      </div>
    </div>
  );
};

export default LoadingPanel;
