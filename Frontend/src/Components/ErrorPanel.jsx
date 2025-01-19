import {logo} from "../assets/logo.png"
const ErrorPanel = ({ message }) => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800 bg-opacity-75 fixed top-0 left-0 right-0 bottom-0 z-50">
      <div className="flex flex-col items-center justify-center space-y-6 p-8 rounded-lg bg-white bg-opacity-10 backdrop-blur-xl shadow-lg border border-white">
        <div className="flex justify-center items-center mb-6">
          <img
            className="h-[100px] w-[100px] mr-3"
            src={logo}
            alt="Fitknight Logo"
          />
          <span className="text-red-500 text-3xl font-extrabold">
            FITKNIGHT
          </span>
        </div>
      <div className="bg-red-600 text-white p-8 rounded-lg shadow-lg flex items-center space-x-4 max-w-md mx-auto">
        <div className="w-16 h-16 bg-white text-red-600 rounded-full flex items-center justify-center">
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
          <h3 className="text-2xl font-semibold mb-2">Error</h3>
          <p className="text-sm">{message || 'Something went wrong. Please try again later.'}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPanel;
