import mongoose from 'mongoose';

const workoutBuddySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buddyId: {
      // Add a buddyId to track the other user in the relationship
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      // The status of the relationship (e.g., pending, accepted)
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'undone'],
      default: 'undone',
    },
  },
  { timestamps: true },
); // You may also want timestamps to track when buddy requests are created or updated

export const WorkoutBuddy = mongoose.model('WorkoutBuddy', workoutBuddySchema);
