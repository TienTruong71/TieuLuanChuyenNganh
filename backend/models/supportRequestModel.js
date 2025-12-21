import mongoose from 'mongoose';

const supportRequestSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    initialMessage: {
      type: String,
      required: true,
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'User',
        },
        senderName: String,
        senderRole: {
          type: String,
          enum: ['customer', 'admin', 'staff'],
          default: 'customer',
        },
        text: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const SupportRequest = mongoose.model('SupportRequest', supportRequestSchema);

export default SupportRequest;

