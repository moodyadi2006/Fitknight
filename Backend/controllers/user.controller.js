import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import {
  uploadOnCloudinary,
  uploadLocalImageOnCloudinary,
} from '../utils/cloudinary.js';
import { CreateFitnessGroup } from '../models/createFitnessGroup.model.js';
import GroupRequest from '../models/groupRequest.model.js';
//import { joinRequestEmail, sendVerificationEmail } from '../mailTrap/emails.js';
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while generating tokens');
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    fullName,
    gender,
    bio,
    preference,
    password,
    fitnessGoals,
    workoutPreferences,
    availableDays,
    availableTimeSlot,
    experienceLevel,
    phoneNumber,
  } = req.body;

  if (
    username === '' ||
    email === '' ||
    fullName === '' ||
    gender === '' ||
    bio === '' ||
    preference === '' ||
    password === '' ||
    fitnessGoals === '' ||
    workoutPreferences.length === 0 ||
    availableDays === '' ||
    availableTimeSlot === '' ||
    experienceLevel === '' ||
    phoneNumber === ''
  ) {
    return res.status(400).json(new ApiError(400, 'All fields are required'));
  }

  const workoutSplit = workoutPreferences.split(',');
  const verificationToken = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    if (existingUser.username === username && existingUser.email === email) {
      return res
        .status(409)
        .json(new ApiError(409, 'Both Username and Email already exist'));
    } else if (existingUser.username === username) {
      return res.status(410).json(new ApiError(409, 'Username already exists'));
    } else if (existingUser.email === email) {
      return res
        .status(411)
        .json(new ApiError(411, 'User Email already exists'));
    }
  }

  const profileLocalPath = req.file
    ? req.file.path
    : gender === 'Female'
      ? 'assets/female.png'
      : 'assets/male.png';

  let profile = '';
  if (req.file) {
    profile = await uploadOnCloudinary(profileLocalPath);
    if (!profile) {
      throw new ApiError(500, 'Error uploading profile picture');
    }
  } else {
    profile = await uploadLocalImageOnCloudinary(profileLocalPath);
    if (!profile) {
      throw new ApiError(500, 'Error uploading profile picture');
    }
  }

  //sendVerificationEmail(email, verificationToken);

  const user = await User.create({
    fullName,
    username,
    email,
    gender,
    profile: profile?.url,
    bio,
    password,
    preference,
    fitnessGoals,
    workoutPreferences: workoutSplit,
    availableDays,
    availableTimeSlot,
    experienceLevel,
    phoneNumber,
    allowChat: false,
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });

  const createdUser = await User.findById(user._id).select(
    '-refreshToken -accessToken',
  );

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while registering the user');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(200, 'User registered successfully', {
        user: createdUser,
        accessToken,
        refreshToken,
      }),
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.body;
  try {
    const user = await User.findOne({ verificationToken: verificationToken });
    console.log(user);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (Date.now() > user.verificationTokenExpiresAt) {
      throw new ApiError(400, 'Verification token has expired');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
    );

    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpiresAt = null;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', refreshToken, options)
      .json(new ApiResponse(200, 'User verified successfully', { user }));
  } catch (error) {
    throw new ApiError(500, 'Something went wrong while verifying the user');
  }
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (email === '' || password === '') {
    return res.status(400).json(new ApiError(400, 'All fields are required'));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json(new ApiError(404, 'Invalid Email'));
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.status(405).json(new ApiError(405, 'Invalid password'));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const verificationToken = Math.floor(
    100000 + Math.random() * 900000,
  ).toString();

  const loggedInUser = await User.findByIdAndUpdate(user._id, {
    verificationToken,
    verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
  }).select('-refreshToken');

  // try {
  //   sendVerificationEmail(email, verificationToken); // Ensure this function handles errors properly
  // } catch (err) {
  //   return next(new ApiError(500, 'Error sending verification email'));
  // }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only set to true in production
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(200, 'User logged in successfully', {
        user: loggedInUser,
        accessToken,
        refreshToken,
      }),
    );
});

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-refreshToken');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return res.status(200).json(new ApiResponse(200, 'User profile', user));
});

const getAnyProfile = asyncHandler(async (req, res) => {
  const memberId = req.params.id;
  if (!memberId) {
    throw new ApiError(404, 'Member not found');
  }
  const findMemberProfile =
    await User.findById(memberId).select('-refreshToken');
  if (!findMemberProfile) {
    throw new ApiError(404, 'User not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, 'User profile', findMemberProfile));
});

const getProfileWithUsername = asyncHandler(async (req, res) => {
  const username = req.query.username;
  if (!username) {
    throw new ApiError(404, 'Member not found');
  }
  const findMemberProfile = await User.findOne({ username }).select(
    '-refreshToken',
  );
  if (!findMemberProfile) {
    throw new ApiError(404, 'User not found');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, 'User profile', findMemberProfile));
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log('User:', req.user);
  if (!req.user) {
    return res
      .status(401)
      .json(new ApiResponse(401, 'User not authenticated', {}));
  }

  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
    isVerified: false,
  });

  // Clear cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  return res
    .status(200)
    .json(new ApiResponse(200, 'User logged out successfully', {}));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    fullName,
    bio,
    gender,
    preference,
    availableDays,
    fitnessGoals,
    workoutPreferences,
    availableTimeSlot,
    experienceLevel,
    phoneNumber,
    allowChat,
  } = req.body;

  // Update only the provided fields
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName,
        bio,
        gender,
        preference,
        availableDays,
        availableTimeSlot,
        experienceLevel,
        phoneNumber,
        allowChat,
        fitnessGoals,
        workoutPreferences,
      },
    },
    {
      new: true,
    },
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'User details updated', updatedUser));
});

const updateProfile = asyncHandler(async (req, res) => {
  const profileLocalPath = req.file?.path;

  if (!profileLocalPath) {
    throw new ApiError(400, 'Please provide profile');
  }

  const profile = await uploadOnCloudinary(profileLocalPath);

  if (!profile.url) {
    throw new ApiError(400, 'Error while uploading an avatar');
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { profile: profile.url } }, //This will return new updated user object. So, we can use it in our response
    { new: true },
  ).select('-password');

  return res
    .status(200)
    .json(new ApiResponse(200, 'Profile updated successfully', { user }));
});

const getUserGroups = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find groups where the user is the organizer or a member
  const groups = await CreateFitnessGroup.find({
    $or: [{ organizer: userId }, { currentMembers: userId }],
  }).populate('organizer currentMembers');

  if (!groups) {
    throw new ApiError(404, 'No groups found');
  }

  res
    .status(200)
    .json(new ApiResponse(200, 'Groups fetched successfully', groups));
});

const getPendingRequests = asyncHandler(async (req, res) => {
  try {
    const organizerId = req.user._id; // Assuming the user is the organizer
    // Fetch all pending requests for the organizer (groupId should match)
    const pendingRequests = await GroupRequest.find({
      organizerId,
      status: 'pending',
    })
      .populate('userId', 'fullName email') // Populate user details for the request
      .populate('groupId', 'groupName'); // Populate group details for the request

    if (!pendingRequests) {
      return res.status(404).json({ message: 'No pending requests found' });
    }

    res.status(200).json({
      message: 'Pending requests retrieved successfully',
      data: pendingRequests,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving requests' });
  }
});

const updateLocation = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { latitude, longitude } = req.body;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        location: { ltd: latitude, lng: longitude },
      },
    },
    {
      new: true,
    },
  );

  if (!updatedUser) {
    throw new ApiError(404, 'User not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'User location updated', updatedUser));
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  logoutUser,
  updateAccountDetails,
  updateProfile,
  getUserGroups,
  getPendingRequests,
  getAnyProfile,
  getProfileWithUsername,
  updateLocation,
};
