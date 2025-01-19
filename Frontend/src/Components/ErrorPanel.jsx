import logo from "../assets/logo.png";

const ErrorPanel = ({ message }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 fixed top-0 left-0 right-0 bottom-0 z-50">
      <div className="flex flex-col items-center justify-center space-y-8 p-8 rounded-lg bg-white bg-opacity-10 backdrop-blur-xl shadow-xl border border-gray-300">
        {/* Logo Section */}
        <div className="flex justify-center items-center mb-6">
          <img
            className="h-[80px] w-[80px] mr-3"
            src={logo}
            alt="Fitknight Logo"
          />
          <span className="text-red-500 text-4xl font-bold tracking-wide">
            FITKNIGHT
          </span>
        </div>

        {/* Error Message Box */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg flex items-center space-x-6 max-w-lg">
          <div className="w-16 h-16 bg-white text-red-600 rounded-full flex items-center justify-center shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M18.364 5.636a9 9 0 111.415 1.414A7.5 7.5 0 1012 21a7.5 7.5 0 001.5-14.5 9 9 0 114.864 9.864"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Oops! An Error Occurred</h3>
            <p className="text-sm leading-relaxed">
              {message || "Something went wrong. Please try again later."}
            </p>
          </div>
        </div>

        {/* Call-to-Action Button */}
        <button
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-md transition duration-200 ease-in-out"
          onClick={() => window.location.reload()} // You can replace this with a custom handler
        >
          Retry
        </button>
      </div>
    </div>
  );
};

export default ErrorPanel;
