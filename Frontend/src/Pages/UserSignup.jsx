import { useContext, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
/**
 * Handles user signup form submission by gathering form data and sending a POST
 * request to the server for user registration. If the registration is successful,
 * the user's data and authentication tokens are stored in local storage, and the
 * user is redirected based on their preference. Displays appropriate error
 * messages for failed requests.
 *
 * @returns {JSX.Element} The signup form component
 */
const UserSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("Male");
  const [bio, setBio] = useState("");
  const [preference, setPreference] = useState("WorkoutBuddy");
  const [profile, setProfile] = useState(null);
  const [fitnessGoals, setFitnessGoals] = useState("WeightLoss");
  const [workoutPreferences, setWorkoutPreferences] = useState([]);
  const [availableDays, setAvailableDays] = useState("Weekends");
  const [availableTimeSlot, setAvailableTimeSlot] = useState("Morning");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [allowChat, setAllowChat] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(UserDataContext);

  /**
   * Handles the user signup form submission by preventing the default form action,
   * gathering form data, and sending a POST request to the server for user registration.
   * If the registration is successful, the user's data and authentication tokens are
   * stored in local storage, and the user is redirected based on their preference.
   * Displays appropriate error messages for failed requests.
   *
   * @param {Event} e - The event object representing the form submission event.
   */

  const submitHandler = async (e) => {
    e.preventDefault();
    setEmailError("");
    setUsernameError("");

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("gender", gender);
    formData.append("bio", bio);
    formData.append("preference", preference);
    formData.append("fitnessGoals", fitnessGoals);
    formData.append("workoutPreferences", workoutPreferences);
    formData.append("availableDays", availableDays);
    formData.append("availableTimeSlot", availableTimeSlot);
    formData.append("experienceLevel", experienceLevel);
    formData.append("phoneNumber", phoneNumber);
    formData.append("allowChat", allowChat);

    if (profile) {
      formData.append("profile", profile);
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        const data = response.data.data;
        setUser(data.user);

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Check if email is verified before navigating
        // if (!data.user.isVerified) {
        //   navigate("/verify");
        // }
        alert("Registration successful!");

        const userPreference = data.user.preference;
        if (userPreference === "FitnessGroup") {
          navigate("/FitnessGroup");
        } else {
          navigate("/WorkoutBuddy");
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setUsernameError("Username already taken");
        setEmailError("User Email already exists");
        alert("User already exists");
      } else if (err.response && err.response.status === 410) {
        setUsernameError("Username already taken");
        alert("Username already taken");
      } else if (err.response && err.response.status === 411) {
        setEmailError("User Email already exists");
        alert("User Email already exists");
      } else if (err.response && err.response.status === 400) {
        alert("All Fields are required...");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }

    // Reset form fields
    setEmail("");
    setPassword("");
    setUsername("");
    setFullName("");
    setGender("");
    setBio("");
    setPreference("");
    setProfile(null);
    setFitnessGoals("WeightLoss");
    setWorkoutPreferences([]);
    setAvailableDays("Weekends");
    setAvailableTimeSlot("Morning");
    setExperienceLevel("Beginner");
    setPhoneNumber("");
    setAllowChat("false");
  };

  /**
   * Handles a change event on a workout preference checkbox.
   * Toggles the preference in the workoutPreferences state array.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event
   */
  const handleCheckboxChange = (e) => {
    const { value } = e.target;

    setWorkoutPreferences((prevPreferences) => {
      if (prevPreferences.includes(value)) {
        // If the preference is already in the array, remove it
        return prevPreferences.filter((preference) => preference !== value);
      } else {
        // If the preference is not in the array, add it
        return [...prevPreferences, value];
      }
    });
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Video*/}
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
          <form onSubmit={submitHandler}>
            <h3 className="text-lg mb-2 text-white">Full Name</h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="text"
              required
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <h3 className="text-lg mb-2 text-white">Username</h3>
            <input
              className="bg-gray-200 rounded px-4 py-2 w-full text-sm outline-none"
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {usernameError && (
              <p className="text-red-500 text-sm mt-1">
                username already taken
              </p>
            )}

            <h3 className="text-lg mb-2 text-white">Email</h3>
            <input
              className="bg-gray-200 rounded px-4 py-2 w-full text-sm outline-none"
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && (
              <p className="text-red-500 text-sm mt-1">email already exists</p>
            )}

            <h3 className="text-lg mb-2 text-white">Password</h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <h3 className="text-lg mb-2 text-white ">Contact Information</h3>
            <PhoneInput
              country={"in"}
              value={phoneNumber}
              onChange={(phone) => setPhoneNumber(phone)}
              inputClass="bg-gray-200 rounded px-4 py-2 text-sm"
            />

            <h3 className="text-lg mb-2 text-white">Profile </h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="file"
              onChange={(e) => setProfile(e.target.files[0])}
            />

            <h3 className="text-lg mb-2 text-white">Gender</h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>

            <h3 className="text-lg mb-2 text-white">Short Bio</h3>
            <textarea
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              rows="4"
              required
              placeholder="Tell us about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            ></textarea>

            <h3 className="text-lg mb-2 text-white ">Preference</h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
            >
              <option value="WorkoutBuddy">Workout Buddy</option>
              <option value="FitnessGroup">Fitness Group</option>
            </select>

            <h3 className="text-lg mb-2 text-white ">Fitness Goals</h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={fitnessGoals}
              onChange={(e) => setFitnessGoals(e.target.value)}
            >
              <option value="WeightLoss">Weight Loss</option>
              <option value="MuscleGain">Muscle Gain</option>
              <option value="Endurance">Endurance</option>
            </select>

            <h3 className="text-lg mb-2 text-white">Workout Preferences</h3>
            {["Gym", "Yoga", "Running", "Zumba"].map((preference) => (
              <label
                key={preference}
                className="flex items-center text-white mb-2"
              >
                <input
                  type="checkbox"
                  name="workoutPreferences"
                  value={preference}
                  className="mr-2"
                  checked={workoutPreferences.includes(preference)}
                  onChange={handleCheckboxChange}
                />
                {preference}
              </label>
            ))}

            <h3 className="text-lg mb-2 text-white ">Days Availability</h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={availableDays}
              onChange={(e) => setAvailableDays(e.target.value)}
            >
              <option value="EveryDay">EveryDay</option>
              <option value="Weekdays">Weekdays</option>
              <option value="Weekends">Weekends</option>
              <option value="MWF">MWF</option>
              <option value="TTS">TTS</option>
            </select>

            <h3 className="text-lg mb-2 text-white ">Time Slot Availability</h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={availableTimeSlot}
              onChange={(e) => setAvailableTimeSlot(e.target.value)}
            >
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
            </select>

            <h3 className="text-lg mb-2 text-white ">Experience Level</h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <label className="text-lg mb-2 text-white ">Allow Chat</label>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={allowChat}
              onChange={(e) => setAllowChat(e.target.value)}
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>

            <button
              className="bg-red-600 text-white font-semibold mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="submit"
            >
              Signup
            </button>
            <p className="text-center text-white">
              Already have an account?{" "}
              <Link to="/userLogin" className="text-blue-400">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
