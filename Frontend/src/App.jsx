import { Route, Routes } from "react-router-dom";
import Start from "./Pages/Start";
import UserSignup from "./Pages/UserSignup";
import UserLogin from "./Pages/UserLogin";
import FitnessGroup from "./Pages/FitnessGroup";
import WorkoutBuddy from "./Pages/WorkoutBuddy";
import UserProfile from "./Pages/UserProfile";
import CreateGroup from "./Pages/CreateGroup";
import MyGroups from "./Pages/MyGroups";
import JoinGroup from "./Pages/JoinGroup";
import GroupDetails from "./Pages/GroupDetails";
import Buddy from "./Pages/Buddy";
import MyBuddies from "./Pages/MyBuddies";
import BuddyDetails from "./Pages/BuddyDetails";
import VerifyEmail from "./Pages/Verify";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/userSignup" element={<UserSignup />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/userLogin" element={<UserLogin />} />
        <Route path="/FitnessGroup" element={<FitnessGroup />} />
        <Route path="/WorkoutBuddy" element={<WorkoutBuddy />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/CreateGroup" element={<CreateGroup />} />
        <Route path="/MyGroups" element={<MyGroups />} />
        <Route path="/JoinGroup" element={<JoinGroup />} />
        <Route path="MyGroups/:groupName" element={<GroupDetails />} />
        <Route path="/Buddy" element={<Buddy />} />
        <Route path="/MyBuddies" element={<MyBuddies/>} />
        <Route path="MyBuddies/:username" element={<BuddyDetails />} />
      </Routes>
    </div>
  );
}

export default App;
