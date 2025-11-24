import Feedback from '../../../models/feedbackModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Lấy tất cả feedback
// @route   GET /api/feedbacks
// @access  Manager, Staff
export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate('user_id', 'username')
    .populate('product_id', 'name')
    .populate('service_id', 'name');
  res.json(feedbacks);
});

// @desc    Lấy chi tiết feedback theo ID
// @route   GET /api/feedbacks/:id
// @access  Manager, Staff
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('user_id', 'username')
    .populate('product_id', 'name')
    .populate('service_id', 'name');

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }
  res.json(feedback);
});

// @desc    Duyệt feedback
// @route   PUT /api/feedbacks/:id/approve
// @access  Manager, Staff
export const approveFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  feedback.status = 'approved';
  const updatedFeedback = await feedback.save();
  res.json(updatedFeedback);
});

// @desc    Xóa feedback
// @route   DELETE /api/feedbacks/:id
// @access  Manager, Staff
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  await feedback.remove();
  res.json({ message: 'Feedback removed' });
});
