import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";
import logo from "../assets/logo.png";

/**
 * A function component that renders the user login page.
 * The page displays a form that takes an email and password as input, and
 * submits a POST request to the server for user login. If the login is
 * successful, the user's data and authentication tokens are stored in local
 * storage, and the user is redirected based on their preference.
 * Displays appropriate error messages for failed requests.
 *
 * @returns {ReactElement} The JSX element representing the user login page.
 */
const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /**
   * Handles the user login form submission by preventing the default form action,
   * gathering form data, and sending a POST request to the server for user login.
   * If the login is successful, the user's data and authentication tokens are
   * stored in local storage, and the user is redirected based on their preference.
   * Displays appropriate error messages for failed requests.
   *
   * @param {Event} e - The event object representing the form submission event.
   */
  
  const submitHandler = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    try {
      const userData = { email, password };
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        userData
      );

      if (response.status === 200) {
        const data = response.data;

        // Check if 'user' exists before accessing its properties
        if (data) {
          setUser(data.data.user);
          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("refreshToken", data.data.refreshToken);

          // if (!data.data.user.isVerified) {
          //   navigate("/verify");
          // }

          alert("Login successful");
          const userPreference = data.data.user.preference;
          if (userPreference === "FitnessGroup") {
            navigate("/FitnessGroup"); // Redirect to Fitness Group page
          } else {
            navigate("/WorkoutBuddy"); // Redirect to another page based on preference
          }

          // Clear input fields
          setEmail("");
          setPassword("");
        } else {
          console.error("User data not found in the response.");
        }
      }
    } catch (error) {
      if (error.response.status === 404) {
        setEmailError("Invalid email");
        alert("Invalid email");
      } else if (error.response.status === 405) {
        setPasswordError("Invalid password");
        alert("Invalid password");
      } else if (error.response.status === 400) {
        setEmailError("All Fields are required");
        alert("All Fields are required...");
      }
    }
  };

  return (
    <div className="relative h-screen w-full">
      {/* Background Video */}
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

      {/* Content */}
      <div className="p-7 h-screen flex flex-col justify-center relative z-10 bg-black/50">
        <div className="w-[600px] mx-auto bg-black/70 p-6 rounded-lg shadow-lg">
          <div className="flex justify-center items-center relative z-10">
            <img
              className="h-[100px] w-[100px]"
              src={logo}
              alt="Fitknight Logo"
            />
            <div>
              <span className="text-red-500 text-4xl font-extrabold">
                FITKNIGHT
              </span>
            </div>
          </div>
          <div className="mt-5">
            <form onSubmit={(e) => submitHandler(e)}>
              <div className="mb-7">
                <h3 className="text-xl mb-2 text-white">
                  What&apos;s your email
                </h3>
                <input
                  type="email"
                  required
                  placeholder="Enter your Email"
                  className="bg-[#eeeeee] mb-2 rounded px-4 py-2 border w-full text-lg placeholder:text-sm outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>

              <div className="mb-7">
                <h3 className="text-xl mb-2 text-white">
                  What&apos;s your password
                </h3>
                <input
                  className="bg-[#eeeeee] mb-2 rounded px-4 py-2 border w-full text-lg placeholder:text-sm outline-none"
                  type="password"
                  required
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>

              <button className="bg-red-600 text-white font-semibold mb-2 rounded px-4 py-2 w-full text-lg placeholder:text-sm">
                Login
              </button>
              <p className="text-center text-white">
                New Here?
                <Link to="/userSignup" className="text-blue-600 mb-7">
                  Create Account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
