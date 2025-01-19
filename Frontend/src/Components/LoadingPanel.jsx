const LoadingPanel = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
      >
        <source
          src="https://videos.pexels.com/video-files/5485148/5485148-sd_640_360_25fps.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      
      <div className="flex flex-col items-center justify-center space-y-6 p-8 rounded-lg bg-white bg-opacity-10 backdrop-blur-xl shadow-lg border border-white">
        <div className="relative">
          <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin-slow"></div>
          <div className="absolute w-16 h-16 rounded-full border-4 border-dashed border-gray-400 animate-pulse"></div>
        </div>
        <span className="text-white text-2xl font-extrabold animate-pulse">
          Loading...
        </span>
        <span className="text-white text-lg opacity-80">
          Please wait while we prepare your content
        </span>
      </div>
    </div>
  );
};

export default LoadingPanel;
