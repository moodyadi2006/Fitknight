import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingPanel from "../Components/LoadingPanel";

/**
 * VerifyEmail
 *
 * This component is used to verify a user's email address after registration.
 * It fetches the user's data from the backend, and displays a form to input a 6-digit
 * verification code sent to the user's email address. If the code is valid, it verifies
 * the user's email and redirects them to their preferred page.
 *
 * @returns {JSX.Element} A JSX element containing a form to input the verification code.
 */
const VerifyEmail = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(""); // to handle any error during verification
  const [user, setUser] = useState(null); // user state to handle data fetched from API
  const [isLoading, setIsLoading] = useState(true); // Loading state to show a loader while fetching user data

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setUser(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Unable to fetch user data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    // If input is a number, update the code
    if (value.length <= 1 && /^[0-9]$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (index < 5 && value) {
        document.getElementById(`code-input-${index + 1}`).focus();
      }
    }

    // Handle backspace or delete
    if (e.key === "Backspace" || e.key === "Delete") {
      const newCode = [...code];
      newCode[index] = ""; // Clear the current input
      setCode(newCode);
      if (index > 0) {
        document.getElementById(`code-input-${index - 1}`).focus(); // Focus on the previous input
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter a valid verification code.");
      return;
    }
    await axios.post(`${import.meta.env.VITE_BASE_URL}/users/verify`, {
      verificationToken: verificationCode,
    });

    if (user && verificationCode === user.verificationToken) {
      const userPreference = user.preference;
      if (userPreference === "FitnessGroup") {
        navigate("/FitnessGroup");
      } else if (userPreference === "WorkoutBuddy") {
        navigate("/WorkoutBuddy");
      } else {
        setError("Invalid preference.");
      }
    } else {
      setError("Incorrect verification code. Please try again.");
    }
  };

  // Render a loading state if user data is still being fetched
  if (isLoading) {
    return <div><LoadingPanel /></div>;
  }

  return (
    <div className="relative min-h-screen w-full">
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source
          src="https://videos.pexels.com/video-files/5485148/5485148-sd_640_360_25fps.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 bg-black/50 min-h-screen flex flex-col justify-center p-6">
        <div className="w-[600px] mx-auto bg-black/70 p-6 rounded-lg shadow-lg">
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
          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center space-y-6"
          >
            <p className="text-lg text-gray-700">
              We have sent a 6-digit verification code to your email. Please
              enter it below to verify your account and proceed.
            </p>
            <div className="flex justify-center space-x-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onKeyDown={(e) => handleChange(e, index)}
                  maxLength={1}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-4 focus:ring-blue-400 transition duration-200"
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center">
              If you didn&apos;t receive the code, please check your spam folder
              or{" "}
              <span className="text-blue-500 font-semibold cursor-pointer hover:underline">
                request a new code
              </span>
              .
            </p>
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-10 rounded-xl shadow-lg hover:from-blue-600 hover:to-blue-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Verify
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
