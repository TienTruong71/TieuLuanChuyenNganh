import Feedback from '../../../models/feedbackModel.js';
import asyncHandler from 'express-async-handler';

// @desc    Lấy tất cả feedback
// @route   GET /api/staff/sale/feedbacks
// @access  Sale Staff
export const getAllFeedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await Feedback.find()
    .populate('user_id', 'username')
    .populate('product_id', 'product_name')
    .populate('service_id', 'service_name')
    .sort({ createdAt: -1 }); // Sort mới nhất lên đầu
  res.json(feedbacks);
});

// @desc    Lấy chi tiết feedback theo ID
// @route   GET /api/staff/sale/feedbacks/:id
// @access  Sale Staff
export const getFeedbackById = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id)
    .populate('user_id', 'username')
    .populate('product_id', 'product_name')
    .populate('service_id', 'service_name');

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }
  res.json(feedback);
});

// @desc    Duyệt feedback
// @route   PUT /api/staff/sale/feedbacks/:id/approve
// @access  Sale Staff
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
// @route   DELETE /api/staff/sale/feedbacks/:id
// @access  Sale Staff
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    res.status(404);
    throw new Error('Feedback not found');
  }

  // Sử dụng deleteOne() thay vì remove() vì remove() đã deprecated trong Mongoose mới
  await feedback.deleteOne();
  res.json({ message: 'Feedback removed' });
});
