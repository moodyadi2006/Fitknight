import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { FaUser, FaUsers } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { FaCircleStop, FaLocationDot, FaUsersLine } from "react-icons/fa6";
import { FcRules } from "react-icons/fc";
import { GrSettingsOption } from "react-icons/gr";
import { IoIosFitness, IoIosTime } from "react-icons/io";
import { IoLocation } from "react-icons/io5";
import "../App.css";
import { LuCalendarDays, LuGraduationCap } from "react-icons/lu";
import { MdMyLocation } from "react-icons/md";
import { BsFillSendFill } from "react-icons/bs";
import socket from "../Components/socket";
import { useParams } from "react-router-dom";
import LoadingPanel from "../Components/LoadingPanel";
import ErrorPanel from "../Components/ErrorPanel";

/**
 * GroupDetails is a React component that renders the details of a specific group.
 * It handles fetching group and user data, displays group information, member list,
 * and chat messages. Users can send messages, toggle visibility of members and rules,
 * edit group details, and update the group image. The component also manages state
 * for loading, errors, notifications, and more.
 */

const GroupDetails = () => {
  const { groupName } = useParams();
  const [group, setGroup] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [selectedPreferences, setSelectedPreferences] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [isMembersVisible, setIsMembersVisible] = useState(false);
  const [isRulesVisible, setIsRulesVisible] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [organizer, setOrganizer] = useState("");
  const [currentMembers, setCurrentMembers] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState({});
  const [allMessages, setAllMessages] = useState([]);
  const activeMembers = document.getElementsByClassName("activeMembers");
  const scrollRef = useRef(null);
  const currentTime = new Date().toLocaleTimeString();
  const [selectedMember, setSelectedMember] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [newMessage, setNewMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // Initially false, show only when there's a new message

  useEffect(() => {
    /**
     * Fetches all messages for the current group from the server and updates the
     * `allMessages` state. If the latest message is not sent by the logged-in user,
     * it increases the message count, sets the new message, and shows a notification
     * for 5 seconds.
     */

    const fetchMessages = async () => {
      try {
        // Fetch messages from the backend
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/messages/fetchMessages`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const data = response.data; // Axios response already parsed

        // Update allMessages
        setAllMessages(data);

        // Get the most recent message
        const latestMessage = data[data.length - 1];

        // If the latest message is not sent by the logged-in user, it's a new message
        if (latestMessage && latestMessage.sender !== loggedInUser.username) {
          setMessageCount((prevCount) => prevCount + 1); // Increase the message count
          setNewMessage(latestMessage);
          setIsVisible(true); // Show notification

          // Set the message to disappear after 5 seconds
          const timeout = setTimeout(() => {
            setIsVisible(false); // Hide notification after 5 seconds
          }, 5000);

          // Clean up the timeout on component unmount or re-run
          return () => clearTimeout(timeout);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Scroll to the bottom whenever allMessages changes
  }, [loggedInUser, allMessages]);

  useEffect(() => {
    socket.on("chatMessage", (message) => {
      setAllMessages((prevMessages) => [...prevMessages, message]);

      setMessages((prevMessages) => {
        // Check if the sender already exists in the messages object
        if (prevMessages[message.sender]) {
          // If sender exists, append the new message to their array
          return {
            ...prevMessages,
            [message.sender]: [...prevMessages[message.sender], message],
          };
        } else {
          // If sender doesn't exist, create a new entry with the message
          return {
            ...prevMessages,
            [message.sender]: [message],
          };
        }
      });
    });

    socket.on("activeMembers", (data) => {
      // Assuming you are using getElementsByClassName elsewhere to define activeMembers
      if (activeMembers) {
        activeMembers.innerText = `Total Active Members: ${data}`;
      } else {
        console.error("activeMembers element not found");
      }
    });

    return () => {
      socket.off("chatMessage");
    };
  }, []);

  /**
   * Handles the sending of a chat message within a group.
   *
   * - Prevents the default form submission behavior.
   * - Constructs a new message object with the sender's full name, group name,
   *   message content, and a timestamp.
   * - Emits the message to other clients via a socket.
   * - Clears the message input field after sending.
   * - Sends a POST request to save the message to the backend.
   * - Catches and logs any errors that occur during the message-saving process.
   * - Scrolls the chat view to the bottom after sending the message.
   *
   * @param {Event} e - The event object representing the form submission event.
   */

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const timestamp = new Date();

    if (message.trim() !== "") {
      const newMessage = {
        sender: loggedInUser.fullName,
        receiver: groupName,
        message,
        timestamp,
      };

      // Emit message to other clients via socket
      socket.emit("chatMessage", newMessage);

      // Clear input field
      setMessage("");

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/messages/saveMessage`,
          {
            sender: loggedInUser.fullName,
            receiver: groupName,
            message,
            timestamp,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setAllMessages((prevMessages) => [...prevMessages, response.data.data.message]);
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }

        // await sendNotification();
      } catch (error) {
        console.error(
          "Error saving message:",
          error.response?.data || error.message
        );
      }
    }
  };

  /**
   * Toggles the visibility of the members section.
   *
   * @return {void} No value is returned.
   */
  const toggleMembersVisibility = () => {
    setIsMembersVisible(!isMembersVisible);
  };

  /**
   * Toggles the visibility of the group rules section.
   *
   * @return {void} No value is returned.
   */
  const toggleRulesVisibility = () => {
    setIsRulesVisible(!isRulesVisible);
  };

  // Handle input change for editable fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroup((prevGroup) => ({ ...prevGroup, [name]: value }));
  };

  /**
   * Handles the change of a checkbox by adding or removing the preference from the array.
   *
   * @param {string} preference The preference to add or remove from the array.
   * @return {void} No value is returned.
   */
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

  /**
   * Handles the clicking of the group image by showing the upload file button.
   *
   * @return {void} No value is returned.
   */
  const handleImageClick = () => {
    setShowButton(true);
  };

  /**
   * Handles the clicking of a member by fetching their profile data and
   * displaying it in the profile panel.
   *
   * @param {Object} member The member object with an _id property.
   * @return {void} No value is returned.
   */
  const handleMemberClick = async (member) => {
    try {
      // Fetch member profile data
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/users/getAnyProfile/${member._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.status === 200) {
        setSelectedMember(response.data.data); // Set the member data
        setShowPanel(true); // Show the panel
      } else {
        console.error("Error fetching user data:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
    }
  };

  useEffect(() => {
    // This will log selectedMember whenever it changes
    if (selectedMember) {
      console.log("Updated selected member:", selectedMember);
    }
  }, [selectedMember]); // Runs when selectedMember changes

  /**
   * Closes the member profile panel by setting showPanel to false and
   * clearing the selected member data.
   *
   * @return {void} No value is returned.
   */
  const closePanel = () => {
    setShowPanel(false);
    setSelectedMember(null);
  };

  /**
   * Handles the change event for a file input, allowing users to upload a new group image.
   *
   * - Retrieves the selected file from the event object.
   * - Checks if a file is selected; if not, logs an error and returns.
   * - Creates a FormData object and appends the file as 'groupImage'.
   * - Retrieves the access token from localStorage; if not found, logs an error and returns.
   * - Sends a PATCH request to update the group image using the provided API endpoint.
   * - On a successful response, reloads the page to reflect changes.
   * - Logs errors for failed requests, including server responses if available.
   *
   * @param {Event} e The file input change event.
   * @returns {void} No value is returned.
   */

  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // Get the selected file

    if (!file) {
      console.error("No file selected!");
      return;
    }

    const formData = new FormData();
    formData.append("groupImage", file);

    try {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        console.error("Access token not found!");
        return;
      }

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/groups/updateGroupImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log(response);

      if (response.status === 200) {
        window.location.reload();
      } else {
        console.error("Profile update failed!", response.data.message);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error.message);
      if (error.response) {
        // Server-side error
        console.error("Server Response:", error.response.data);
      }
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
        groupName: group.groupName,
        groupDescription: group.groupDescription,
        activityGoals: group.activityGoals,
        availableDays: group.availableDays,
        availableTimeSlot: group.availableTimeSlot,
        groupVisibility: group.groupVisibility,
        activityType: group.activityType,
        minExperienceLevel: group.minExperienceLevel,
        address: group.address,
        city: group.city,
        zipCode: group.zipCode,
        maxMembers: group.maxMembers,
        currentMembers: group.currentMembers,
        rules: group.rules,
      };

      const response = await axios.patch(
        `${import.meta.env.VITE_BASE_URL}/groups/updateGroupDetails`,
        allowedFields,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log(response);

      if (response.status !== 200) {
        throw new Error("Failed to update user data");
      }

      setGroup(response.data.data);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Fetch user data from the backend
  useEffect(() => {
    /**
     * Fetches group data and user profile data from the backend
     * @param {string} groupName The groupName to fetch
     * @throws {Error} If there is an issue fetching either the group or the logged-in user's data
     */
    const fetchData = async (groupName) => {
      try {
        // Fetch group data with groupName as a query parameter
        const groupResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/groups/getGroupProfile`,
          {
            params: {
              groupName,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (groupResponse.status !== 200) {
          throw new Error("Failed to fetch group data");
        }

        // Set the group data
        setGroup(groupResponse.data.data);
        const organizer = groupResponse.data.data.organizer; // store the organizer

        // Fetch user profile data
        const userResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setLoggedInUser(userResponse.data.data);

        // Fetch organizer and current members data
        const fetchOrganizerAndCurrentMembers = async (organizer) => {
          try {
            const response = await axios.post(
              `${import.meta.env.VITE_BASE_URL}/groups/getRequestResult`,
              { organizer }, // Send organizer in request body
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken"
                  )}`,
                },
              }
            );
            setOrganizer(response.data.data.organizer);

            // Check if 'acceptedMembers' is an array and map over it to set current members
            if (Array.isArray(response.data.data.acceptedMembers)) {
              const memberDetails = response.data.data.acceptedMembers.map(
                (member) => {
                  return { fullName: member.fullName, _id: member._id }; // Return the object
                }
              );
              // Update the state once
              setCurrentMembers((prevMembers) => [
                ...prevMembers,
                ...memberDetails, // Add the new members to the previous list
              ]);
            } else {
              console.error("Accepted members data is not in expected format");
            }
          } catch (error) {
            console.error(
              "Error fetching organizer and current members:",
              error
            );
          }
        };

        fetchOrganizerAndCurrentMembers(organizer);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData(groupName);
  }, []);

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
    <div className="relative w-full min-h-screen">
      <div className="flex z-20 relative">
        <div className="relative opacity-90 shadow-lg p-8 w-1/3 bg-gray-500 z-30 hover:bg-black transition-all duration-2000 overflow-y-auto max-h-screen">
          {group && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div>
                  <img
                    src={group.groupImage}
                    alt="Profile"
                    className="w-32 h-32 rounded-full shadow-md cursor-pointer"
                    onClick={handleImageClick}
                  />

                  {showButton && loggedInUser._id === group.organizer && (
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
                    name="groupName"
                    value={group.groupName}
                    onChange={handleInputChange}
                    className="bg-gray-200 text-black p-1 rounded"
                  />
                ) : (
                  group.groupName
                )}
              </h1>

              <p className="text-blue-500">
                {editMode ? (
                  <textarea
                    name="groupDescription"
                    value={group.groupDescription}
                    onChange={handleInputChange}
                    className="bg-gray-200 text-black p-1 rounded w-full"
                  />
                ) : (
                  group.groupDescription || "No description available"
                )}
              </p>

              <div className="space-y-4 text-left">
                <p className="flex items-center text-white">
                  <FaUser className="mr-2 text-blue-500" />
                  <strong>Organizer: </strong>
                  <span className="ml-2">{organizer}</span>
                </p>
                <p className="flex items-center text-white">
                  <FaEye className="mr-2 text-blue-500" />
                  <strong>Group Visibility: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <select
                        name="groupVisibility"
                        value={group.groupVisibility}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      >
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                      </select>
                    ) : (
                      group.groupVisibility
                    )}
                  </span>
                </p>
                <p className="flex items-center text-white">
                  <FaUsers className="mr-2 text-blue-500" />
                  <strong>Number of Members: </strong>
                  <span className="ml-2">{group.currentMembersCount}</span>
                </p>

                <p className="flex items-center text-white">
                  <FaUsersLine className="mr-2 text-blue-500" />
                  <strong>Current Members: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <select
                        name="currentMembers"
                        value={
                          currentMembers && currentMembers.length > 0
                            ? currentMembers[0]._id
                            : ""
                        }
                        className="bg-gray-200 text-black p-1 rounded"
                      >
                        {currentMembers && currentMembers.length > 0 ? (
                          currentMembers.map((member, index) => (
                            <option key={index} value={member._id}>
                              {member.fullName}
                            </option>
                          ))
                        ) : (
                          <option>No members available</option>
                        )}
                      </select>
                    ) : (
                      <div className="relative inline-block">
                        <button
                          className="bg-gray-700 text-white p-1 rounded focus:outline-none"
                          onClick={toggleMembersVisibility}
                        >
                          {isMembersVisible ? "Hide Members" : "View Members"}
                        </button>

                        {isMembersVisible && (
                          <div className="absolute mt-1 bg-white text-black rounded shadow-lg z-50">
                            <ul className="p-2">
                              {currentMembers && currentMembers.length > 0 ? (
                                currentMembers
                                  // Filter out duplicates based on `fullName` or any unique identifier
                                  .filter(
                                    (value, index, self) =>
                                      index ===
                                      self.findIndex(
                                        (t) => t.fullName === value.fullName
                                      )
                                  )
                                  .map((member, index) => (
                                    <li
                                      key={member.id || index} // Use `id` if available, otherwise use `index`
                                      className="p-1 hover:bg-gray-200 cursor-pointer"
                                      onClick={() => handleMemberClick(member)} // Pass the whole member object
                                    >
                                      {member.fullName} {/* Display fullName */}
                                    </li>
                                  ))
                              ) : (
                                <li>No members available</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Centered Panel */}
                    {showPanel && selectedMember ? (
                      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-150">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-3/4 md:w-1/3 relative transform transition-all duration-300 ease-in-out scale-95 hover:scale-100 z-60">
                          <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                            onClick={closePanel}
                          >
                            ✕
                          </button>
                          <div className="flex flex-col items-center">
                            <img
                              src={selectedMember.profile}
                              alt="Profile"
                              className="w-32 h-32 rounded-full shadow-lg mb-4 border-4 border-blue-500 hover:border-blue-700 transform transition-all duration-200"
                            />
                            <h3 className="text-3xl text-gray-800 font-semibold mb-4 text-center">
                              {selectedMember.fullName || "No name available"}
                            </h3>
                            <div className="space-y-3">
                              <p className="text-lg text-gray-700">
                                <strong>Username:</strong>{" "}
                                {selectedMember.username ||
                                  "No username available"}
                              </p>
                              <p className="text-lg text-gray-700">
                                <strong>Email:</strong>{" "}
                                {selectedMember.email || "No email available"}
                              </p>
                              <p className="text-lg text-gray-700">
                                <strong>Gender:</strong>{" "}
                                {selectedMember.gender || "No gender available"}
                              </p>
                              <p className="text-lg text-gray-700">
                                <strong>Bio:</strong>{" "}
                                {selectedMember.bio || "No bio available"}
                              </p>
                              {selectedMember.allowChat === "true" &&
                                selectedMember.phoneNumber && (
                                  <p className="text-lg text-gray-700">
                                    <strong>Phone Number:</strong>
                                    {" +"}
                                    {selectedMember.phoneNumber}
                                  </p>
                                )}
                              <p className="text-lg text-gray-700">
                                <strong>Experience Level:</strong>{" "}
                                {selectedMember.experienceLevel ||
                                  "No experience level available"}
                              </p>
                              <p className="text-lg text-gray-700">
                                <strong>Workout Preferences:</strong>{" "}
                                {selectedMember.workoutPreferences &&
                                selectedMember.workoutPreferences.length > 0
                                  ? selectedMember.workoutPreferences.join(", ")
                                  : "No Workout Preferences"}
                              </p>
                              <p className="text-lg text-gray-700">
                                <strong>Fitness Goals:</strong>{" "}
                                {selectedMember.fitnessGoals ||
                                  "No Fitness Goals"}
                              </p>

                              <p className="text-lg text-gray-700">
                                <strong>Available Days:</strong>{" "}
                                {selectedMember.availableDays ||
                                  "No available Days"}
                              </p>
                              <p className="text-lg text-gray-700">
                                <strong>Available Time Slot:</strong>{" "}
                                {selectedMember.availableTimeSlot ||
                                  "No time slot available"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </span>
                </p>

                <p className="flex items-center text-white">
                  <FaCircleStop className="mr-2 text-blue-500" />
                  <strong>Maximum Members: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <input
                        type="number"
                        name="maxMembers"
                        value={group.maxMembers || ""}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      />
                    ) : (
                      group.maxMembers
                    )}
                  </span>
                </p>

                <p className="flex items-center text-white">
                  <LuGraduationCap className="mr-2 text-blue-500" />
                  <strong>Required Experience Level: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <select
                        name="minExperienceLevel"
                        value={group.minExperienceLevel}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    ) : (
                      group.minExperienceLevel
                    )}
                  </span>
                </p>
                <p className="flex items-center text-white">
                  <GrSettingsOption className="mr-2 text-blue-500" />
                  <strong>Activity Type: </strong>
                  <span className="ml-2">
                    {editMode
                      ? ["Gym", "Yoga", "Running", "Zumba"].map(
                          (preference) => (
                            <label
                              key={preference}
                              className="flex items-center text-white mb-2"
                            >
                              <input
                                type="checkbox"
                                name="activityType"
                                value={preference}
                                className="mr-2"
                                checked={selectedPreferences.includes(
                                  preference
                                )} // Check if the preference is selected
                                onChange={() =>
                                  handleCheckboxChange(preference)
                                } // Handle checkbox change
                              />
                              {preference}
                            </label>
                          )
                        )
                      : group.activityType.join(", ")}{" "}
                    {/* Join the preferences with a comma */}
                  </span>
                </p>
                <p className="flex items-center text-white">
                  <IoIosFitness className="mr-2 text-blue-500" />
                  <strong>Activity Goals: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <select
                        name="activityGoals"
                        value={group.activityGoals}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      >
                        <option value="WeightLoss">Weight Loss</option>
                        <option value="MuscleGain">Muscle gain</option>
                        <option value="Endurance">Endurance</option>
                      </select>
                    ) : (
                      group.activityGoals
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
                        value={group.availableDays}
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
                      group.availableDays
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
                        value={group.availableTimeSlot}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      >
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Evening">Evening</option>
                      </select>
                    ) : (
                      group.availableTimeSlot
                    )}
                  </span>
                </p>
                <p className="flex items-center text-white">
                  <FaLocationDot className="mr-2 text-blue-500" />
                  <strong>Address: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <input
                        type="text"
                        name="address"
                        value={group.address || ""}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      />
                    ) : (
                      group.address
                    )}
                  </span>
                </p>

                <p className="flex items-center text-white">
                  <IoLocation className="mr-2 text-blue-500" />
                  <strong>City: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <input
                        type="text"
                        name="city"
                        value={group.city || ""}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      />
                    ) : (
                      group.city
                    )}
                  </span>
                </p>

                <p className="flex items-center text-white">
                  <MdMyLocation className="mr-2 text-blue-500" />
                  <strong>Zip Code: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <input
                        type="text"
                        name="zipCode"
                        value={group.zipCode || ""}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      />
                    ) : (
                      group.zipCode
                    )}
                  </span>
                </p>

                <p className="flex items-center text-white">
                  <FcRules className="mr-2 text-blue-500" />
                  <strong>Rules: </strong>
                  <span className="ml-2">
                    {editMode ? (
                      <select
                        name="rules"
                        value={group.rules}
                        onChange={handleInputChange}
                        className="bg-gray-200 text-black p-1 rounded"
                      >
                        {group.rules.map((rule, index) => (
                          <option key={index} value={rule}>
                            {rule}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative inline-block">
                        <button
                          className="bg-gray-700 text-white p-1 rounded focus:outline-none"
                          onClick={toggleRulesVisibility}
                        >
                          {isRulesVisible ? "Hide Rules" : "View Rules"}
                        </button>
                        {isRulesVisible && (
                          <div className="absolute mt-1 bg-white text-black rounded shadow-lg">
                            <ul className="p-2">
                              {group.rules.map((rule, index) => (
                                <li
                                  key={index}
                                  className="p-1 hover:bg-gray-200"
                                >
                                  {rule}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </span>
                </p>
              </div>

              {loggedInUser._id === group.organizer && (
                <button
                  onClick={handleUpdate}
                  className="button-view bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
                >
                  {editMode ? "Save Changes" : "Edit Profile"}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="w-2/3 z-20 border-none relative top-0 p-4 max-h-screen flex flex-col">
          <div className="text-center mb-4 relative">
            <h2 className="text-white text-3xl font-extrabold">FITCHAT</h2>
            <h4 className="activeMembers text-white text-xs">
              {activeMembers.innerText}
            </h4>

            {messageCount > 0 && isVisible && (
              <span
                className="bg-red-500 text-white text-sm rounded-full w-5 h-5 flex items-center justify-center absolute top-0 right-0 transform translate-x-1 translate-y-1 animate-ping"
                style={{ animationDuration: "1s" }}
              >
                {messageCount}
              </span>
            )}
          </div>

          {/* Scrollable Chat Messages */}

          <div className="flex-1 overflow-y-auto mb-12" ref={scrollRef}>
            <ul className="w-full">
              {allMessages
                .filter((message) => message.receiver === groupName)
                .map((message, index) => {
                  // Format the timestamp to only show time
                  const time = new Date(message.timestamp).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  return (
                    <li
                      key={index}
                      className={
                        message.sender === loggedInUser.fullName
                          ? "right"
                          : "left"
                      }
                    >
                      <p className="text-blue-500 text-sm">{message.sender}</p>
                      <p className="text-white">{message.message}</p>
                      <p className="float-right text-white text-xs mt-1">
                        {time}
                      </p>
                    </li>
                  );
                })}
            </ul>
          </div>

          {/* Input Box at the Bottom */}
          <div className="absolute bottom-3 left-0 w-full p-4">
            <div className="relative w-full">
              <form onSubmit={handleSendMessage}>
                <input
                  type="text"
                  name="message" // This name attribute is no longer necessary since we use `message` state
                  value={message} // Bind input value to message state
                  onChange={(e) => setMessage(e.target.value)} // Update state on input change
                  className="w-full px-4 py-2 border-none outline-none bg-white text-black rounded-full pr-12"
                  placeholder="Type a message"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full"
                >
                  <BsFillSendFill />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="h-2/3 w-2/3 ">
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
      </div>
    </div>
  );
};

export default GroupDetails;
