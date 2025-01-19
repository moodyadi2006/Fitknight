import axios from "axios";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import LoadingPanel from "../Components/LoadingPanel";
import ErrorPanel from "../Components/ErrorPanel";

/**
 * The `Buddy` component allows users to find and filter workout buddies.
 *
 * Features:
 * - Manages user state, including user list, search query, and filter states.
 * - Provides functionality to search for users by username.
 * - Filters users based on location, time availability, day availability, activity goals, and workout preferences.
 * - Handles buddy requests and manages request statuses.
 * - Fetches user and buddy data from an API.
 * - Displays a list of users with their details and allows interactions like sending buddy requests.
 *
 * Dependencies:
 * - Uses React hooks for state management and side effects.
 * - Utilizes `axios` for API calls.
 * - Leverages React Router's `useLocation` for query parameters.
 *
 * UI:
 * - Displays a search bar and filter buttons with visual feedback.
 * - Shows a list of users with profile details and interaction options.
 * - Includes loading and error panels for feedback.
 */

const Buddy = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingState, setLoadingState] = useState({});
  const [loggedInUser, setLoggedInUser] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [originalUsers, setOriginalUsers] = useState([]);
  const [showLocationTick, setShowLocationTick] = useState(false);
  const [showTimeAvailabilityTick, setShowTimeAvailabilityTick] =
    useState(false);
  const [showDayAvailabilityTick, setShowDayAvailabilityTick] = useState(false);
  const [showActivityGoalsTick, setShowActivityGoalsTick] = useState(false);
  const [showActivityTypeTick, setShowActivityTypeTick] = useState(false);

  /**
   * Handles the location click event by fetching the user's current geolocation
   * and processing users based on proximity to the user's location.
   *
   * - Sets the location tick visibility to true.
   * - Checks if the browser supports geolocation.
   * - Uses the geolocation API to get the user's current position.
   * - Iterates over the available users to fetch their address coordinates.
   * - Calculates the distance between the user's location and each user's address.
   * - Filters and updates the state with users located within a 10,000-meter radius.
   * - Logs errors and alerts the user in case of geolocation or processing failures.
   */
  const handleLocationClick = async () => {
    setShowLocationTick(true);
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

          if (!users || !Array.isArray(users) || users.length === 0) {
            console.error("No users found to process.");
            return;
          }

          const responses = await Promise.allSettled(
            users.map(async (user) => {
              if (!user.location) {
                return { status: "rejected", reason: "Missing address" };
              }

              try {
                // Check for access token
                const token = localStorage.getItem("accessToken");
                if (!token) {
                  throw new Error("Authorization token not found.");
                }

                // Get address coordinates
                const addressCoordinatesResponse = await axios.get(
                  `${import.meta.env.VITE_BASE_URL}/users/profile`,
                  {
                    params: { username: user.username },
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                const { ltd, lng } =
                  addressCoordinatesResponse.data.data.location || {};
                if (ltd == null || lng == null) {
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
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );

                const { distance } = calculateDistanceResponse.data.data || {};
                if (typeof distance !== "number") {
                  throw new Error("Invalid distance data received.");
                }

                // Return the group with distance if valid
                return distance < 10000
                  ? { status: "fulfilled", value: { ...user } }
                  : { status: "rejected", reason: "Distance too far" };
              } catch (error) {
                console.error("Error:", error.message || error);
                return { status: "rejected", reason: error.message || error };
              }
            })
          );
          const validUsers = responses
            .filter((response) => response.value.status === "fulfilled")
            .map((response) => response.value.value);

          setUsers(validUsers);

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

  /**
   * Filters users by time availability based on the logged-in user's available time slot.
   * Sets a tick to indicate the filtering process has started.
   * Compares the user's available time slot with each user's time availability
   * and filters out users where the user's time does not match the user's time availability.
   * Updates the list of users to only include those that match the criteria.
   *
   * @returns {Promise<void>}
   * @throws Will log an error message if filtering by time availability fails.
   */

  const handleTimeAvailabilityClick = async () => {
    setShowTimeAvailabilityTick(true);
    try {
      // User's time availability (e.g., Morning, Evening)
      const userTimeAvailability = loggedInUser.availableTimeSlot;

      // Fetch all groups from API or use local groups data
      const allUsers = users;

      // Filter groups where the user's time matches the group's time availability
      const filteredUsers = allUsers.filter((user) =>
        user.availableTimeSlot.includes(userTimeAvailability)
      );

      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error filtering users by time availability:", err.message);
    }
  };

  /**
   * Filters users by day availability based on the logged-in user's available day of the week.
   * Sets a tick to indicate the filtering process has started.
   * Compares the user's available day with each user's day availability
   * and filters out users where the user's day does not match the user's day availability.
   * Updates the list of users to only include those that match the criteria.
   *
   * @returns {Promise<void>}
   * @throws Will log an error message if filtering by day availability fails.
   */
  const handleDayAvailabilityClick = async () => {
    setShowDayAvailabilityTick(true);
    try {
      // User's time availability (e.g., Morning, Evening)
      const userDayAvailability = loggedInUser.availableDays;

      const allUsers = users;

      // Filter groups where the user's time matches the group's time availability
      const filteredUsers = allUsers.filter((user) =>
        user.availableDays.includes(userDayAvailability)
      );

      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error filtering users by day availability:", err.message);
    }
  };

  /**
   * Filters users by fitness goals based on the logged-in user's fitness goals.
   * Sets a tick to indicate the filtering process has started.
   * Compares the user's fitness goals with each user's fitness goals
   * and filters out users where the user's fitness goals do not match the user's fitness goals.
   * Updates the list of users to only include those that match the criteria.
   *
   * @returns {Promise<void>}
   * @throws Will log an error message if filtering by fitness goals fails.
   */
  const handleFitnessGoalsClick = async () => {
    setShowActivityGoalsTick(true);
    try {
      // User's time availability (e.g., Morning, Evening)
      const userFitnessGoals = loggedInUser.fitnessGoals;

      const allUsers = users;

      // Filter groups where the user's time matches the group's time availability
      const filteredUsers = allUsers.filter((user) =>
        user.fitnessGoals.includes(userFitnessGoals)
      );

      setUsers(filteredUsers);
    } catch (err) {
      console.error("Error filtering groups by Fitness Goals:", err.message);
    }
  };

  /**
   * Filters users by workout preferences based on the logged-in user's preferences.
   * Sets a tick to indicate the filtering process has started.
   * Compares the user's workout preferences with each user's preferences
   * and filters out users where there is no match in workout preferences.
   * Updates the list of users to only include those that match the criteria.
   *
   * @returns {Promise<void>}
   * @throws Will log an error message if filtering by workout preferences fails.
   */

  const handleWorkoutPreferencesClick = async () => {
    setShowActivityTypeTick(true);
    try {
      // User's activity preferences (e.g., ["Yoga", "Cycling"])
      const userWorkoutPreferences = loggedInUser.workoutPreferences;

      const allUsers = users;

      // Filter groups where at least one activity type matches
      const filteredUsers = allUsers.filter((user) =>
        user.workoutPreferences.some((activity) =>
          userWorkoutPreferences.includes(activity)
        )
      );

      setUsers(filteredUsers);
    } catch (err) {
      console.error(
        "Error filtering groups by Workout Preferences:",
        err.message
      );
    }
  };

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userUsername = queryParams.get("username");

  /**
   * Handles sending a buddy request from the logged-in user to a target user.
   * Checks if there is already a pending request from the target user to the
   * logged-in user. If so, it updates the loading state to match the current
   * status of the request. If not, it sends a request to the target user and
   * updates the loading state to pending. It then sets up an interval to check
   * the status of the request periodically. If the status is accepted, it
   * updates the loading state and clears the interval. If the status is rejected,
   * it updates the loading state and clears the interval.
   *
   * @param {string} userId - The id of the logged-in user.
   * @param {string} buddyId - The id of the target user.
   * @param {string} status - The status of the request. This can be either
   * "accepted", "pending", or "rejected".
   * @returns {Promise<void>}
   * @throws Will log an error message if sending the request or checking the
   * status fails.
   */
  const makeBuddyHandler = async (userId, buddyId, status) => {
    try {
      const response1 = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/buddies/getRequestUserId`,
        {
          params: {
            userId,
            buddyId,
            status,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      try {
        //Fetch current buddy status
        const response =
          response1.data.data.userId === userId
            ? await axios.get(
                `${
                  import.meta.env.VITE_BASE_URL
                }/buddies/getBuddyStatus?buddyId=${buddyId}&userId=${userId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "accessToken"
                    )}`,
                  },
                }
              )
            : await axios.get(
                `${
                  import.meta.env.VITE_BASE_URL
                }/buddies/getBuddyStatus?buddyId=${userId}&userId=${buddyId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "accessToken"
                    )}`,
                  },
                }
              );

        const requestStatus = response.data?.status;

        if (
          requestStatus === "accepted" ||
          requestStatus === "rejected" ||
          requestStatus === "pending"
        ) {
          setLoadingState((prevState) => ({
            ...prevState,
            [buddyId]: requestStatus,
          }));
        }
      } catch (error) {
        try {
          // Create a new buddy request
          await axios.post(
            `${
              import.meta.env.VITE_BASE_URL
            }/buddies/createBuddy?buddyId=${buddyId}`,
            { userId, status },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }
          );
          alert("Request has been sent");
          setLoadingState((prevState) => ({
            ...prevState,
            [buddyId]: "pending",
          }));

          const intervalId = setInterval(async () => {
            try {
              const statusResponse = await axios.get(
                `${
                  import.meta.env.VITE_BASE_URL
                }/buddies/getBuddyStatus?buddyId=${buddyId}&userId=${userId}`, // Pass userId as a query parameter
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                      "accessToken"
                    )}`,
                  },
                }
              );

              const currentStatus = statusResponse.data?.status;

              if (
                currentStatus === "accepted" ||
                currentStatus === "rejected"
              ) {
                setLoadingState((prevState) => ({
                  ...prevState,
                  [buddyId]: currentStatus,
                }));
                clearInterval(intervalId);
              }
            } catch (err) {
              console.error("Error fetching buddy status:", err);
              clearInterval(intervalId);
            }
          }, 10000);
        } catch (postError) {
          console.error("Error creating buddy request:", postError);
        }
      }
    } catch (error) {
      try {
        // Create a new buddy request
        await axios.post(
          `${
            import.meta.env.VITE_BASE_URL
          }/buddies/createBuddy?buddyId=${buddyId}`,
          { userId, status },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        alert("Request has been sent");
        setLoadingState((prevState) => ({
          ...prevState,
          [buddyId]: "pending",
        }));

        const intervalId = setInterval(async () => {
          try {
            const statusResponse = await axios.get(
              `${
                import.meta.env.VITE_BASE_URL
              }/buddies/getBuddyStatus?buddyId=${buddyId}&userId=${userId}`, // Pass userId as a query parameter
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );

            const currentStatus = statusResponse.data?.status;

            if (currentStatus === "accepted" || currentStatus === "rejected") {
              setLoadingState((prevState) => ({
                ...prevState,
                [buddyId]: currentStatus,
              }));
              clearInterval(intervalId);
            }
          } catch (err) {
            console.error("Error fetching buddy status:", err);
            clearInterval(intervalId);
          }
        }, 10000);
      } catch (postError) {
        console.error("Error creating buddy request:", postError);
      }
    }
  };

  /**
   * Undo a pending buddy request
   * @param {string} userId The ID of the user who sent the request
   * @param {string} buddyId The ID of the buddy to undo the request for
   * @throws {Error} If there is an error with the API request, or if the response is invalid
   */

  const undoRequestHandler = async (userId, buddyId) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/buddies/undoRequest`,
        { userId, buddyId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        // Update the loadingState for buddyId instead of userId
        setLoadingState((prevState) => ({ ...prevState, [buddyId]: "undone" }));
        alert("Request has been undone!");
      } else {
        throw new Error("Failed to undo request");
      }
    } catch (error) {
      console.error("Error undoing request:", error);
      alert("There was an error undoing the request.");
    }
  };

  /**
   * Handles user search input change and filters users based on the search query
   * @param {string} searchQuery The search query entered by the user
   * @throws {Error} If there is an issue with filtering the users
   */

  const handleUserClick = (searchQuery) => {
    const filteredUsers = originalUsers.filter((user) => {
      if (user.username && searchQuery) {
        return user.username.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return false; // Default to false if groupName or searchQuery is missing
    });

    setUsers(filteredUsers);
  };

  useEffect(() => {
    /**
     * Fetches the logged-in user's profile data from the backend
     * @throws {Error} If there is an issue with fetching the user's data
     * @returns {Promise<Object>} The user's profile data
     */
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

    /**
     * Fetches all users' profile data from the backend
     * @throws {Error} If there is an issue with fetching the users' data
     * @returns {Promise<void>} Resolves when the users' data has been fetched or an error has been thrown
     */
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/buddies/getAllUsers`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const fetchedUsers = response.data.data;
        const updatedUsers = fetchedUsers.map((user) => {
          // Set the initial loading state or use the current state
          const userStatus = loadingState[user._id] || "undone"; // Default to 'undone'

          setLoadingState((prevState) => ({
            ...prevState,
            [user._id]: userStatus,
          }));

          return user;
        });
        setUsers(updatedUsers);
        setOriginalUsers(updatedUsers);
      } catch (err) {
        console.error("Error fetching users:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Call the async function
    (async () => {
      const user = await fetchUser();
      if (user) {
        await fetchUsers();
      }
    })();
  }, []);

  useEffect(() => {
    if (originalUsers.length > 0 && userUsername) {
      handleUserClick(userUsername); // Filter groups using groupName once originalGroups is set
    }
  }, [originalUsers, userUsername]); // Trigger effect when originalGroups or groupName change

  /**
   * Resets the groups to the original array or any predefined state, clears the search input and resets all filters.
   * This is called when the user clicks the clear button in the search bar.
   */
  const handleClearSearch = () => {
    setUsers(originalUsers); // Set the filtered groups to the original groups
    setSearchQuery(""); // Clear the search input

    resetAllFilters();
  };

  /**
   * Resets all filters to their original state.
   * Called when the user clicks the clear button in the search bar.
   */
  const resetAllFilters = () => {
    setShowActivityGoalsTick(false);
    setShowActivityTypeTick(false);
    setShowDayAvailabilityTick(false);
    setShowTimeAvailabilityTick(false);
    setShowLocationTick(false);
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
        <div className="relative w-full mx-auto">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a Workout Buddy with username"
              className="py-3 pl-4 pr-12 rounded-lg w-full outline-none shadow-md text-gray-700 focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <FaSearch
              onClick={() => handleUserClick(searchQuery)} // Trigger group search
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl cursor-pointer hover:text-purple-500 transition-colors"
            />
            <button
              onClick={handleClearSearch} // Clear Button
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl cursor-pointer hover:text-red-500 transition-colors"
            >
              ✖
            </button>
          </div>

          {/* No Users Found Message */}
          {searchQuery &&
            users.filter((user) =>
              user.username.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div className="mt-3 flex justify-center bg-white border border-gray-200 rounded-lg shadow-lg w-1/2 mx-auto">
                <h2 className="text-sm font-bold text-gray-500 p-4 text-center">
                  No Users Found
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
              {showLocationTick && (
                <span className="text-green-500 text-md pl-1">✔️</span>
              )}
            </button>
            <button
              onClick={handleTimeAvailabilityClick}
              className="px-4 py-2 bg-white text-indigo-600 font-semibold rounded-full shadow-md hover:bg-indigo-100 transition-all"
            >
              ⏰ Time Availability
              {showTimeAvailabilityTick && (
                <span className="text-green-500 text-md pl-1">✔️</span>
              )}
            </button>
            <button
              onClick={handleDayAvailabilityClick}
              className="px-4 py-2 bg-white text-teal-600 font-semibold rounded-full shadow-md hover:bg-teal-100 transition-all"
            >
              📅 Day Availability
              {showDayAvailabilityTick && (
                <span className="text-green-500 text-md pl-1">✔️</span>
              )}
            </button>
            <button
              onClick={handleWorkoutPreferencesClick}
              className="px-4 py-2 bg-white text-pink-600 font-semibold rounded-full shadow-md hover:bg-pink-100 transition-all"
            >
              🏃‍♂️ Activity Type
              {showActivityTypeTick && (
                <span className="text-green-500 text-md pl-1">✔️</span>
              )}
            </button>
            <button
              onClick={handleFitnessGoalsClick}
              className="px-4 py-2 bg-white text-orange-600 font-semibold rounded-full shadow-md hover:bg-orange-100 transition-all"
            >
              🎯 Activity Goals
              {showActivityGoalsTick && (
                <span className="text-green-500 text-md pl-1 ">✔️</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">Make a Buddy</h1>
        <div className="space-y-4">
          {users.length > 0 ? (
            users
              .filter((user) => user.preference.includes("WorkoutBuddy"))
              .map((user) => (
                <div
                  key={user._id}
                  className="items-center my-4 p-4 border-2 rounded-xl gap-4 bg-white bg-opacity-80 shadow-md hover:shadow-lg transition-shadow ease-in-out duration-300 transform hover:scale-105 mx-2 justify-start"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={user.profile}
                      alt={user.fullName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="ml-4 w-full flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-xl text-gray-800">
                          {user.fullName || "Unnamed User"}
                        </h4>
                        <p className="text-lg font-extrabold text-purple-500 mt-1">
                          {user.username || "No username available."}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {user.bio || "No bio available."}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Main Focus:{" "}
                          <span className="font-medium">
                            {user.fitnessGoals || "No Fitness Goals available."}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Workout Preferences:
                        </p>
                        <ul className="list-disc pl-5">
                          {user.workoutPreferences.map((activity, index) => (
                            <li key={index} className="text-sm text-gray-600">
                              {activity}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mt-1">
                          Available Days:{" "}
                          <span className="font-medium">
                            {user.availableDays || "No available Days."}
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Available TimeSlot:{" "}
                          <span className="font-medium">
                            {user.availableTimeSlot ||
                              "No available time Slot."}
                          </span>
                        </p>
                        {user.allowChat === "true" && (
                          <div className="mt-1">
                            <p className="text-sm text-gray-600">
                              Phone Number:{" +"}
                              <span className="font-medium">
                                {user.phoneNumber || "Not provided"}
                              </span>
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              Email:{" "}
                              <span className="font-medium">
                                {user.email || "Not provided"}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {loggedInUser._id !== user._id && (
                    <div className="mt-4">
                      {/* Undo Request button */}
                      {user && loadingState[user._id] === "pending" && (
                        <button
                          onClick={() =>
                            undoRequestHandler(loggedInUser._id, user._id)
                          }
                          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                        >
                          Undo Request
                        </button>
                      )}

                      {/* Send Request button */}
                      {user &&
                        loadingState[user._id] !== "accepted" &&
                        loadingState[user._id] !== "pending" &&
                        (loadingState[user._id] === "undone" ||
                          loadingState[user._id] === "rejected") && (
                          <button
                            onClick={() =>
                              makeBuddyHandler(
                                loggedInUser._id,
                                user._id,
                                loadingState[user._id] === "undone"
                                  ? "pending"
                                  : ""
                              )
                            }
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                          >
                            Send Request
                          </button>
                        )}

                      {/* Messages for accepted or rejected requests */}
                      {loadingState[user._id] === "accepted" && (
                        <div className="flex items-center gap-2 text-green-600">
                          <span>✅</span>
                          <p>You are now Buddies!</p>
                        </div>
                      )}
                      {loadingState[user._id] === "rejected" && (
                        <div className="flex items-center gap-2 text-red-600">
                          <span>❌</span>
                          <p>Your request was rejected.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
          ) : (
            <p>No Users available to make Buddies.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Buddy;
