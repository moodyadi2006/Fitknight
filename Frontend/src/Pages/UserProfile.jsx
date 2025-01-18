import axios from "axios";
import { useState, useEffect } from "react";
import {
  FaEnvelope,
  FaUser,
  FaLock,
  FaGenderless,
  FaPhoneAlt,
  FaHeart,
} from "react-icons/fa";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { IoIosFitness, IoIosTime } from "react-icons/io";

import { LuCalendarDays, LuGraduationCap } from "react-icons/lu";
import { TiTick } from "react-icons/ti";

const UserProfile = () => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [showButton, setShowButton] = useState(false);

  // Handle input change for editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleCheckboxChange = (preference) => {
    setSelectedPreferences((prevPreferences) => {
      if (prevPreferences.includes(preference)) {
        return prevPreferences.filter((item) => item !== preference); // Remove the preference from the array
      } else {
        // If the preference is not in the array, add it
        return [...prevPreferences, preference]; // Add the preference to the array
      }
    });
  };

  const handleImageClick = () => {
    setShowButton(true);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // Get the selected file

    if (!file) {
      console.error("No file selected!");
      return;
    }
    console.log(file);

    const formData = new FormData();
    formData.append("profile", file);

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/users/updateProfile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        window.location.reload();
      } else {
        console.error("Profile update failed!");
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  // Handle update request
  const handleUpdate = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }

    try {
      const allowedFields = {
        fullName: user.fullName,
        gender: user.gender,
        bio: user.bio,
        phoneNumber: user.phoneNumber,
        availableDays: user.availableDays,
        availableTimeSlot: user.availableTimeSlot,
        fitnessGoals: user.fitnessGoals,
        workoutPreferences: selectedPreferences,
        experienceLevel: user.experienceLevel,
        allowChat: user.allowChat,
        preference: user.preference,
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/users/updateAccountDetails`,
        allowedFields,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to update user data");
      }

      setUser(response.data.data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch user data from the backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error("Failed to fetch user data");
        }
        setUser(response.data.data);
        setSelectedPreferences(response.data.data.workoutPreferences);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Error: {error}</p>;
  }

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

      <div className="relative rounded-lg shadow-lg p-8 max-w-lg w-full m-5 bg-gray-500 z-10 hover:bg-black transition-all duration-2000">
        {user && (
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div>
                <img
                  src={user.profile}
                  alt="Profile"
                  className="w-32 h-32 rounded-full shadow-md cursor-pointer"
                  onClick={handleImageClick}
                />

                {showButton && (
                  <div>
                    <label
                      htmlFor="fileInput"
                      className="mt-2 text-blue-500 cursor-pointer"
                    >
                      Change Profile
                    </label>
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {editMode ? (
                <input
                  type="text"
                  name="fullName"
                  value={user.fullName}
                  onChange={handleInputChange}
                  className="bg-gray-200 text-black p-1 rounded"
                />
              ) : (
                user.fullName
              )}
            </h1>

            <p className="text-blue-500">
              {editMode ? (
                <textarea
                  name="bio"
                  value={user.bio}
                  onChange={handleInputChange}
                  className="bg-gray-200 text-black p-1 rounded w-full"
                />
              ) : (
                user.bio || "No bio available"
              )}
            </p>

            <div className="space-y-4 text-left">
              <p className="flex items-center text-white">
                <FaUser className="mr-2 text-blue-500" />
                <strong>Username: </strong>
                <span className="ml-2">{user.username}</span>
              </p>
              <p className="flex items-center text-white">
                <FaEnvelope className="mr-2 text-blue-500" />
                <strong>Email: </strong>
                <span className="ml-2">{user.email}</span>
              </p>
              <p className="flex items-center text-white">
                <FaLock className="mr-2 text-blue-500" />
                <strong>Password: </strong>
                <span className="ml-2">********</span>
              </p>

              <p className="flex items-center text-white">
                <FaHeart className="mr-2 text-blue-500" />
                <strong>Preference: </strong>
                <span className="ml-2">
                  {editMode ? (
                    <select
                      name="preference"
                      value={user.preference}
                      onChange={handleInputChange}
                      className="bg-gray-200 text-black p-1 rounded"
                    >
                      <option value="WorkoutBuddy">Workout Buddy</option>
                      <option value="FitnessGroup">Fitness Group</option>
                    </select>
                  ) : (
                    user.preference
                  )}
                </span>
              </p>

              <p className="flex items-center text-white">
                <FaGenderless className="mr-2 text-blue-500" />
                <strong>Gender: </strong>
                <span className="ml-2">
                  {editMode ? (
                    <select
                      name="gender"
                      value={user.gender}
                      onChange={handleInputChange}
                      className="bg-gray-200 text-black p-1 rounded"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : (
                    user.gender
                  )}
                </span>
              </p>

              <p className="flex items-center text-white">
                <FaPhoneAlt className="mr-2 text-blue-500" />
                <strong>Phone Number: </strong>
                <span className="ml-2">
                  {editMode ? (
                    <PhoneInput
                      country={"in"}
                      value={user.phoneNumber}
                      onChange={(phone) =>
                        handleInputChange({
                          target: { name: "phoneNumber", value: phone },
                        })
                      }
                      inputClass="bg-gray-200 text-black p-1 rounded"
                    />
                  ) : (
                    `+${user.phoneNumber}`
                  )}
                </span>
              </p>

              <p className="flex items-center text-white">
                <LuGraduationCap className="mr-2 text-blue-500" />
                <strong>Experience Level: </strong>
                <span className="ml-2">
                  {editMode ? (
                    <select
                      name="experienceLevel"
                      value={user.experienceLevel}
                      onChange={handleInputChange}
                      className="bg-gray-200 text-black p-1 rounded"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  ) : (
                    user.experienceLevel
                  )}
                </span>
              </p>

              <p className="flex items-center text-white">
                <LuGraduationCap className="mr-2 text-blue-500" />
                <strong>Workout Preferences: </strong>
                <span className="ml-2">
                  {editMode
                    ? ["Gym", "Yoga", "Running", "Zumba"].map((preference) => (
                        <label
                          key={preference}
                          className="flex items-center text-white mb-2"
                        >
                          <input
                            type="checkbox"
                            name="workoutPreferences"
                            value={preference}
                            className="mr-2"
                            checked={selectedPreferences.includes(preference)} // Check if the preference is selected
                            onChange={() => handleCheckboxChange(preference)} // Handle checkbox change
                          />
                          {preference}
                        </label>
                      ))
                    : user.workoutPreferences.join(", ")}{" "}
                  {/* Join the preferences with a comma */}
                </span>
              </p>

              <p className="flex items-center text-white">
                <IoIosFitness className="mr-2 text-blue-500" />
                <strong>Fitness Goals: </strong>
                <span className="ml-2">
                  {editMode ? (
                    <select
                      name="fitnessGoals"
                      value={user.fitnessGoals}
                      onChange={handleInputChange}
                      className="bg-gray-200 text-black p-1 rounded"
                    >
                      <option value="WeightLoss">Weight Loss</option>
                      <option value="MuscleGain">Muscle gain</option>
                      <option value="Endurance">Endurance</option>
                    </select>
                  ) : (
                    user.fitnessGoals
                  )}
                </span>
              </p>

              <p className="flex items-center text-white">
                <LuCalendarDays className="mr-2 text-blue-500" />
                <strong>Days Availability: </strong>
                <span className="ml-2">
                  {editMode ? (
                    <select
                      name="availableDays"
                      value={user.availableDays}
                      onChange={handleInputChange}
                      className="bg-gray-200 text-black p-1 rounded"
                    >
                      <option value="Weekdays">Weekdays</option>
                      <option value="EveryDay">EveryDay</option>
                      <option value="Weekends">Weekends</option>
                      <option value="MWF">MWF</option>
                      <option value="TTS">TTS</option>
                    </select>
                  ) : (
                    user.availableDays
                  )}
                </span>
              </p>

              <p className="flex items-center text-white">
                <IoIosTime className="mr-2 text-blue-500" />
                <strong>Time Slot Availability: </strong>
                <span className="ml-2">
                  {editMode ? (
                    <select
                      name="availableTimeSlot"
                      value={user.availableTimeSlot}
                      onChange={handleInputChange}
                      className="bg-gray-200 text-black p-1 rounded"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Evening">Evening</option>
                    </select>
                  ) : (
                    user.availableTimeSlot
                  )}
                </span>
              </p>

              <p className="flex items-center text-white">
                <TiTick className="mr-2 text-blue-500" />
                <strong>Allow Chat: </strong>
                <span className="ml-2">
                  {editMode ? (
                    <input
                      type="text"
                      name="allowChat"
                      value={user.allowChat}
                      onChange={handleInputChange}
                      className="bg-gray-200 text-black p-1 rounded"
                    />
                  ) : (
                    user.allowChat
                  )}
                </span>
              </p>
            </div>

            <button
              onClick={handleUpdate}
              className="button-view bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
            >
              {editMode ? "Save Changes" : "Edit Profile"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
