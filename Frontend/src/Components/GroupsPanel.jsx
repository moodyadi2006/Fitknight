import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GroupsPanel = ({ groups, loggedInUser }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);

  const pendingRequestHandler = async (group) => {
    setCurrentGroup(group);
    setModalVisible(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/groups/getRequests/${group._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      // Validate the response before setting state

      if (response.data) {
        const pendingRequests = response.data.filter(
          (request) => request.status === "pending"
        );
        setPendingRequests(pendingRequests);
      } else {
        console.error("Invalid response from server.");
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      // Optionally close the modal if fetching fails
      setModalVisible(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      // Approve the user
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/groups/approveRequest/${requestId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Update pending requests
      setPendingRequests((prevRequests) =>
        prevRequests.filter((request) => request._id !== requestId)
      );
    } catch (error) {
      console.error("Error approving request:", error);
    }
    
  };

  const handleReject = async (requestId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/groups/rejectRequest/${requestId}`,
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

  const closeModal = () => {
    setModalVisible(false);
    setCurrentGroup(null);
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
      <div className="relative z-10 p-6">
        <h1 className="text-2xl font-semibold text-white mb-6">My Groups</h1>
        {Array.isArray(groups) && groups.length > 0 ? (
          groups.map((group) => (
            <div
              key={group._id || group.groupName}
              className="flex items-center my-4 p-4 border-2 rounded-xl gap-4 bg-white bg-opacity-80 shadow-md hover:shadow-lg transition-shadow ease-in-out duration-300 transform hover:scale-105 mx-2 justify-start"
              onClick={() => navigate(`${group.groupName}`)}
            >
              <h2 className="bg-[#eeeeee] h-16 w-16 rounded-full flex items-center justify-center overflow-hidden shadow-md cursor-pointer">
                {group.groupImage ? (
                  <img
                    src={group.groupImage}
                    alt="Group"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <i className="ri-map-pin-fill text-xl text-gray-600"></i>
                )}
              </h2>
              <div className="ml-4 w-full flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-xl text-gray-800">
                    {group.groupName || "Unnamed Group"}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {group.groupDescription || "No description available."}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Organizer:{" "}
                    <span className="font-medium">
                      {group.organizer?.fullName || "Unknown"}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mt-1">
                    Current Members:{" "}
                    <span className="font-medium">
                      {group.currentMembersCount || 0}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Maximum Members:{" "}
                    <span className="font-medium">{group.maxMembers || 0}</span>
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
              {loggedInUser?._id === group.organizer?._id && (
                <button
                  onClick={(event) => {
                    event.stopPropagation(); // Prevent navigation to the group's page
                    pendingRequestHandler(group);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Pending Requests
                </button>
              )}
            </div>
          ))
        ) : (
          <p>Currently No group is joined.</p>
        )}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">
              Pending Requests for {currentGroup?.groupName}
            </h2>
            <div className="overflow-y-auto max-h-60">
              {pendingRequests && pendingRequests.length > 0 ? (
                pendingRequests.map((request, index) => (
                  <div
                    key={index}
                    className="p-2 border-b border-gray-200 flex justify-between items-center"
                  >
                    <div className="flex items-center justify-between w-1/2">
                      <img
                        src={request.userId?.profile} // Use the correct path based on your response
                        alt="User"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <span className="ml-4">
                        {request.userId?.username || "Anonymous"}
                      </span>
                      <span className="ml-4">
                        {request.userId?.fullName || "Anonymous"}
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
  );
};

export default GroupsPanel;
