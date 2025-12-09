import Feedback from '../../../models/feedbackModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Lấy tất cả feedback
// @route   GET /api/feedbacks
// @access  Manager, Staff
export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate('user_id', 'username full_name')
    .populate('product_id', 'product_name')
    .populate('service_id', 'service_name');

  res.json(feedbacks);
});

// @desc    Lấy chi tiết feedback theo ID
// @route   GET /api/feedbacks/:id
// @access  Manager, Staff
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('user_id', 'username full_name')
    .populate('product_id', 'product_name')
    .populate('service_id', 'service_name');

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }
  res.json(feedback);
});

// @desc    Duyệt feedback
// @route   PUT /api/feedbacks/:id/approve
// @access  Manager, Staff
export const approveFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  if (feedback.status !== 'pending') {
    res.status(400);
    throw new Error('Chỉ có thể duyệt feedback đang chờ');
  }

  feedback.status = 'approved';
  const updatedFeedback = await feedback.save();
  res.json({ message: 'Feedback approved successfully', updatedFeedback });
});

// @desc    Xóa feedback
// @route   DELETE /api/feedbacks/:id
// @access  Manager, Staff
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findByIdAndDelete(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  res.json({ message: 'Feedback removed successfully' });
});