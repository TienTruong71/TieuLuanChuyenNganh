import SupportRequest from '../../../models/supportRequestModel.js';

// Lấy tất cả yêu cầu hỗ trợ
export const getAllSupportRequests = async (req, res) => {
  try {
    console.log(' Fetching all support requests...');
    const requests = await SupportRequest.find()
      .populate('user', 'username email')
      .populate('messages.sender', 'username email')
      .sort({ createdAt: -1 });

    console.log(`Found ${requests.length} support requests`);

    if (!requests.length) {
      return res.status(200).json({
        supportRequests: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalRequests: 0
        }
      });
    }

    res.json({
      supportRequests: requests,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRequests: requests.length
      }
    });
  } catch (error) {
    console.error(' Error fetching support requests:', error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết yêu cầu theo ID
export const getSupportRequestById = async (req, res) => {
  try {
    const request = await SupportRequest.findById(req.params.id)
      .populate('user', 'username email')
      .populate('messages.sender', 'username email');

    if (!request) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const replyAndResolveSupportRequest = async (req, res) => {
  try {
    const { text, status } = req.body;

    console.log('💬 Staff replying:', req.params.id, text);

    const request = await SupportRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Yêu cầu không tồn tại' });
    }

    if (text && text.trim()) {
      request.reply = text.trim();

      request.messages.push({
        sender: req.user._id,
        senderName: req.user.name || req.user.username,
        senderRole: 'staff',
        text: text.trim(),
        timestamp: new Date(),
      });
    }

    if (status) {
      request.status = status;
    } else if (request.status === 'pending') {
      request.status = 'in_progress';
    }
    request.updatedAt = Date.now();

    await request.save();

    const updatedRequest = await SupportRequest.findById(request._id)
      .populate('user', 'username email')
      .populate('messages.sender', 'username email');

    console.log('Support request updated successfully');

    res.json({
      message: 'Đã gửi phản hồi',
      supportRequest: updatedRequest
    });
  } catch (error) {
    console.error('Error replying to support request:', error);
    res.status(500).json({ message: error.message });
  }
};
