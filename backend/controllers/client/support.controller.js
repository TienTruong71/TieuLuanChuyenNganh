import asyncHandler from 'express-async-handler';
import SupportRequest from '../../models/supportRequestModel.js'; // model MongoDB cho support request

// @desc    Gửi yêu cầu hỗ trợ
// @route   POST /api/client/support
// @access  Private (Registered Customer)
export const createSupportRequest = asyncHandler(async (req, res) => {
  const { message } = req.body;

  // Kiểm tra nội dung
  if (!message || message.trim() === '') {
    res.status(400);
    throw new Error('Vui lòng nhập nội dung yêu cầu hỗ trợ');
  }

  const supportRequest = await SupportRequest.create({
    user: req.user._id, // từ authMiddleware
    message,
    status: 'pending', // trạng thái mặc định
    createdAt: new Date(),
  });

  res.status(201).json({
    message: 'Yêu cầu hỗ trợ đã được gửi',
    supportRequest,
  });
});
