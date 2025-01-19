import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { FaGenderless, FaUser } from "react-icons/fa";
import { GrHomeOption, GrSettingsOption } from "react-icons/gr";
import { IoIosFitness, IoIosTime } from "react-icons/io";

import "../App.css";
import {
  LuCalendarDays,
  LuGraduationCap,
  LuMail,
  LuPhone,
} from "react-icons/lu";

import { BsFillSendFill } from "react-icons/bs";
import socket from "../Components/socket";
import { useParams } from "react-router-dom";
import LoadingPanel from "../Components/LoadingPanel";
import ErrorPanel from "../Components/ErrorPanel";
// Connect to the server

const BuddyDetails = () => {
  const { username } = useParams();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState({});
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const activeMembers = document.getElementsByClassName("activeMembers");
  const scrollRef = useRef(null);
  const currentTime = new Date().toLocaleTimeString();
  const [messageCount, setMessageCount] = useState(0);
  const [newMessage, setNewMessage] = useState(null);
  const [isVisible, setIsVisible] = useState(false); // Initially false, show only when there's a new message

  useEffect(() => {
  let timeout;
 /**
     * Fetches buddy messages from the backend and updates the state accordingly.
     * If a new message is received from a different sender, it triggers a notification.
     *
     * - Fetches all messages and updates the allMessages state.
     * - Checks the latest message and compares the sender with the logged-in user.
     * - If the sender is different, increases the message count and shows a notification.
     * - Notification disappears after 5 seconds.
     * - Handles 404 errors by setting allMessages to an empty array.
     *
     * @throws {Error} If the request fails or the response status is 404.
     */
  const fetchBuddyMessages = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/messages/fetchMessages`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = response.data;
      setAllMessages(data);

      // Get the latest message
      const latestMessage = data[data.length - 1];

      // If it's a new message from a different sender, show notification
      if (
        latestMessage &&
        latestMessage.sender !== loggedInUser.username &&
        latestMessage !== newMessage // Avoid duplicate notifications
      ) {
        setMessageCount((prevCount) => prevCount + 1);
        setNewMessage(latestMessage);
        setIsVisible(true);

        // Automatically hide the notification after 5 seconds
        timeout = setTimeout(() => {
          setIsVisible(false);
        }, 5000);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setAllMessages([]);
      }
    }
  };

  fetchBuddyMessages();

  // Auto-scroll to the bottom
  if (scrollRef.current) {
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }

  // Clean up the timeout
  return () => clearTimeout(timeout);
}, [loggedInUser.username, newMessage]);


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
   * Handles the sending of a message by the logged-in user to the specified receiver.
   * - Prevents default form submission behavior.
   * - Emits the message to other clients via a socket.
   * - Sends the message data to the server to be saved.
   * - Clears the message input field after sending.
   * - Automatically scrolls to the latest message.
   * @param {Event} e The event object triggered by the form submission.
   * @throws {Error} If there is an issue saving the message to the server.
   */

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const timestamp = new Date();

    if (message.trim() !== "") {
      const newMessage = {
        sender: loggedInUser.username,
        receiver: user.username,
        message,
        timestamp,
      };
      // Emit message to other clients via socket
      socket.emit("chatMessage", newMessage);
      // Clear input field
      setMessage("");

      try {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/messages/saveBuddyMessage`,
          {
            sender: loggedInUser.username,
            receiver: user.username,
            message,
            timestamp,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      } catch (error) {
        console.error(
          "Error saving message:",
          error.response?.data || error.message
        );
      }
    }
  };


  // Fetch user data from the backend
  useEffect(() => {
    /**
     * Fetches the buddy's profile data and the logged-in user's data from the backend
     * @param {string} username The username of the buddy to fetch
     * @throws {Error} If there is an issue fetching either the buddy or the logged-in user's data
     */
    const fetchData = async (username) => {
      try {
        // Fetch group data with groupName as a query parameter
        const buddyResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/getProfileWithUsername`,
          {
            params: {
              username,
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (buddyResponse.status !== 200) {
          throw new Error("Failed to fetch buddy data");
        }

        // Set the group data
        setUser(buddyResponse.data.data);
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData(username);
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
        <ErrorPanel error={error} />
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen flex">
      <div className="flex z-20 w-full">
        <div className="relative opacity-90 shadow-lg p-8 w-1/3 bg-gray-500 z-30 hover:bg-black transition-all duration-2000 overflow-y-auto h-screen">
          {user && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <div>
                  <img
                    src={user.profile}
                    alt="Profile"
                    className="w-32 h-32 rounded-full shadow-md cursor-pointer"
                  />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white">{user.fullName}</h1>

              <p className="text-blue-500">{user.bio}</p>

              <div className="space-y-4 text-left">
                <p className="flex items-center text-white">
                  <FaUser className="mr-2 text-blue-500" />
                  <strong>Username: </strong>
                  <span className="ml-2">{user.username}</span>
                </p>
                <p className="flex items-center text-white">
                  <FaGenderless className="mr-2 text-blue-500" />
                  <strong>Gender: </strong>
                  <span className="ml-2">{user.gender}</span>
                </p>
                <p className="flex items-center text-white">
                  <GrHomeOption className="mr-2 text-blue-500" />
                  <strong>Preference: </strong>
                  <span className="ml-2">{user.preference}</span>
                </p>
                <p className="flex items-center text-white">
                  <LuGraduationCap className="mr-2 text-blue-500" />
                  <strong>Experience Level: </strong>
                  <span className="ml-2">{user.experienceLevel}</span>
                </p>
                <p className="flex items-center text-white">
                  <IoIosFitness className="mr-2 text-blue-500" />
                  <strong>Main Focus: </strong>
                  <span className="ml-2">{user.fitnessGoals}</span>
                </p>
                <p className="flex items-center text-white">
                  <GrSettingsOption className="mr-2 text-blue-500" />
                  <strong>Workout Preferences: </strong>
                  <span className="ml-2">
                    {user.workoutPreferences.map((preference, index) => (
                      <span key={index}>
                        {preference}
                        {index < user.workoutPreferences.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </span>
                </p>

                <p className="flex items-center text-white">
                  <LuCalendarDays className="mr-2 text-blue-500" />
                  <strong>Days Availability: </strong>
                  <span className="ml-2">{user.availableDays}</span>
                </p>
                <p className="flex items-center text-white">
                  <IoIosTime className="mr-2 text-blue-500" />
                  <strong>Time Slot Availability: </strong>
                  <span className="ml-2">{user.availableTimeSlot}</span>
                </p>

                {user.allowChat === "true" && (
                  <p className="flex items-center text-white">
                    <LuPhone className="mr-2 text-blue-500" />
                    <strong>Phone Number: </strong>
                    <span className="ml-2">{"+" + user.phoneNumber}</span>
                  </p>
                )}

                {user.allowChat === "true" && (
                  <p className="flex items-center text-white">
                    <LuMail className="mr-2 text-blue-500" />
                    <strong>Email: </strong>
                    <span className="ml-2">{user.email}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-2/3 z-20 border-none relative top-0 p-4 h-screen flex flex-col">
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
                !
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto mb-12" ref={scrollRef}>
            <ul className="w-full">
              {allMessages
                .filter(
                  (message) =>
                    (message.sender === loggedInUser.username &&
                      message.receiver === user.username) ||
                    (message.sender === user.username &&
                      message.receiver === loggedInUser.username)
                )
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
                        message.sender === loggedInUser.username
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

          <div className="absolute bottom-3 left-0 w-full p-4">
            <div className="relative w-full">
              <form onSubmit={handleSendMessage}>
                <input
                  type="text"
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
      <div className="h-screen w-full absolute inset-0">
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

export default BuddyDetails;
