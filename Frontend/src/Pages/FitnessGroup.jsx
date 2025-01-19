import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  FaFacebookF,
  FaInstagram,
  FaSearch,
  FaTwitter,
  FaUser,
  FaYoutube,
} from "react-icons/fa";
import axios from "axios";
import { IoIosLogOut } from "react-icons/io";
import { useState } from "react";

/**
 * A function component that renders the Fitness Group page
 *
 * @function
 * @returns {ReactElement} A React element representing the Fitness Group page
 */
function FitnessGroup() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Handles the group search form submission.
   *
   * - Prevents the default form submission behavior.
   * - Resets the form error.
   * - Makes a GET request to the group search endpoint.
   * - Checks if the response status is 200 and if so, sets the group context and navigates to the GroupDetails page.
   * - Resets the form fields.
   * - Catches any errors and handles them accordingly.
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      // Making the API request
      const response = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/groups/search`,
        {
          params: { name: searchQuery },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      // Correctly setting search results
      const groups = response.data.data || [];
      setSearchResults(groups);
    } catch (error) {
      console.error("Search failed", error);

      // Optional: Clear search results on error
      setSearchResults([]);
    }
  };

  /**
   * Clears the search input and search results
   */
  const handleClearSearch = () => {
    setSearchQuery(""); // Clear the search input
    setSearchResults([]);
  };

  /**
   * Handles the logout button click event.
   *
   * - Notifies the server to invalidate the refresh token.
   * - Clears the access and refresh tokens from localStorage.
   * - Redirects to the login page.
   * - Catches any errors and handles them accordingly.
   */
  const logoutHandler = async () => {
    try {
      const accToken = localStorage.getItem("accessToken");
      if (accToken) {
        await axios.post(
          `${import.meta.env.VITE_BASE_URL}/users/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accToken}`,
            },
          }
        );
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      alert("Logout successful");
      navigate("/userLogin");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div>
      <header className="relative h-[100px]">
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        >
          <source
            src="https://videos.pexels.com/video-files/5485148/5485148-sd_640_360_25fps.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>

        <div className="flex justify-between items-center h-full px-6 w-full">
          <div className="flex items-center w-1/5">
            <img
              className="h-[60px] w-[60px] mr-3"
              src={logo}
              alt="Fitknight Logo"
            />
            <span className="text-red-500 text-2xl font-extrabold">
              FITKNIGHT
            </span>
          </div>

          <div className="w-2/5 flex flex-col items-center relative">
            <div className="w-full relative">
              {/* Search Input */}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Find a Fitness Group with group name"
                className="py-3 pl-5 pr-12 rounded-full h-[50px] w-full outline-none shadow-lg text-gray-700 bg-gradient-to-r from-gray-50 to-gray-200 focus:ring-2 focus:ring-red-400 transition-all duration-300"
              />
              <FaSearch
                onClick={handleSearch}
                className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl cursor-pointer hover:text-red-500 transition-all duration-300"
              />
              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none text-lg"
                onClick={handleClearSearch}
              >
                ✕
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 ? (
              <div className="absolute top-full mt-3 w-full bg-white border rounded-xl shadow-2xl z-10 animate-fade-in">
                <h2 className="text-lg font-bold text-gray-800 mb-3 px-5 pt-5 border-b pb-3">
                  Search Results:
                </h2>
                <ul className="space-y-4 px-5 pb-5">
                  {searchResults.map((group) => (
                    <li
                      key={group.id || group._id}
                      className="p-4 border rounded-lg bg-gradient-to-r from-white to-gray-50 shadow-md hover:shadow-lg hover:scale-105 transition-transform duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                          <img
                            src={group.groupImage}
                            alt="Profile"
                            className="w-12 h-12 rounded-full shadow-md cursor-pointer hover:ring-2 hover:ring-red-400 transition-all duration-300"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">
                              {group.groupName}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {group.groupDescription}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            navigate(`/JoinGroup?groupName=${group.groupName}`)
                          }
                          className="py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg transition-all duration-300"
                        >
                          View Group
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              searchQuery && (
                <div className="absolute top-full mt-3 w-full bg-white border rounded-xl shadow-2xl z-10 animate-fade-in">
                  <h2 className="text-sm font-bold text-gray-500 mb-3 px-5 pt-5">
                    No groups found
                  </h2>
                </div>
              )
            )}
          </div>

          <div className="w-2/5 flex justify-end items-center space-x-3">
            <Link
              to="/MyGroups"
              className="py-2 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
            >
              My Groups
            </Link>
            <Link
              to="/CreateGroup"
              className="py-2 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
            >
              Create Group
            </Link>
            <Link
              to="/JoinGroup"
              className="py-2 px-4 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
            >
              Join Group
            </Link>
            <Link
              to="/UserProfile"
              className="py-2 px-4 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600"
            >
              <FaUser />
            </Link>
            <button
              onClick={logoutHandler}
              className="py-2 px-4 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600"
            >
              <IoIosLogOut />
            </button>
          </div>
          
        </div>
      </header>

      <div>
        <div className="">
          <div className="h-[640px] w-full relative">
            {/* Background Image */}
            <div
              className="h-full w-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/1472887/pexels-photo-1472887.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
              }}
            ></div>

            {/* Overlay for Text */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-between">
              {/* Header Section */}
              <h1 className="text-white text-4xl md:text-5xl font-bold text-center mt-40 bg-black bg-opacity-50 p-5">
                Group Workouts <br />
                <span className="text-red-500">Victory Loves Company</span>
              </h1>

              {/* Paragraph Section at the Bottom */}
              <div className="mb-10">
                <p className="text-white text-lg md:text-xl text-center px-5">
                  Group workouts foster motivation, accountability, and a sense
                  of community. Exercising with others boosts energy, reduces
                  boredom, and encourages consistency. They offer expert
                  guidance, diverse routines, and social connections, making
                  fitness enjoyable. Group dynamics push you to challenge
                  limits, promoting faster progress. Shared goals create
                  camaraderie, reducing stress and improving mental health,
                  ensuring a balanced and holistic fitness journey.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/4 mb-8 md:mb-0">
              <div className="text-white text-lg font-bold">Fitknight</div>
              <div className="text-gray-500 text-sm mt-1">
                WORKOUT COMPLETE™
              </div>
            </div>

            <div className="w-full md:w-3/4 flex flex-wrap">
              <div className="w-1/4 mb-6">
                <h3 className="text-white font-bold mb-3">WORKOUTS</h3>
                <ul>
                  <li>
                    <a href="#" className="hover:text-white">
                      Workout Videos
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Custom Workouts
                    </a>
                  </li>
                </ul>
              </div>

              <div className="w-1/4 mb-6">
                <h3 className="text-white font-bold mb-3">PROGRAMS</h3>
                <ul>
                  <li>
                    <a href="#" className="hover:text-white">
                      Workout Programs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Meal Plans
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Pilot Programs
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Routines
                    </a>
                  </li>
                </ul>
              </div>

              <div className="w-1/4 mb-6">
                <h3 className="text-white font-bold mb-3">HEALTHY LIVING</h3>
                <ul>
                  <li>
                    <a href="#" className="hover:text-white">
                      Fitness
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Health
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Nutrition
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Healthy Recipes
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Experts
                    </a>
                  </li>
                </ul>
              </div>

              <div className="w-1/4 mb-6">
                <h3 className="text-white font-bold mb-3">ABOUT</h3>
                <ul>
                  <li>
                    <a href="#" className="hover:text-white">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Tutorials
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Our Team
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      B2B Options
                    </a>
                  </li>
                </ul>
              </div>

              <div className="w-1/4 mb-6">
                <h3 className="text-white font-bold mb-3">MEMBERSHIP</h3>
                <ul>
                  <li>
                    <a href="#" className="hover:text-white">
                      FB Plus
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Community
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Referral Program
                    </a>
                  </li>
                </ul>
              </div>

              <div className="w-1/4 mb-6">
                <h3 className="text-white font-bold mb-3">SUPPORT</h3>
                <ul>
                  <li>
                    <a href="#" className="hover:text-white">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      FAQ
                    </a>
                  </li>
                  <li>
                    <a href="#" className="hover:text-white">
                      Store
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="text-gray-500 text-sm">
              Copyright © 2025 Fitknight. All rights reserved.
              <a href="#" className="hover:text-white">
                Terms of Use
              </a>{" "}
              |
              <a href="#" className="hover:text-white">
                Privacy Policy
              </a>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0 text-xl">
              <a href="#" className="hover:text-white">
                <FaFacebookF />
              </a>
              <a href="#" className="hover:text-white">
                <FaYoutube />
              </a>
              <a href="#" className="hover:text-white">
                <FaInstagram />
              </a>
              <a href="#" className="hover:text-white">
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FitnessGroup;
