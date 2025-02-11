import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    default: 'Male',
    required: true,
  },
  bio: {
    type: String,
  },
  preference: {
    type: String,
    enum: ['WorkoutBuddy', 'FitnessGroup'],
    default: 'WorkoutBuddy',
    required: true,
  },
  fitnessGoals: {
    type: String,
    enum: ['WeightLoss', 'MuscleGain', 'Endurance'],
    default: 'WeightLoss',
    required: true,
  },
  workoutPreferences: {
    type: [String],
    required: true,
  },
  availableDays: {
    type: String,
    enum: ['EveryDay', 'Weekdays', 'Weekends', 'MWF', 'TTS'],
    default: 'Weekends',
    required: true,
  },
  availableTimeSlot: {
    type: String,
    enum: ['Morning', 'Evening', 'Afternoon'],
    default: 'Morning',
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
    default: 'Beginner',
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
  //I have made these fields for email Verification but Since I do not have a domain name,
  //  It can only send email to my mail ID
  //Therefore I have commented these fields
  // isVerified: {
  //   type: Boolean,
  //   default: false,
  // },
  // resetPasswordToken: {
  //   type: String,
  // },
  // resetPasswordExpiresAt: {
  //   type: Date,
  // },
  // verificationToken: {
  //   type: String,
  // },
  // verificationTokenExpiresAt: {
  //   type: Date,
  // },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10); // Generate a salt
  this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
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
