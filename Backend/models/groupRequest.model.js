import mongoose from 'mongoose';

const groupRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreateFitnessGroup',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'undone'],
      default: 'undone',
    },
  },
  { timestamps: true },
);

const GroupRequest = mongoose.model('GroupRequest', groupRequestSchema);

export default GroupRequest;
