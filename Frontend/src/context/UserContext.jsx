import { createContext, useState } from 'react'

export const UserDataContext = createContext()

const UserContext = ({ children }) => {
  const [user, setUser] = useState({
    fullName: '',
    username: '',
    email: '',
    profile: '',
    preference: '',
    gender: '',
    bio: '',
    fitnessGoals: '',
    workoutPreferences: [],
    availableDays: '',
    availableTimeSlot: '',
    experienceLevel: '',
    phoneNumber: '',
    allowChat: '',
  });
  return (
    <div>
      <UserDataContext.Provider value={{ user, setUser }}>
        {children}
      </UserDataContext.Provider>
    </div>
  )
}

export default UserContext;
