import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";
import logo from "../assets/logo.png";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
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
      console.log("Error during logging in:", error);
      if (error.response.status === 404) {
        console.log("User not found");
        setError("Invalid email or password");
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
      <div className="p-7 h-screen flex flex-col justify-between relative z-10 bg-black/50">
        <div>
          <div className="flex justify-center items-center relative z-10">
            <img
              className="h-[150px] w-[150px]"
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
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
