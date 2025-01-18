import axios from "axios";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import LoadingPanel from "../Components/LoadingPanel";
import ErrorPanel from "../Components/ErrorPanel";

const JoinGroup = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingState, setLoadingState] = useState({});
  const [loggedInUser, setLoggedInUser] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [originalGroups, setOriginalGroups] = useState([]);

  const handleLocationClick = async () => {
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        alert("Your browser does not support location services.");
        return;
      }

      // Get user's current location
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Ensure `groups` is available
          if (!groups || !Array.isArray(groups) || groups.length === 0) {
            console.error("No groups found to process.");
            return;
          }

          // Process each group to fetch distance and filter based on criteria
          const responses = await Promise.allSettled(
            groups.map(async (group) => {
              if (!group.address) {
                console.error(
                  `Invalid group: Missing address in group ${group._id}`
                );
                return { status: "rejected", reason: "Missing address" };
              }

              try {
                // Get address coordinates
                const addressCoordinatesResponse = await axios.get(
                  `${import.meta.env.VITE_BASE_URL}/maps/getAddressCoordinates`,
                  {
                    params: { address: group.address },
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                      )}`,
                    },
                  }
                );

                const { ltd, lng } = addressCoordinatesResponse.data;
                if (!ltd || !lng) {
                  throw new Error("Invalid coordinates received from backend.");
                }

                // Calculate distance
                const calculateDistanceResponse = await axios.post(
                  `${import.meta.env.VITE_BASE_URL}/maps/calculateDistance`,
                  {
                    lat1: latitude,
                    lng1: longitude,
                    lat2: ltd,
                    lng2: lng,
                  },
                  {
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem(
                        "accessToken"
                      )}`,
                    },
                  }
                );

                const { distance } = calculateDistanceResponse.data.data;
                if (typeof distance !== "number") {
                  throw new Error("Invalid distance data received.");
                }

                // Return the group with distance if valid
                return distance < 10000
                  ? { status: "fulfilled", value: { ...group } }
                  : { status: "rejected", reason: "Distance too far" };
              } catch (error) {
                return { status: "rejected", reason: error.message || error };
              }
            })
          );

          // Filter valid responses and update state
          const validGroups = responses
            .filter((response) => response.value.status === "fulfilled")
            .map((response) => response.value.value);

          setGroups(validGroups);

          // Log rejected responses for debugging
          responses.filter((response) => response.value.status === "rejected");
        },
        (error) => {
          console.error("Error getting location:", error.message);
          alert(
            "Unable to fetch location. Please enable location services and try again."
          );
        }
      );
    } catch (error) {
      console.error("Unexpected error:", error.message || error);
      alert("Something went wrong. Please try again later.");
    }
  };

  const handleExperienceLevelClick = async () => {
    try {
      const userExperienceLevel = loggedInUser.experienceLevel;

      // Define experience levels hierarchy for comparison
      const experienceHierarchy = {
        Beginner: 1,
        Intermediate: 2,
        Advanced: 3,
      };

      // Fetch all groups from API (assuming an endpoint `/api/groups`)
      const allGroups = groups;

      // Filter groups where user's experience level meets or exceeds group's minExperienceLevel
      const filteredGroups = allGroups.filter((group) => {
        const groupMinLevel = experienceHierarchy[group.minExperienceLevel];
        const userLevel = experienceHierarchy[userExperienceLevel];
        return userLevel >= groupMinLevel;
      });

      setGroups(filteredGroups);
    } catch (err) {
      console.error("Error fetching groups:", err.message);
    }
  };

  const handleTimeAvailabilityClick = async () => {
    try {
      // User's time availability (e.g., Morning, Evening)
      const userTimeAvailability = loggedInUser.availableTimeSlot;

      // Fetch all groups from API or use local groups data
      const allGroups = groups;

      // Filter groups where the user's time matches the group's time availability
      const filteredGroups = allGroups.filter((group) =>
        group.availableTimeSlot.includes(userTimeAvailability)
      );

      setGroups(filteredGroups);
    } catch (err) {
      console.error(
        "Error filtering groups by time availability:",
        err.message
      );
    }
  };

  const handleDayAvailabilityClick = async () => {
    try {
      // User's time availability (e.g., Morning, Evening)
      const userDayAvailability = loggedInUser.availableDays;

      const allGroups = groups;

      // Filter groups where the user's time matches the group's time availability
      const filteredGroups = allGroups.filter((group) =>
        group.availableDays.includes(userDayAvailability)
      );

      setGroups(filteredGroups);
    } catch (err) {
      console.error(
        "Error filtering groups by time availability:",
        err.message
      );
    }
  };

  const handleActivityGoalsClick = async () => {
    try {
      // User's time availability (e.g., Morning, Evening)
      const userActivityGoals = loggedInUser.fitnessGoals;

      const allGroups = groups;

      // Filter groups where the user's time matches the group's time availability
      const filteredGroups = allGroups.filter((group) =>
        group.activityGoals.includes(userActivityGoals)
      );

      setGroups(filteredGroups);
    } catch (err) {
      console.error(
        "Error filtering groups by time availability:",
        err.message
      );
    }
  };

  const handleActivityTypeClick = async () => {
    try {
      // User's activity preferences (e.g., ["Yoga", "Cycling"])
      const userActivityTypes = loggedInUser.workoutPreferences;

      const allGroups = groups;

      // Filter groups where at least one activity type matches
      const filteredGroups = allGroups.filter((group) =>
        group.activityType.some((activity) =>
          userActivityTypes.includes(activity)
        )
      );

      setGroups(filteredGroups);
    } catch (err) {
      console.error("Error filtering groups by activity type:", err.message);
    }
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const groupName = queryParams.get("groupName");

  const joinGroupHandler = async (groupId, organizerId, status, userId) => {
    try {
      const getUserStatus = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/groups/getUserStatus?groupId=${groupId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const requestStatus = getUserStatus.data?.data;
      if (requestStatus === "accepted") {
        setLoadingState((prevState) => ({
          ...prevState,
          [groupId]: "accepted",
        }));
      } else if (requestStatus === "rejected") {
        setLoadingState((prevState) => ({
          ...prevState,
          [groupId]: "rejected",
        }));
      } else if (requestStatus === "pending") {
        setLoadingState((prevState) => ({
          ...prevState,
          [groupId]: "pending",
        }));
        console.log(loadingState[groupId]);

        // Set up interval to check status periodically
        const intervalId = setInterval(async () => {
          const statusCheck = await axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/groups/getUserStatus?groupId=${groupId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          const currentStatus = statusCheck.data?.data;

          if (currentStatus === "accepted") {
            setLoadingState((prevState) => ({
              ...prevState,
              [groupId]: currentStatus,
            }));
            await axios.post(
              `${import.meta.env.VITE_BASE_URL}/groups/updateMembersCount`,
              { groupId },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            await axios.post(
              `${import.meta.env.VITE_BASE_URL}/groups/updateMembers`,
              { groupId, userId },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            clearInterval(intervalId); // Stop the interval once the status is accepted or rejected
          } else if (currentStatus === "rejected") {
            setLoadingState((prevState) => ({
              ...prevState,
              [groupId]: currentStatus,
            }));
            clearInterval(intervalId);
          }
        }, 1000); // Check status every second

        alert("Request has been sent");
      }
    } catch (error) {
      console.log(error);
      // Update loading state to pending before sending the request
      setLoadingState((prevState) => ({
        ...prevState,
        [groupId]: "pending",
      }));

      // Make the post request
      try {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/groups/sendRequest`,
          { groupId, organizerId, status },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const intervalId = setInterval(async () => {
          const statusCheck = await axios.get(
            `${
              import.meta.env.VITE_BASE_URL
            }/groups/getUserStatus?groupId=${groupId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          const currentStatus = statusCheck.data?.data;

          if (currentStatus === "accepted") {
            setLoadingState((prevState) => ({
              ...prevState,
              [groupId]: currentStatus,
            }));
            await axios.post(
              `${import.meta.env.VITE_BASE_URL}/groups/updateMembersCount`,
              { groupId },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            await axios.post(
              `${import.meta.env.VITE_BASE_URL}/groups/updateMembers`,
              { groupId, userId },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            clearInterval(intervalId); // Stop the interval once the status is accepted or rejected
          } else if (currentStatus === "rejected") {
            setLoadingState((prevState) => ({
              ...prevState,
              [groupId]: currentStatus,
            }));
            clearInterval(intervalId);
          }
        }, 10000); // Check status every second
        alert("Request has been sent");
      } catch (postError) {
        console.error("Error sending request:", postError);
        alert("There was an error sending the request.");
      }
    }
  };

  const undoRequestHandler = async (groupId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/groups/undoRequest`,
        { groupId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        setLoadingState((prevState) => ({ ...prevState, [groupId]: "undone" }));
        alert("Request has been undone!");
      } else {
        throw new Error("Failed to undo request");
      }
    } catch (error) {
      console.error("Error undoing request:", error);
      alert("There was an error undoing the request.");
    }
  };

  const handleGroupClick = (searchQuery) => {
    const filteredGroups = originalGroups.filter((group) => {
      if (group.groupName && searchQuery) {
        return group.groupName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }
      return false; // Default to false if groupName or searchQuery is missing
    });

    setGroups(filteredGroups);
  };

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
        setLoggedInUser(data.data);
        return data.data;
      } catch (error) {
        console.error("Error fetching user", error);
      }
    };

    const fetchGroups = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/groups/getAllGroups`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const fetchedGroups = response.data;

        const updatedGroups = fetchedGroups.map((group) => {
          // Set the initial loading state or use the current state
          const groupStatus = loadingState[group._id] || "undone"; // Default to 'undone'

          setLoadingState((prevState) => ({
            ...prevState,
            [group._id]: groupStatus,
          }));

          return group; // Return the group with the loading state
        });

        setGroups(updatedGroups); // Set updated groups
        setOriginalGroups(updatedGroups); // Set original groups
      } catch (err) {
        console.error("Error fetching groups:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the async function
    (async () => {
      const user = await fetchUser();
      if (user) {
        await fetchGroups();
      }
    })();
  }, []);

  useEffect(() => {
    if (originalGroups.length > 0 && groupName) {
      handleGroupClick(groupName); // Filter groups using groupName once originalGroups is set
    }
  }, [originalGroups, groupName]); // Trigger effect when originalGroups or groupName change

  const handleClearSearch = () => {
    // Reset groups to the original array or any predefined state
    setGroups(originalGroups); // Assuming you have stored the original groups in `originalGroups` state
    setSearchQuery(""); // Clear the search input
  };

  if (loading) {
    return (
      <div>
        <LoadingPanel />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <ErrorPanel message={error} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-r from-purple-500 to-indigo-600">
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover opacity-60"
      >
        <source
          src="https://videos.pexels.com/video-files/5485148/5485148-sd_640_360_25fps.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      <div className="w-full p-4 flex flex-col items-center relative">
        <div className="w-full relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find a Fitness Group with group name"
            className="py-2 pl-4 pr-10 rounded-lg h-[50px] w-full outline-none shadow-md text-gray-700"
          />
          <FaSearch
            onClick={() => handleGroupClick(searchQuery)} // Trigger group search
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl cursor-pointer hover:text-red-500"
          />
          {/* Clear Button */}
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl cursor-pointer hover:text-red-500"
          >
            ✖
          </button>
          {searchQuery &&
            groups.filter((group) =>
              group.groupName.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && ( // Show "No groups found" when no matches
              <div className="relative top-full mt-2 w-1/2 bg-white border rounded-lg shadow-lg z-10">
                <h2 className="text-sm font-bold text-gray-500 mb-3 px-4 pt-4">
                  No groups found
                </h2>
              </div>
            )}
        </div>
        <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-lg shadow-lg mt-3">
          <span className="text-white text-lg font-bold tracking-wide">
            🎯 Apply Filters
          </span>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleLocationClick}
              className="px-4 py-2 bg-white text-blue-600 font-semibold rounded-full shadow-md hover:bg-blue-100 transition-all"
            >
              📍 Location
            </button>
            <button
              onClick={handleExperienceLevelClick}
              className="px-4 py-2 bg-white text-purple-600 font-semibold rounded-full shadow-md hover:bg-purple-100 transition-all"
            >
              🌟 Experience Level
            </button>
            <button
              onClick={handleTimeAvailabilityClick}
              className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-full shadow-md hover:bg-indigo-100 transition-all"
            >
              ⏰ Time Availability
            </button>
            <button
              onClick={handleDayAvailabilityClick}
              className="px-4 py-2 bg-white text-teal-600 font-semibold rounded-full shadow-md hover:bg-teal-100 transition-all"
            >
              📅 Day Availability
            </button>
            <button
              onClick={handleActivityTypeClick}
              className="px-4 py-2 bg-white text-pink-600 font-semibold rounded-full shadow-md hover:bg-pink-100 transition-all"
            >
              🏃‍♂️ Activity Type
            </button>
            <button
              onClick={handleActivityGoalsClick}
              className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-full shadow-md hover:bg-orange-100 transition-all"
            >
              🎯 Activity Goals
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Join a Group</h1>
        <div className="space-y-4">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div
                key={group._id}
                className="items-center my-4 p-4 border-2 rounded-xl gap-4 bg-white bg-opacity-80 shadow-md hover:shadow-lg transition-shadow ease-in-out duration-300 transform hover:scale-105 mx-2 justify-start"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={group.groupImage}
                    alt={group.groupName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4 w-full flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-xl text-gray-800">
                        {group.groupName || "Unnamed Group"}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {group.groupDescription || "No description available."}
                      </p>
                      <p className="text-lg text-violet-500 mt-2">
                        Organizer:{" "}
                        <span className="font-medium">
                          {group.organizer?.fullName || "Unknown"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Main Focus:{" "}
                        <span className="font-medium">
                          {group.activityGoals ||
                            "No Activity Goals available."}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Activity Type:
                      </p>
                      <ul className="list-disc pl-5">
                        {group.activityType.map((activity, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {activity}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-gray-600 mt-1">
                        Minimum Experience Level:{" "}
                        <span className="font-medium">
                          {group.minExperienceLevel || "No minimum Experience"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Available Days:{" "}
                        <span className="font-medium">
                          {group.availableDays || "No available Days."}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Available TimeSlot:{" "}
                        <span className="font-medium">
                          {group.availableTimeSlot || "No available time Slot."}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600 mt-1">
                        Address:{" "}
                        <span className="font-medium">
                          {group.address || "No Address available."}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        City:{" "}
                        <span className="font-medium">
                          {group.city || "Not Specified"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Zip Code:{" "}
                        <span className="font-medium">
                          {group.zipCode || "Not Specified"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Current Members:{" "}
                        <span className="font-medium">
                          {group.currentMembersCount}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Maximum Members:{" "}
                        <span className="font-medium">{group.maxMembers}</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        CreatedAt:{" "}
                        <span className="font-medium">
                          {group.createdAt
                            ? new Date(group.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        UpdatedAt:{" "}
                        <span className="font-medium">
                          {group.updatedAt
                            ? new Date(group.updatedAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                {loggedInUser._id !== group.organizer._id && (
                  <div className="mt-4">
                    {/* Undo Request button */}
                    {group && loadingState[group._id] === "pending" && (
                      <button
                        onClick={() => undoRequestHandler(group._id)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                      >
                        Undo Request
                      </button>
                    )}
                    {/* Send Request button */}
                    {group &&
                      loadingState[group._id] !== "accepted" &&
                      loadingState[group._id] !== "pending" &&
                      (loadingState[group._id] === "undone" ||
                        loadingState[group._id] === "rejected") && (
                        <button
                          onClick={() =>
                            joinGroupHandler(
                              group._id,
                              group.organizer._id,
                              loadingState[group._id] === "undone"
                                ? "pending"
                                : "",
                              loggedInUser._id
                            )
                          }
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Send Request
                        </button>
                      )}
                    {/* Messages for accepted or rejected requests */}
                    {loadingState[group._id] === "accepted" && (
                      <div className="flex items-center gap-2 text-green-600">
                        <span>✅</span>
                        <p>You are now a Member!</p>
                      </div>
                    )}
                    {loadingState[group._id] === "rejected" && (
                      <div className="flex items-center gap-2 text-red-600">
                        <span>❌</span>
                        <p>Organizer rejected your invite.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No groups available to join.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinGroup;
