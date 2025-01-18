import { joinRequestEmail } from '../mailTrap/emails.js';
import { CreateFitnessGroup } from '../models/createFitnessGroup.model.js';
import GroupRequest from '../models/groupRequest.model.js';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const registerGroup = asyncHandler(async (req, res) => {
  const {
    groupName,
    organizer,
    groupDescription,
    groupVisibility,
    activityGoals,
    activityType,
    address,
    city,
    zipCode,
    availableDays,
    availableTimeSlot,
    minExperienceLevel,
    maxMembers,
  } = req.body;

  if (
    groupName === '' ||
    groupDescription === '' ||
    availableDays === '' ||
    availableTimeSlot === '' ||
    minExperienceLevel === '' ||
    maxMembers === '' ||
    activityGoals === '' ||
    activityType.length === 0 ||
    address === '' ||
    city === '' ||
    zipCode === '' ||
    groupVisibility === ''
  ) {
    res.status(400);
    throw new ApiError('All fields are required');
  }

  const activityTypeSplit = activityType.split(',');

  const existingGroup = await CreateFitnessGroup.findOne({
    groupName: groupName,
  });
  if (existingGroup) {
    throw new ApiError(409, 'Group already exists');
  }

  const groupImageLocalPath = req.file ? req.file.path : null;
  let groupImage = '';
  if (groupImageLocalPath) {
    groupImage = await uploadOnCloudinary(groupImageLocalPath);
    if (!groupImage) {
      throw new ApiError(500, 'Error uploading group image');
    }
  }

  const user = await User.findOne({ fullName: req.body.organizer });
  if (!user) {
    throw new ApiError(404, 'Organizer not found');
  }

  const organizerID = user?._id;

  const group = await CreateFitnessGroup.create({
    groupName,
    organizer: organizerID,
    groupDescription,
    groupImage: groupImage?.url,
    activityGoals,
    activityType: activityTypeSplit,
    address,
    city,
    zipCode,
    groupVisibility,
    availableDays,
    availableTimeSlot,
    minExperienceLevel,
    maxMembers,
  });

  const createdGroup = await CreateFitnessGroup.findById(group._id).populate(
    'organizer',
  );

  if (!createdGroup) {
    throw new ApiError(500, 'Something went wrong while creating the group');
  }
  res
    .status(200)
    .json(new ApiResponse(200, 'Group created successfully', group));
});

const getAllGroups = asyncHandler(async (req, res) => {
  try {
    // Fetch all groups from the database
    const groups = await CreateFitnessGroup.find()
      .sort({ createdAt: -1 })
      .populate('organizer', 'fullName'); // Sorting by creation date (newest first)
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve groups' });
  }
});

const sendRequest = asyncHandler(async (req, res) => {
  try {
    const { groupId, organizerId, status } = req.body;
    const userId = req.user._id; // Assuming the user is authenticated

    // Logic to send a request (e.g., store it in a database or send an email to the organizer)
    const organizer = await User.findById(organizerId);
    if (!organizer) {
      return res.status(404).json({ message: 'Organizer not found' });
    }

    const requests = await GroupRequest.create({
      groupId,
      userId,
      status,
    });
    // await joinRequestEmail(req.user.fullName, req.body.groupName, organizer.email);

    // Respond to the client
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          'Request sent to the organizer successfully!',
          requests,
        ),
      );
  } catch (error) {
    console.error('Error sending request:', error);
    res.status(500).json({ message: 'Error sending request' });
  }
});

const undoRequest = asyncHandler(async (req, res) => {
  const { groupId } = req.body;
  const userId = req.user._id;
  try {
    // Check if the user has already sent a request for the group
    const groupRequest = await GroupRequest.findOne({
      userId,
      groupId,
      status: 'pending',
    });

    if (!groupRequest) {
      return res
        .status(404)
        .json({ message: 'No pending request found to undo.' });
    }

    // Delete the request from the database
    await GroupRequest.deleteOne({ _id: groupRequest._id });

    return res.status(200).json({ message: 'Request undone successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to undo request.' });
  }
});

const getRequests = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch requests and populate user and group details
    const requests = await GroupRequest.find({ groupId: id }).populate(
      'userId',
      'fullName profile username',
    ); // Populate user details

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error retrieving requests:', error);
    res.status(500).json({ message: 'Failed to retrieve requests' });
  }
});

const handleApprove = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  try {
    const response = await GroupRequest.updateOne(
      { _id: requestId },
      { status: 'accepted' },
    );
    res.status(200).json(new ApiResponse(200, 'Request approved successfully'));
  } catch (error) {
    console.error('Error approving request:', error);
    res
      .status(500)
      .json(new ApiError(500, 'Error approving request', error.message));
  }
});

const handleReject = asyncHandler(async (req, res) => {
  const requestId = req.params.id;
  try {
    await GroupRequest.updateOne({ _id: requestId }, { status: 'rejected' });
    res.status(200).json(new ApiResponse(200, 'Request rejected successfully'));
  } catch (error) {
    console.error('Error rejecting request:', error);
    res
      .status(500)
      .json(new ApiError(500, 'Error rejecting request', error.message));
  }
});

const getRequestResult = asyncHandler(async (req, res) => {
  const organizerId = req.body.organizer;
  try {
    // Find the group by organizerId and populate the organizer's fullName
    const group = await CreateFitnessGroup.findOne({
      organizer: organizerId,
    }).populate('organizer', 'fullName _id');

    // Check if group was found
    if (!group) {
      return res.status(404).json({
        status: 404,
        message: 'Group not found for the given organizer',
      });
    }

    // Get groupId from the found group
    const groupId = group._id;

    // Find all requests associated with the groupId and populate the userId's fullName
    const requests = await GroupRequest.find({ groupId }).populate(
      'userId',
      'fullName _id',
    ); // Populate fullName for userId in requests

    // Check if no requests were found
    if (!requests || requests.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No requests found for the given group ID',
      });
    }

    // Filter accepted requests and include only user fullName
    const acceptedRequests = requests
      .filter((request) => request.status === 'accepted')
      .map((request) => ({
        fullName: request.userId.fullName, // Get fullName of user
        _id: request.userId._id,
      }));

    // Return the organizer's fullName and accepted members' fullNames
    return res.status(200).json({
      status: 200,
      data: {
        organizer: group.organizer.fullName, // Return organizer's fullName
        acceptedMembers: acceptedRequests,
      },
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve requests',
    });
  }
});

const getUserStatus = asyncHandler(async (req, res) => {
  const { groupId } = req.query;
  const userId = req.user._id;

  // Validate groupId
  if (!groupId) {
    return res.status(400).json({ message: 'Group ID is required.' });
  }

  try {
    // Fetch the group request
    const groupRequest = await GroupRequest.findOne({ userId, groupId });
    if (!groupRequest) {
      return res
        .status(404)
        .json({ message: 'No request found for the specified group.' });
    }

    if (groupRequest.status === 'accepted') {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            'User status fetched successfully',
            groupRequest.status,
          ),
        );
    } else if (groupRequest.status === 'rejected') {
      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            'User status fetched successfully',
            groupRequest.status,
          ),
        );
    } else if (groupRequest.status === 'pending') {
      return res
        .status(202)
        .json(
          new ApiResponse(
            202,
            'User status fetched successfully',
            groupRequest.status,
          ),
        );
    } else {
      return res
        .status(203)
        .json(
          new ApiResponse(
            203,
            'User is still searching for a group to join',
            groupRequest.status,
          ),
        );
    }
  } catch (error) {
    console.error('Error fetching user status:', error);
    return res
      .status(500)
      .json({ message: 'An error occurred while fetching the user status.' });
  }
});

const updateMembersCount = asyncHandler(async (req, res) => {
  const { groupId } = req.body;

  try {
    await CreateFitnessGroup.findByIdAndUpdate(
      groupId,
      { $inc: { currentMembersCount: 1 } }, // Increment the count by 1
      { new: true }, // Return the updated document (optional)
    );

    res
      .status(200)
      .send({ message: 'Current members count updated successfully.' });
  } catch (error) {
    console.error('Error updating group members count:', error);
    res.status(500).send({ error: 'Failed to update group members count.' });
  }
});

const updateMembers = asyncHandler(async (req, res) => {
  const { groupId, userId } = req.body;

  if (!groupId || !userId) {
    return res
      .status(400)
      .send({ error: 'Group ID and User ID are required.' });
  }

  try {
    const updatedGroup = await CreateFitnessGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { currentMembers: userId } }, // Ensures no duplicate entries
      { new: true }, // Option is now placed correctly
    );

    if (!updatedGroup) {
      return res.status(404).send({ error: 'Group not found.' });
    }

    res.status(200).send({ message: 'User added to group successfully.' });
  } catch (error) {
    console.error('Error updating group members:', error);
    res.status(500).send({ error: 'Failed to update group members.' });
  }
});

const updateGroupDetails = asyncHandler(async (req, res) => {
  const organizerId = req.user._id; // Assuming req.user contains the authenticated user's details.
  // Find the group where the organizer's ObjectId matches the user's _id
  const group = await CreateFitnessGroup.findOne({
    organizer: organizerId,
  }).select('-refreshToken');

  const {
    groupName,
    groupDescription,
    activityType,
    activityGoals,
    availableDays,
    availableTimeSlot,
    minExperienceLevel,
    maxMembers,
    rules,
    address,
    city,
    zipCode,
    currentMembers,
    groupVisibility,
    currentMembersCount,
  } = req.body;

  // Update only the provided fields
  const updatedGroup = await CreateFitnessGroup.findByIdAndUpdate(
    group._id,
    {
      $set: {
        groupName,
        groupDescription,
        activityType,
        activityGoals,
        availableDays,
        availableTimeSlot,
        minExperienceLevel,
        maxMembers,
        rules,
        address,
        city,
        zipCode,
        currentMembers,
        groupVisibility,
        currentMembersCount,
      },
    },
    {
      new: true,
    },
  );

  if (!updatedGroup) {
    throw new ApiError(404, 'Group not found');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, 'Group details updated', updatedGroup));
});

const updateGroupImage = asyncHandler(async (req, res) => {
  console.log('File received:', req.file);

  // Ensure the file was uploaded
  const groupImageLocalPath = req.file?.path;
  if (!groupImageLocalPath) {
    throw new ApiError(400, 'Please provide a group image');
  }

  try {
    // Upload image to Cloudinary
    const groupImage = await uploadOnCloudinary(groupImageLocalPath);
    if (!groupImage.url) {
      throw new ApiError(400, 'Error while uploading the group image');
    }

    // Find the group using the organizer's ID
    const organizerId = req.user._id;
    const group = await CreateFitnessGroup.findOneAndUpdate(
      { organizer: organizerId }, // Match by organizer ID
      { $set: { groupImage: groupImage.url } }, // Update the group image
      { new: true }, // Return the updated group object
    );

    if (!group) {
      throw new ApiError(404, 'Group not found for the given organizer');
    }

    console.log('Updated Group:', group);

    // Send the updated group in the response
    return res
      .status(200)
      .json(new ApiResponse(200, 'Group image updated successfully', group));
  } catch (error) {
    console.error('Error in updateGroupImage:', error);
    throw new ApiError(500, 'An error occurred while updating the group image');
  }
});

const getGroupProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id; // Assuming req.user contains the authenticated user's details.
  const {groupName} = req.query;
  const group = await CreateFitnessGroup.findOne({
    groupName,
    $or: [
      { organizer: userId }, // The user is the organizer
      { currentMembers: userId }, // The user is a current member
    ],
  }).select('-refreshToken'); // Select the fields needed, excluding sensitive info like refreshToken

  if (!group) {
    throw new ApiError(404, 'Group not found or user does not have access');
  }

  // Return the group data as a response
  return res.status(200).json(new ApiResponse(200, 'Group profile', group));
});

const search = asyncHandler(async (req, res) => {
  try {
    const keyword = req.query.name; // Get the 'name' query parameter
    if (!keyword || keyword.trim() === '') {
      return res.status(400).json(new ApiResponse(400, 'Keyword is required'));
    }

    const groups = await CreateFitnessGroup.find({
      $or: [
        { groupName: { $regex: keyword, $options: 'i' } }, // Case-insensitive match
        { groupDescription: { $regex: keyword, $options: 'i' } },
      ],
    });
    return res.status(200).json(new ApiResponse(200, 'Groups found', groups));
  } catch (error) {
    console.error('Error searching groups:', error);
    throw new ApiError(500, 'An error occurred while searching groups');
  }
});

export {
  registerGroup,
  getAllGroups,
  sendRequest,
  undoRequest,
  getRequests,
  handleApprove,
  handleReject,
  getRequestResult,
  updateMembersCount,
  updateMembers,
  getUserStatus,
  updateGroupDetails,
  updateGroupImage,
  getGroupProfile,
  search,
};
