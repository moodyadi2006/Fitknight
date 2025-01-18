import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyBuddies = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [profile, setProfile] = useState();
  const [username, setUsername] = useState();
  const [fullName, setFullName] = useState();
  const [buddies, setBuddies] = useState([]);
  const [requestCount, setRequestCount] = useState(0);

  const handleApprove = async (requestId) => {
    setRequestCount(0);
    try {
      // Ensure token exists
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Authorization token not found in localStorage.");
      }
      // Approve the user
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/buddies/approveRequest/${requestId}`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch the approved user's profile
      const response2 = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/users/getAnyProfile/${
          response.data.userId
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure response2.data.data exists and is valid
      if (!response2.data || !response2.data.data) {
        throw new Error("Invalid response from getAnyProfile API.");
      }

      setBuddies((prevBuddies) => [...prevBuddies, response2.data.data]);

      // Remove the approved request from pending requests
      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Error approving request:", error.message || error);
    }
  };

  useEffect(() => {
    const fetchUserAndBuddies = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Authorization token not found in localStorage.");
        }

        // Fetch the logged-in user's profile
        const userResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!userResponse || !userResponse.data || !userResponse.data.data) {
          throw new Error("Invalid response from profile API.");
        }

        const user = userResponse.data.data;
        setLoggedInUser(user);

        // Fetch all approved buddies once the user is set
        const buddiesResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/buddies/getApprovedBuddies`,
          {
            params: {
              userId: user._id, // Use the fetched user's ID
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profiles = [];
        const uniqueProfileIds = new Set();

        for (const buddy of buddiesResponse.data) {
          let profileId;
          if (buddy.userId === user._id) {
            profileId = buddy.buddyId;
          } else {
            profileId = buddy.userId;
          }

          // Avoid duplicate profile requests
          if (uniqueProfileIds.has(profileId)) {
            continue;
          }

          // Fetch profile details
          const profileResponse = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/users/getAnyProfile/${profileId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (
            !profileResponse ||
            !profileResponse.data ||
            !profileResponse.data.data
          ) {
            throw new Error(`Invalid response for profile ID: ${profileId}`);
          }

          // Add profile data to the array and mark it as fetched
          profiles.push(profileResponse.data.data);
          uniqueProfileIds.add(profileId);
        }

        // Update state with unique profiles
        setBuddies(profiles);
      } catch (error) {
        console.error(
          "Error fetching user or buddies:",
          error.message || error
        );
      }
    };

    fetchUserAndBuddies();
  }, []);

  const handleReject = async (requestId) => {
    setRequestCount(0);
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/buddies/rejectRequest/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const fetchUserProfile = async (id) => {
    try {
      // Ensure token exists
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Authorization token not found.");
      }

      // Make the API request to fetch user profile
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/users/getAnyProfile/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if response and response.data.data are valid
      if (response && response.data && response.data.data) {
        const { fullName, profile, username } = response.data.data;

        // Set state only if values exist
        if (fullName) setFullName(fullName);
        if (profile) setProfile(profile);
        if (username) setUsername(username);
      } else {
        console.error("Invalid response data:", response);
      }
    } catch (error) {
      console.error("Error fetching user details:", error.message || error);
    }
  };

  const pendingRequestHandler = async () => {
    setModalVisible(true);
   
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/buddies/getPendingRequests`,
        {
          params: {
            userId: loggedInUser._id,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Ensure response.data is an array, then accumulate the requests
      response.data.forEach((buddy) => {
        fetchUserProfile(buddy.userId);
        setPendingRequests((prevRequests) => [...prevRequests, buddy]);
      });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/buddies/getPendingRequests`,
          {
            params: {
              userId: loggedInUser._id,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        console.log(response); // Debugging the response

        // Assuming the pending requests are in response.data.pendingRequests
        const pendingRequests = response.data.length || [];
        setRequestCount(pendingRequests); // Update the count directly
      } catch (error) {
        console.error("Error fetching pending requests:", error);
      }
    };

    fetchPendingRequests();

    // Poll every 10 seconds to check for new requests
    const interval = setInterval(fetchPendingRequests, 60000);
    return () => clearInterval(interval); // Clean up the interval on unmount
  }, [loggedInUser._id]); // Remove `pendingRequests` dependency

  const closeModal = () => {
    setModalVisible(false);
    setPendingRequests([]);
  };

  const navigate = useNavigate();

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
      <div className="relative z-10 p-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">My Buddies</h1>
        </div>

        <div>
          <button
            onClick={pendingRequestHandler}
            className="px-4 py-2 text-xl bg-blue-600 text-white rounded-xl border-none outline-none flex items-center space-x-2"
          >
            <span>Pending Requests</span>
            {requestCount > 0 && (
              <span className="bg-red-500 text-white text-sm rounded-full w-5 h-5 flex items-center justify-center">
                {requestCount}
              </span>
            )}
          </button>

          {modalVisible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full">
                <h2 className="text-xl font-semibold mb-4">Pending Requests</h2>
                <div className="overflow-y-auto max-h-60">
                  {pendingRequests && pendingRequests.length > 0 ? (
                    pendingRequests.map((request, index) => (
                      <div
                        key={index}
                        className="p-2 border-b border-gray-200 flex justify-between items-center"
                      >
                        <div className="flex items-center justify-between w-1/2">
                          <img
                            src={profile} // Use the correct path based on your response
                            alt="User"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <span className="ml-4">
                            {username || "Anonymous"}
                          </span>
                          <span className="ml-4">
                            {fullName || "Anonymous"}
                          </span>
                        </div>
                        <div className="flex items-center w-1/2 justify-end">
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            className="bg-red-500 text-white px-2 py-1 rounded ml-2 hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No pending requests.</p>
                  )}
                </div>

                <button
                  onClick={closeModal}
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4">
        {Array.isArray(buddies) && buddies.length > 0 ? (
          buddies.map((buddy) => (
            <div
              key={buddy._id || buddy.username}
              className="flex items-center my-4 p-4 border-2 rounded-xl gap-4 bg-white bg-opacity-80 shadow-md hover:shadow-lg transition-shadow ease-in-out duration-300 transform hover:scale-105 mx-2 justify-start"
              onClick={() => navigate(`${buddy.username}`)}
            >
              <h2 className="bg-[#eeeeee] h-16 w-16 rounded-full flex items-center justify-center overflow-hidden shadow-md cursor-pointer">
                {buddy.profile ? (
                  <img
                    src={buddy.profile}
                    alt="Buddy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="ri-map-pin-fill text-xl text-gray-600"></i>
                )}
              </h2>
              <div className="ml-4 w-full flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-xl text-gray-800">
                    {buddy.fullName || "Unnamed Buddy"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {buddy.bio || "No bio available."}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className=" p-5 text-white">No buddies available.</p>
        )}
      </div>
    </div>
  );
};

export default MyBuddies;
