import { useEffect, useState } from "react";
import GroupsPanel from "../Components/GroupsPanel";
import axios from "axios";

const MyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState({});

  useEffect(() => {
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
