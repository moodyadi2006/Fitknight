import mongoose from 'mongoose';

const createFitnessGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      required: true,
      unique: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User schema for the group organizer
      required: true,
    },
    groupVisibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Private',
      required: true,
    },
    groupDescription: {
      type: String,
      required: true,
    },
    groupImage: {
      type: String,
      required: true,
    },
    activityGoals: {
      type: String,
      enum: ['WeightLoss', 'MuscleGain', 'Endurance'],
      required: true,
    },
    activityType: {
      type: [String],
      required: true,
    },
    address: {
      type: String, // Full address of the meetup location
      required: true,
    },
    city: {
      type: String,
    },
    zipCode: {
      type: String,
    },
    availableDays: {
      type: String,
      enum: ['EveryDay', 'Weekdays', 'Weekends', 'MWF', 'TTS'],
      required: true,
    },
    availableTimeSlot: {
      type: String,
      enum: ['Morning', 'Evening'],
      required: true,
    },
    minExperienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    maxMembers: {
      type: Number,
      required: true,
    },
    currentMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    currentMembersCount: {
      type: Number,
      default: 1,
    },
    rules: {
      type: [String], // Example: ["Bring your own equipment", "Be punctual"]
      required: true
    },
  },
  { timestamps: true },
);

export const CreateFitnessGroup = mongoose.model(
  'CreateFitnessGroup',
  createFitnessGroupSchema,
);
