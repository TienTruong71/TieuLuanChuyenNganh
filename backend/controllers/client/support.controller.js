import asyncHandler from 'express-async-handler';
import SupportRequest from '../../models/supportRequestModel.js';

// @desc    Tạo yêu cầu hỗ trợ mới (bắt đầu chat)
// @route   POST /api/client/support
// @access  Private
export const createSupportRequest = asyncHandler(async (req, res) => {
  const { message } = req.body;

  console.log('📝 Creating support request:', { userId: req.user._id, message });

  if (!message || message.trim() === '') {
    res.status(400);
    throw new Error('Vui lòng nhập nội dung yêu cầu hỗ trợ');
  }

  const supportRequest = await SupportRequest.create({
    user: req.user._id,
    initialMessage: message,
    messages: [
      {
        sender: req.user._id,
        senderName: req.user.name || req.user.username,
        senderRole: 'customer',
        text: message,
        timestamp: new Date(),
      },
    ],
    status: 'pending',
  });

  const populatedRequest = await SupportRequest.findById(supportRequest._id)
    .populate('user', 'username email')
    .populate('messages.sender', 'username email');

  console.log('✅ Support request created:', populatedRequest);

  res.status(201).json({
    message: 'Yêu cầu hỗ trợ đã được tạo',
    supportRequest: populatedRequest,
  });
});

// @desc    Lấy yêu cầu hỗ trợ đang mở của user
// @route   GET /api/client/support/active
// @access  Private
export const getActiveSupportRequest = asyncHandler(async (req, res) => {
  console.log('📂 Getting active support request for user:', req.user._id);
  
  const activeRequest = await SupportRequest.findOne({
    user: req.user._id,
    status: { $in: ['pending', 'in_progress'] }
  })
    .populate('user', 'username email')
    .populate('messages.sender', 'username email');

  console.log('✅ Active request:', activeRequest);

  res.json({
    activeRequest: activeRequest || null,
  });
});

// @desc    Gửi tin nhắn trong support chat
// @route   POST /api/client/support/:id/message
// @access  Private
export const sendSupportMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;

  console.log('💬 Sending support message:', { requestId: req.params.id, text });

  if (!text || text.trim() === '') {
    res.status(400);
    throw new Error('Vui lòng nhập nội dung tin nhắn');
  }

  const supportRequest = await SupportRequest.findById(req.params.id);

  if (!supportRequest) {
    res.status(404);
    throw new Error('Yêu cầu hỗ trợ không tồn tại');
  }

  // Kiểm tra owner
  if (supportRequest.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Không có quyền gửi tin nhắn cho yêu cầu này');
  }

  if (supportRequest.status === 'resolved') {
    res.status(400);
    throw new Error('Yêu cầu đã được đóng');
  }

  supportRequest.messages.push({
    sender: req.user._id,
    senderName: req.user.name || req.user.username,
    senderRole: 'customer',
    text: text.trim(),
    timestamp: new Date(),
  });

  await supportRequest.save();

  const updatedRequest = await SupportRequest.findById(supportRequest._id)
    .populate('user', 'username email')
    .populate('messages.sender', 'username email');

  console.log('✅ Message sent:', updatedRequest);

  res.json({
    message: 'Tin nhắn đã được gửi',
    supportRequest: updatedRequest,
  });
});

// @desc    Đóng yêu cầu hỗ trợ
// @route   PUT /api/client/support/:id/close
// @access  Private
export const closeSupportRequest = asyncHandler(async (req, res) => {
  console.log('🔒 Closing support request:', req.params.id);
  
  const supportRequest = await SupportRequest.findById(req.params.id);

  if (!supportRequest) {
    res.status(404);
    throw new Error('Yêu cầu hỗ trợ không tồn tại');
  }

  // Kiểm tra owner
  if (supportRequest.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Không có quyền đóng yêu cầu này');
  }

  supportRequest.status = 'resolved';
  await supportRequest.save();

  const updatedRequest = await SupportRequest.findById(supportRequest._id)
    .populate('user', 'username email')
    .populate('messages.sender', 'username email');

  console.log('✅ Support request closed:', updatedRequest);

  res.json({
    message: 'Đã đóng yêu cầu hỗ trợ',
    supportRequest: updatedRequest,
  });
});
