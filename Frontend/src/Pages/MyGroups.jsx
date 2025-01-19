import { useEffect, useState } from "react";
import GroupsPanel from "../Components/GroupsPanel";
import axios from "axios";

/**
 * MyGroups
 *
 * This component fetches the groups that the logged-in user is a member of and
 * displays them in a GroupsPanel component. It fetches the user's profile and
 * groups from the backend, and displays an error message if there is an issue
 * with the API request or response.
 *
 * @returns {JSX.Element} A JSX element containing a GroupsPanel component
 */
const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});

  useEffect(() => {
  /**
   * Fetches the groups a user is a member of from the backend
   * @throws {Error} If there is an issue with the API request, or if the response is invalid
   */
    const fetchGroups = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/users/myGroups`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        setGroups(data.data || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

  /**
   * Fetches the logged-in user's profile from the backend
   * @throws {Error} If there is an issue with the API request, or if the response is invalid
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
        setLoggedInUser(data.data || {});
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchUser(), fetchGroups()]);
    };

    fetchData();
  }, []);

  return <GroupsPanel groups={groups} loggedInUser={loggedInUser} />;
};

export default MyGroups;
