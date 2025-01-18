import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { access } from 'fs';
import { type } from 'os';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  profile: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Others'],
    required: true,
  },
  bio: {
    type: String,
  },
  preference: {
    type: String,
    enum: ['WorkoutBuddy', 'FitnessGroup'],
    required: true,
  },
  fitnessGoals: {
    type: String,
    enum: ['WeightLoss', 'MuscleGain', 'Endurance'],
    required: true,
  },
  workoutPreferences: {
    type: [String],
    required: true,
  },
  availableDays: {
    type: String,
    enum: ['EveryDay', 'Weekdays', 'Weekends', 'MWF', 'TTS'],
    required: true,
  },
  availableTimeSlot: {
    type: String,
    enum: ['Morning', 'Evening', 'Afternoon'],
    required: true,
  },
  location: {
    ltd: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  experienceLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  allowChat: {
    type: String,
    enum: ['true', 'false'],
    required: true,
    default: 'false',
  },
  refreshToken: {
    type: String,
  },
  accessToken: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordExpiresAt: {
    type: Date,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpiresAt: {
    type: Date,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      //this is  payload
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
      profile: this.profile,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  ); //It is used to generate token
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model('User', userSchema);
