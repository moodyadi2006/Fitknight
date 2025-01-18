import { useContext, useEffect, useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { FitnessGroupDataContext } from "../context/FitnessGroupContext";

const CreateGroup = () => {
  const [groupName, setGroupName] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupVisibility, setGroupVisibility] = useState("Private");
  const [groupImage, setGroupImage] = useState("");
  const [activityType, setActivityType] = useState([]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [activityGoals, setActivityGoals] = useState("WeightLoss");
  const [availableDays, setAvailableDays] = useState("Weekends");
  const [availableTimeSlot, setAvailableTimeSlot] = useState("Morning");
  const [minExperienceLevel, setMinExperienceLevel] = useState("Beginner");
  const [maxMembers, setMaxMembers] = useState();
  const [currentMembers, setCurrentMembers] = useState();
  const [rules, setRules] = useState([]);

  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setGroup } = useContext(FitnessGroupDataContext);

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
        console.log(response);
        setOrganizer(response.data.data.fullName);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("organizer", organizer);
    formData.append("groupDescription", groupDescription);
    formData.append("activityGoals", activityGoals);
    formData.append("groupVisibility", groupVisibility);
    formData.append("activityType", activityType);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("zipCode", zipCode);
    formData.append("availableDays", availableDays);
    formData.append("availableTimeSlot", availableTimeSlot);
    formData.append("minExperienceLevel", minExperienceLevel);
    formData.append("maxMembers", maxMembers);
    formData.append("currentMembers", currentMembers);

    // Append the profile
    if (groupImage) {
      formData.append("groupImage", groupImage);
    }

    if (rules.length > 0) {
      formData.append("rules", JSON.stringify(rules));
    }

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/groups/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("Group created:", data);
        setGroup(data.data);

        // Navigate to the FitnessGroup page after successful creation
        navigate("/FitnessGroup");
      }

      // Reset form fields
      setGroupName("");
      setGroupDescription("");
      setGroupVisibility("");
      setGroupImage(null);
      setAddress("");
      setCity("");
      setZipCode("");
      setActivityGoals("WeightLoss");
      setActivityType([]);
      setAvailableDays("Weekends");
      setAvailableTimeSlot("Morning");
      setMinExperienceLevel("Beginner");
      setMaxMembers(null);
      setCurrentMembers(null);
      setRules([]);
    } catch (error) {
      if (error.response.status === 409) {
        setError("Group already exists");
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setActivityType([...activityType, value]);
    } else {
      setActivityType(activityType.filter((item) => item !== value));
    }
  };

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
          <form onSubmit={submitHandler}>
            <h3 className="text-lg mb-2 text-white">Group Name</h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="text"
              required
              placeholder="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">
                Group Name already taken
              </p>
            )}

            <h3 className="text-lg mb-2 text-white">Organizer</h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="text"
              value={organizer}
              readOnly
            />

            <h3 className="text-lg mb-2 text-white">Group Visibility</h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={groupVisibility}
              onChange={(e) => setGroupVisibility(e.target.value)}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>

            <h3 className="text-lg mb-2 text-white">Group Description</h3>
            <textarea
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              rows="4"
              required
              placeholder="Write Group Description here"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
            ></textarea>

            <h3 className="text-lg mb-2 text-white">Profile </h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="file"
              onChange={(e) => setGroupImage(e.target.files[0])}
            />

            <h3 className="text-lg mb-2 text-white ">Activity Goals</h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={activityGoals}
              onChange={(e) => setActivityGoals(e.target.value)}
            >
              <option value="WeightLoss">Weight Loss</option>
              <option value="MuscleGain">Muscle Gain</option>
              <option value="Endurance">Endurance</option>
            </select>

            <h3 className="text-lg mb-2 text-white">Activity Type</h3>
            {["Yoga", "Running", "Gym", "Zumba"].map((preference) => (
              <label
                key={preference}
                className="flex items-center text-white mb-2"
              >
                <input
                  type="checkbox"
                  name="activityType"
                  value={preference}
                  className="mr-2"
                  checked={activityType.includes(preference)}
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

            <h3 className="text-lg mb-2 text-white ">
              Minimum Experience Level
            </h3>
            <select
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              value={minExperienceLevel}
              onChange={(e) => setMinExperienceLevel(e.target.value)}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>

            <h3 className="text-lg mb-2 text-white">Maximum Members</h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="text"
              required
              placeholder="Maximum members in Group"
              value={maxMembers}
              onChange={(e) => setMaxMembers(e.target.value)}
            />

            <h3 className="text-lg mb-2 text-white">Address</h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="text"
              required
              placeholder="Place where activity will take place"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <h3 className="text-lg mb-2 text-white">City</h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="text"
              required
              placeholder="City where activity will take place"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />

            <h3 className="text-lg mb-2 text-white">ZipCode</h3>
            <input
              className="bg-gray-200 mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="text"
              required
              placeholder="ZipCode of the place"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
            />

            <button
              className="bg-red-600 text-white font-semibold mb-4 rounded px-4 py-2 w-full text-sm outline-none"
              type="submit"
            >
              Create Group
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
