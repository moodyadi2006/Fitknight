import { createContext, useState } from 'react'

export const FitnessGroupDataContext = createContext()

const FitnessGroupContext = ({ children }) => {
  const [group, setGroup] = useState({
    groupName: '',
    organizer: '',
    groupDescription: '',
    groupImage: '',
    groupVisibility: 'Private',
    activityGoals: 'WeightLoss',
    activityType: [],
    availableDays: 'Weekends',
    availableTimeSlot: 'Morning',
    minExperienceLevel: 'Beginner',
    maxMembers: '',
    currentMembers: '',
    rules: [],
    address: '',
    city: '',
    zipCode: '',
  });
  return (
    <div>
      <FitnessGroupDataContext.Provider value={{ group, setGroup }}>
        {children}
      </FitnessGroupDataContext.Provider>
    </div>
  )
}

export default FitnessGroupContext;
