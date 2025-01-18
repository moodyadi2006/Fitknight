import { User } from '../models/user.model.js';
import { WorkoutBuddy } from '../models/workoutBuddy.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find().sort({ createdAt: -1 });
    return res
      .status(200)
      .json(new ApiResponse(200, 'Users fetched successfully', users));
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve groups' });
  }
});

const createBuddy = asyncHandler(async (req, res) => {
  const { buddyId } = req.query;
  const { userId, status } = req.body;
  if (!buddyId || !userId) {
    console.log('Both sender and reciever IDs are required');
  }
  const buddyRequest = await WorkoutBuddy.create({
    userId: userId,
    buddyId: buddyId,
    status: status,
  });
  return res
    .status(200)
    .json(
      new ApiResponse(200, 'Buddy Request sent successfully', buddyRequest),
    );
});

const getBuddyStatus = asyncHandler(async (req, res) => {
  const { buddyId, userId } = req.query;

  if (!buddyId || !userId) {
    // Send a 400 Bad Request response if buddyId or userId is missing
    return res
      .status(400)
      .json({ message: 'Buddy ID and User ID are required' });
  }

  try {
    // Find the workout buddy where all fields are present
    const response = await WorkoutBuddy.findOne({
      buddyId,
      userId,
    });

    if (!response) {
      // If no buddy is found, send a 404 Not Found response
      return res.status(404).json({ message: 'Buddy not found' });
    }

    // Send the found buddy's data as the response
    return res.status(200).json(response);
  } catch (error) {
    // Handle potential errors, such as invalid buddyId or database issues
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
});

const undoRequest = asyncHandler(async (req, res) => {
  const { userId, buddyId } = req.body; // Assuming buddyId should also be passed
  // Make sure both userId and buddyId are passed
  if (!userId || !buddyId) {
    return res
      .status(400)
      .json(new ApiError(400, 'Both userId and buddyId must be provided'));
  }

  // Find and delete the buddy relationship where either userId or buddyId matches
  const response = await WorkoutBuddy.deleteMany({
    $and: [{ userId }, { buddyId }], // Delete when both userId and buddyId match
  });
  // If no buddy relationship was found, send a 404 response
  if (!response) {
    return res
      .status(404)
      .json(new ApiError(404, 'No buddy relationship found'));
  }

  // Send a success response with the result of the deletion
  return res.status(200).json(new ApiResponse(200, 'Request Undone', response));
});

const getPendingRequests = asyncHandler(async (req, res) => {
  try {
    const buddyId = req.query.userId;
    // Query the database to find all requests where status is 'pending'
    const pendingRequests = await WorkoutBuddy.find({
      $and: [{ buddyId: buddyId }, { status: 'pending' }],
    });

    // If no requests are found, return a message
    if (!pendingRequests || pendingRequests.length === 0) {
      return res.status(404).json({ message: 'No pending requests found' });
    }

    // Send the list of pending requests as the response
    res.status(200).json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

const approveRequest = asyncHandler(async (req, res) => {
  const { id } = req.params; // Correctly extracting the ID from the request params

  // Finding the WorkoutBuddy by ID and updating the status
  const response = await WorkoutBuddy.findByIdAndUpdate(
    id, // Use the `id` directly here
    { status: 'accepted' }, // Correctly setting the `status` field
    { new: true }, // Optional: This will return the updated document instead of the original one
  );

  if (!response) {
    return res.status(404).json({ message: 'WorkoutBuddy not found' });
  }

  res.status(200).json(response); // Return the updated response
});

const rejectRequest = asyncHandler(async (req, res) => {
  const { id } = req.params; // Correctly extracting the ID from the request params

  // Finding the WorkoutBuddy by ID and updating the status
  const response = await WorkoutBuddy.findByIdAndUpdate(
    id, // Use the `id` directly here
    { status: 'rejected' }, // Correctly setting the `status` field
    { new: true }, // Optional: This will return the updated document instead of the original one
  );

  if (!response) {
    return res.status(404).json({ message: 'WorkoutBuddy not found' });
  }

  res.status(200).json(response); // Return the updated response
});

const getApprovedBuddies = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; 
    const approvedBuddies = await WorkoutBuddy.find({
      $or: [{ userId: userId }, { buddyId: userId }],
      status: 'accepted',
    });

    // Check if no approved buddies are found
    if (approvedBuddies.length === 0) {
      return res.status(404).json({ message: 'No approved buddies found.' });
    }

    // Send the approved buddies as a response
    return res.status(200).json(approvedBuddies);
  } catch (error) {
    // Handle any errors that occur during the database query
    res.status(500).json({
      message: 'Server error. Could not fetch approved buddies.',
      error: error.message,
    });
  }
});

const search = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.name; // Get the 'name' query parameter
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json(new ApiResponse(400, 'Keyword is required'));
    }

    const users = await User.find({
      $or: [
        { username: { $regex: keyword, $options: 'i' } }, // Case-insensitive match
        { bio: { $regex: keyword, $options: 'i' } },
      ],
    });
    return res.status(200).json(new ApiResponse(200, 'Users found', users));
  } catch (error) {
    console.error('Error searching groups:', error);
    throw new ApiError(500, 'An error occurred while searching groups');
  }
});

const getRequestUserId = asyncHandler(async (req, res) => {
  try {
    const { userId, buddyId, status } = req.query; // Get the 'buddyId' query parameter
    if (!userId || userId.trim() === '' || !buddyId || buddyId.trim() === '') {
      return res.status(400).json(new ApiResponse(400, 'buddyId is required'));
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, 'Invalid buddyId format'));
    }
    if (!mongoose.Types.ObjectId.isValid(buddyId)) {
      return res
        .status(400)
        .json(new ApiResponse(400, 'Invalid buddyId format'));
    }

    // Query using ObjectId
    const users = await WorkoutBuddy.findOne({
      $or: [
        { $and: [{ userId: userId }, { buddyId: buddyId }] },
        { $and: [{ userId: buddyId }, { buddyId: userId }] },
      ],
      status: 'accepted',
    });
    if (users) {
      return res.status(200).json(new ApiResponse(200, 'User found', users));
    } else {
      if (status === 'pending') {
        return res
          .status(400)
          .json(new ApiResponse(400, 'Still pending', status));
      }

      if (!users) {
        return res.status(404).json(new ApiError(404, 'User not found'));
      }
    }
  } catch (error) {
    console.error('Error searching user:', error);
    return res
      .status(500)
      .json(new Error(500, 'An error occurred while searching users'));
  }
});

export {
  getAllUsers,
  getBuddyStatus,
  undoRequest,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  createBuddy,
  getApprovedBuddies,
  search,
  getRequestUserId,
};
